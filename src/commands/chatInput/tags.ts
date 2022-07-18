import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  Formatters,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { findTag } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('tags')
    .setDescription('Manages tags')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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
  async listener(interaction, client) {
    const subcommand = interaction.options.getSubcommand(true);
    const { guildId } = interaction;
    if (subcommand === 'create') {
      const modal = new ModalBuilder().setCustomId('create-tag').setTitle('Adding a new tag');
      const name = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel('Name')
          .setMaxLength(100)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      );
      const keywords = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('keywords')
          .setLabel('Keywords (Separate with a comma)')
          .setStyle(TextInputStyle.Short)
      );
      const content = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('content')
          .setLabel('Content')
          .setMaxLength(2000)
          .setMinLength(1)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      );
      modal.setComponents(name, keywords, content);

      interaction.showModal(modal);
    } else if (subcommand === 'delete') {
      const tag = await findTag(interaction, client);
      if (!tag) return;

      const { name } = tag;
      await client.database.tags.findOneAndDelete({ name, guildId });
      interaction.reply({
        content: `Tag with name ${Formatters.inlineCode(name)} successfully deleted!`,
        ephemeral: true,
      });
    } else if (subcommand === 'edit') {
      const tag = await findTag(interaction, client);
      if (!tag) return;

      const modal = new ModalBuilder().setCustomId(`edit-tag:${tag.name}`).setTitle(`Editing the ${tag.name} tag`);
      const name = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel('Name')
          .setValue(tag.name)
          .setMaxLength(100)
          .setMinLength(1)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      );
      const keywords = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('keywords')
          .setLabel('Keywords (Separate with a comma)')
          .setValue(tag.keywords?.join(', ') ?? '')
          .setStyle(TextInputStyle.Short)
      );
      const content = new ActionRowBuilder<TextInputBuilder>().setComponents(
        new TextInputBuilder()
          .setCustomId('content')
          .setLabel('Content')
          .setValue(tag.content)
          .setMaxLength(2000)
          .setMinLength(1)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      );
      modal.setComponents(name, keywords, content);

      interaction.showModal(modal);
    }
  },
};
