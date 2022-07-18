import { SlashCommandBuilder } from '@discordjs/builders';
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
    ),
  async listener(interaction, client) {
    const tag = await findTag(interaction, client);
    if (!tag) return;

    interaction.reply(tag.content);
  },
};
