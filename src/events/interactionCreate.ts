import process from 'node:process';
import { inspect } from 'node:util';
import { Colors, EmbedBuilder, codeBlock } from 'discord.js';
import type { UpdateFilter } from 'mongodb';
import type { TagSchema } from '../util/DatabaseClient';
import type { GetStringFunctionOptions, PojavStringsFile } from '../util/LocalizationManager';
import { getLogsChannel, makeTagData, resolveLocale } from '../util/Util';
import type { PojavEvent } from '.';

export const event: PojavEvent<'interactionCreate'> = {
  async listener(client, interaction) {
    if (!interaction.inCachedGuild()) return;

    const { guildId } = interaction;
    const dbGuild = await client.database.guilds.findOne({ id: guildId });

    function getString(
      key: keyof PojavStringsFile,
      { locale = resolveLocale(dbGuild?.locale), variables }: Partial<GetStringFunctionOptions> = {}
    ) {
      return client.localizations.getString(key, { locale, variables });
    }

    if (interaction.isAutocomplete()) {
      const { commandName } = interaction;
      const value = interaction.options.getFocused();
      if (['tag', 'tags'].includes(commandName)) {
        const tags = await client.database.tags.find({ guildId }).toArray();
        const lowerValue = value.toLowerCase();
        const exactQueries: { name: string; value: string }[] = [];
        const queryMatches: { name: string; value: string }[] = [];
        const contentMatches: { name: string; value: string }[] = [];

        for (const tag of tags) {
          const { name } = tag;
          const exactQuery =
            tag.name.toLowerCase() === lowerValue ||
            tag.keywords?.find((keyword) => keyword.toLowerCase() === lowerValue);
          const queryMatch =
            tag.name.toLowerCase().includes(lowerValue) ||
            tag.keywords?.find((keyword) => keyword.toLowerCase().includes(lowerValue));
          const contentMatch = tag.content?.toLowerCase().includes(lowerValue);
          if (exactQuery) {
            exactQueries.push({ name: `✅ ${name}`, value: name });
          } else if (queryMatch) {
            queryMatches.push({ name: `🔑 ${name}`, value: name });
          } else if (contentMatch) {
            contentMatches.push({ name: `📄 ${name}`, value: name });
          }
        }

        const results: { name: string; value: string }[] = [...exactQueries, ...queryMatches, ...contentMatches];
        await interaction.respond(results.slice(0, 25));
      }
    } else if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      const comamnd = client.commands.get(commandName);
      if (!comamnd) return;

      try {
        await comamnd.listener(interaction, { client, getString });
      } catch (error) {
        if (process.env.NODE_ENV === 'production') {
          const logsChannel = await getLogsChannel(client);
          if (!logsChannel) return;

          const embed = new EmbedBuilder()
            .setTitle(`An unexpected error occurred while running a command`)
            .setFields([
              {
                name: 'Command name',
                value: commandName,
              },
              {
                name: 'Error',
                value: codeBlock(inspect(error).slice(0, 1_017)),
              },
            ])
            .setColor(Colors.Red);

          await logsChannel.send({ embeds: [embed] });
        }

        console.log(error);
      }
    } else if (interaction.isModalSubmit()) {
      const [action, data] = interaction.customId.split(':') as [string, string | undefined];

      if (action === 'create-tag') {
        const name = interaction.fields.getTextInputValue('name');
        const existing = await client.database.tags.findOne({ name, guildId });
        if (existing) {
          return void interaction.reply({
            content: getString('events.interactionCreate.tagExists', { variables: { name } }),
            ephemeral: true,
          });
        }

        const tagData = makeTagData(interaction);
        await client.database.tags.insertOne(tagData);
        await interaction.reply({
          content: getString('events.interactionCreate.created', { variables: { name } }),
          ephemeral: true,
        });
      } else if (action === 'edit-tag') {
        const existing = await client.database.tags.findOne({ name: data!, guildId });
        if (!existing)
          return void interaction.reply({
            content: getString('events.interactionCreate.tagNotExists', {
              variables: { name: data! },
            }),
            ephemeral: true,
          });

        const tagData = makeTagData(interaction);
        await client.database.tags.findOneAndUpdate(
          { name: data!, guildId },
          { $set: tagData as UpdateFilter<TagSchema> }
        );
        await interaction.reply({
          content: getString('events.interactionCreate.tagEdited', { variables: { name: tagData.name } }),
          ephemeral: true,
        });
      }
    } else if (interaction.isStringSelectMenu() && interaction.customId === 'select-menu') {
      await interaction.deferReply({ ephemeral: true });

      const roles = interaction.component.options
        .filter((option) => option.value.startsWith('role-add'))
        .map((option) => option.value.split(':')[1]!);
      const rolesToAdd = roles.filter((roleId) => interaction.values.includes(`role-add:${roleId}`));
      const rolesToRemove = roles.filter((roleId) => !interaction.values.includes(`role-add:${roleId}`));

      await interaction.member.roles.add(rolesToAdd);
      await interaction.member.roles.remove(rolesToRemove);

      await interaction.editReply({
        content: getString('events.interactionCreate.rolesUpdated', {
          variables: {
            count: rolesToAdd.length,
            roles: rolesToAdd.map((value) => `<@&${value}>`).join(', '),
          },
        }),
      });

      const strings = interaction.values
        .filter((value) => value.startsWith('string'))
        .map((value) => value.split(':')[1]);

      for (const string of strings) {
        if (string === 'russian-server') {
          await interaction.followUp({
            content: 'Вот ссылка на русский сервер: https://discord.gg/UFZrUJXKRG',
            ephemeral: true,
          });
        }
      }
    }
  },
};
