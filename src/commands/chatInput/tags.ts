import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { findTag } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('tags')
    .setDescription('Manages tags')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) => subcommand.setName('create').setDescription('Creates a new tag'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Deletes a tag')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('Tag name or keyword you want to delete')
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edits a tag')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('Tag name or keyword you want to edit')
            .setAutocomplete(true)
            .setRequired(true)
        )
    ),
  async listener(interaction, { client, getString }) {
    const subcommand = interaction.options.getSubcommand(true);
    const { guildId } = interaction;
    if (subcommand === 'create') {
      const modal = new ModalBuilder().setCustomId('create-tag').setTitle(getString('commands.tags.creatingTag'));
      const name = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel(getString('commands.tags.name'))
          .setMaxLength(100)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
      );
      const keywords = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('keywords')
          .setLabel(getString('commands.tags.keywords'))
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      );
      const content = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('content')
          .setLabel(getString('commands.tags.content'))
          .setMaxLength(2000)
          .setMinLength(1)
          .setStyle(TextInputStyle.Paragraph)
      );
      modal.setComponents(name, keywords, content);

      interaction.showModal(modal);
    } else if (subcommand === 'delete') {
      const tag = await findTag(interaction, client);
      if (!tag) return;

      const { name } = tag;
      await client.database.tags.findOneAndDelete({ name, guildId });
      interaction.reply({
        content: getString('commands.tags.deleted', { variables: { name } }),
        ephemeral: true,
      });
    } else if (subcommand === 'edit') {
      const tag = await findTag(interaction, client);
      if (!tag) return;

      const modal = new ModalBuilder()
        .setCustomId(`edit-tag:${tag.name}`)
        .setTitle(getString('commands.tags.editingTag', { variables: { name: tag.name } }));
      const name = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel(getString('commands.tags.name'))
          .setValue(tag.name)
          .setMaxLength(100)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
      );
      const keywords = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('keywords')
          .setLabel(getString('commands.tags.keywords'))
          .setValue(tag.keywords?.join(', ') ?? '')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      );
      const content = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('content')
          .setLabel(getString('commands.tags.content'))
          .setValue(tag.content)
          .setMaxLength(2000)
          .setMinLength(1)
          .setStyle(TextInputStyle.Paragraph)
      );
      modal.setComponents(name, keywords, content);

      interaction.showModal(modal);
    }
  },
};
