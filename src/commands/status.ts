import { SlashCommandBuilder } from '@discordjs/builders';
import { ColorResolvable, Constants, MessageEmbed } from 'discord.js';
import type { PojavCommand } from '.';
import { makeFormattedTime } from '../util/Util';

export const command: PojavCommand = {
  data: new SlashCommandBuilder().setName('status').setDescription('Gives the bot status'),
  async listener(interaction, client) {
    const firstTimestamp = Date.now();
    await interaction.deferReply();
    const ping = Date.now() - firstTimestamp;

    let color: ColorResolvable;
    if (ping >= 0 && ping < 250) color = Constants.Colors.GREEN;
    else if (ping < 500) color = Constants.Colors.YELLOW;
    else color = Constants.Colors.RED;

    const embed = new MessageEmbed()
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
