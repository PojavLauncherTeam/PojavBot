import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import type { PojavChatInputCommand } from '..';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message')
    .addStringOption((option) =>
      option.setName('message').setDescription('The message (required if no embed)').setRequired(false)
    )
    // .addStringOption(option => option.setName("embeds").setDescription("Embeds to include").setRequired(false))
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The target channel (default is the current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('ephemeralnotices')
        .setDescription('If true then error/success message only shown to you (ephmeral)')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('replyto')
        .setDescription('Message id of target reply if you need the message to be a reply')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
  async listener(interaction, { getString, client }) {
    const ephemeralnotices = interaction.options.getBoolean('ephemeralnotices') ? true : false;
    const channel = interaction.options.getChannel('channel')
      ? interaction.options.getChannel('channel')
      : interaction.channel;
    const message = interaction.options.getString('message') ? interaction.options.getString('message') : null;
    await interaction.deferReply({ ephemeral: ephemeralnotices });

    if (!channel?.isTextBased()) return interaction.editReply(getString('commands.say.channelnottextbased'));
    if (message == null) return interaction.editReply(getString('commands.say.mustprovidemessage'));

    const dbGuild = await client.database.guilds.findOne({ development: true });
    if (!dbGuild?.logsChannelId) return;
    const logsChannel = client.channels.resolve(dbGuild.logsChannelId);
    if (logsChannel?.type !== ChannelType.GuildText) return;
    logsChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Say command usage')
          .setDescription('A user ran the say command!')
          .setColor('Green')
          .setFields([
            {
              name: 'User',
              value: `<@${interaction.user.id}>`,
            },
            {
              name: 'Message',
              value: message,
            },
          ]),
      ],
    });

    await channel?.send({ content: message, reply: { messageReference: interaction.options.getString('replyto')! } });
    return interaction.editReply(getString('commands.say.sendsuccess'));
  },
};
