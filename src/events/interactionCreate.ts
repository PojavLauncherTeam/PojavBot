import { Constants, Formatters, MessageEmbed } from 'discord.js';
import { inspect } from 'util';
import type { PojavEvent } from '.';

export const event: PojavEvent<'interactionCreate'> = {
  async listener(client, interaction) {
    if (!interaction.inCachedGuild()) return;
    if (interaction.isCommand()) {
      const { commandName } = interaction;
      const comamnd = client.commands.get(commandName);
      if (!comamnd) return;

      try {
        await comamnd.listener(interaction, client);
      } catch (error) {
        const dbGuild = await client.database.guilds.findOne({ development: true });
        if (!dbGuild?.logsChannelId) return;

        const logsChannel = client.channels.resolve(dbGuild.logsChannelId);
        if (!logsChannel?.isText()) return;

        const embed = new MessageEmbed()
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
          .setColor(Constants.Colors.RED);

        logsChannel.send({ embeds: [embed] });
      }
    }
  },
};
