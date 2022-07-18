import { ChannelType, Colors, EmbedBuilder, InteractionType, Formatters } from 'discord.js';
import type { UpdateFilter } from 'mongodb';
import { inspect } from 'util';
import type { PojavEvent } from '.';
import type { TagSchema } from '../util/DatabaseClient';
import { makeTagData } from '../util/Util';

export const event: PojavEvent<'interactionCreate'> = {
  async listener(client, interaction) {
    if (!interaction.inCachedGuild()) return;
    const { guildId } = interaction;
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
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
            tag.name.toLowerCase() === lowerValue || tag.keywords?.find((s) => s.toLowerCase() === lowerValue);
          const queryMatch =
            tag.name.toLowerCase().includes(lowerValue) ||
            tag.keywords?.find((s) => s.toLowerCase().includes(lowerValue));
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
        interaction.respond(results.slice(0, 25));
      }
    } else if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      const comamnd = client.commands.get(commandName);
      if (!comamnd) return;

      try {
        await comamnd.listener(interaction, client);
      } catch (error) {
        if (process.env.NODE_ENV === 'production') {
          const dbGuild = await client.database.guilds.findOne({ development: true });
          if (!dbGuild?.logsChannelId) return;

          const logsChannel = client.channels.resolve(dbGuild.logsChannelId);
          if (logsChannel?.type !== ChannelType.GuildText) return;

          const embed = new EmbedBuilder()
            .setTitle(`An unexpected error occurred while running a command`)
            .setFields([
              {
                name: 'Command name',
                value: commandName,
              },
              {
                name: 'Error',
                value: Formatters.codeBlock(inspect(error).substring(0, 1017)),
              },
            ])
            .setColor(Colors.Red);

          await logsChannel.send({ embeds: [embed] });
        }
        console.log(error);
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const [action, data] = interaction.customId.split(':') as [string, string | undefined];

      if (action === 'create-tag') {
        const name = interaction.fields.getTextInputValue('name');
        const existing = await client.database.tags.findOne({ name, guildId });
        if (existing)
          return interaction.reply({
            content: `There's already a tag with name ${Formatters.inlineCode(name)}`,
            ephemeral: true,
          });

        const tagData = makeTagData(interaction);
        await client.database.tags.insertOne(tagData);
        interaction.reply({
          content: `Tag with name ${Formatters.inlineCode(name)} successfully created!`,
          ephemeral: true,
        });
      } else if (action === 'edit-tag') {
        const existing = await client.database.tags.findOne({ name: data!, guildId });
        if (!existing)
          return interaction.reply({
            content: `There's no a tag with name ${Formatters.inlineCode(data!)}`,
            ephemeral: true,
          });

        const tagData = makeTagData(interaction);
        await client.database.tags.findOneAndUpdate(
          { name: data!, guildId },
          { $set: tagData as UpdateFilter<TagSchema> }
        );
        interaction.reply({
          content: `Tag with name ${Formatters.inlineCode(tagData.name)} successfully edited!`,
          ephemeral: true,
        });
      }
    }
  },
};
