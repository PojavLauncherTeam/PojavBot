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
        console.log(`Something went wrong while executing the ${commandName} command`);
        console.log(error);
      }
    }
  },
};
