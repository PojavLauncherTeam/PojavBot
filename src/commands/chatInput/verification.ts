import process from 'node:process';
import { SlashCommandBuilder } from 'discord.js';
import type { PojavChatInputCommand } from '..';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Verifies your ownership of Minecraft:Java Edtion!'),
  async listener(interaction, { getString }) {
    await interaction.reply({
      content: `[${getString(`commands.verification.click`)}](https://login.live.com/oauth20_authorize.srf?client_id=${
        process.env.clientId
      }&response_type=code&redirect_uri=${process.env.redirectUri}&scope=XboxLive.signin%20offline_access&state=${
        interaction.user.id
      }+${interaction.guild.id})`,
      ephemeral: true,
    });
  },
};
