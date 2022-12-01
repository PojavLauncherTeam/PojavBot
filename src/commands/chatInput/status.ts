import { EmbedBuilder, Colors, SlashCommandBuilder } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { makeFormattedTime } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder().setName('status').setDescription('Gives the bot status'),
  async listener(interaction, { client, getString }) {
    const firstTimestamp = Date.now();
    await interaction.deferReply();
    const ping = Date.now() - firstTimestamp;

    let color: number;
    if (ping >= 0 && ping < 250) color = Colors.Green;
    else if (ping < 500) color = Colors.Yellow;
    else color = Colors.Red;

    const embed = new EmbedBuilder()
      .setTitle(getString('commands.status.status'))
      .setFields(
        {
          name: getString('commands.status.myPing'),
          value: getString('commands.status.ping', { variables: { ms: ping } }),
        },
        {
          name: getString('commands.status.wsPing'),
          value: getString('commands.status.ping', {
            variables: { ms: client.ws.ping },
          }),
        },
        {
          name: getString('commands.status.onlineSince'),
          value: makeFormattedTime(client.readyTimestamp),
        }
      )
      .setColor(color);
    await interaction.editReply({ embeds: [embed] });
  },
};
