import { SlashCommandBuilder } from '@discordjs/builders';
import { Formatters } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { findTag } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Sends a tag')
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Tag name or keyword you want to send')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addUserOption((option) => option.setName('target').setDescription('User to mention')),
  async listener(interaction, client) {
    const tag = await findTag(interaction, client);
    if (!tag) return;

    const target = interaction.options.getUser('target');
    interaction.reply(`${target ? `${Formatters.italic(`Tag suggestion for ${target}`)}\n` : ''}${tag.content}`);
  },
};
