import { ChannelType, Colors, EmbedBuilder, Formatters } from 'discord.js';
import { inspect } from 'util';
import type { PojavEvent } from '.';

export const event: PojavEvent<'interactionCreate'> = {
  async listener(client, interaction) {
    if (!interaction.inCachedGuild()) return;
    if (interaction.isChatInputCommand()) {
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
    }
  },
};
