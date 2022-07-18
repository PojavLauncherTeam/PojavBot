import { type ColorResolvable, EmbedBuilder, Colors, SlashCommandBuilder } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { makeFormattedTime } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder().setName('status').setDescription('Gives the bot status'),
  async listener(interaction, client) {
    const firstTimestamp = Date.now();
    await interaction.deferReply();
    const ping = Date.now() - firstTimestamp;

    let color: ColorResolvable;
    if (ping >= 0 && ping < 250) color = Colors.Green;
    else if (ping < 500) color = Colors.Yellow;
    else color = Colors.Red;

    const embed = new EmbedBuilder()
      .setTitle('Status')
      .setFields([
        {
          name: 'My ping',
          value: `${ping}ms`,
        },
        {
          name: 'WebSoket ping',
          value: `${client.ws.ping}ms`,
        },
        {
          name: 'Online since',
          value: makeFormattedTime(client.readyTimestamp),
        },
      ])
      .setColor(color);
    await interaction.editReply({ embeds: [embed] });
  },
};
