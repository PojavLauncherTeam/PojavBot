import { SlashCommandBuilder } from '@discordjs/builders';
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
      option.setName('channel').setDescription('The target channel (default is the current channel)').setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('showexecutorname')
        .setDescription('Show who used this command to send a message on the mssage')
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
    ),
  async listener(interaction, { getString }) {
    const ephemeralnotices = interaction.options.getBoolean('ephemeralnotices') ? true : false;
    const channel = interaction.options.getChannel('channel')
      ? interaction.options.getChannel('channel')
      : interaction.channel;
    const message =
      interaction.options.getBoolean('showexecutorname') && interaction.options.getString('message')
        ? interaction.options.getString('message') + `\n\n(Sent by ${interaction.member}`
        : interaction.options.getBoolean('showexecutorname')
        ? `(Sent by ${interaction.member})`
        : '';
    await interaction.deferReply({ ephemeral: ephemeralnotices });

    if (!interaction.member.permissions.has('ManageMessages'))
      return interaction.editReply(getString('commands.say.nopermission'));
    if (interaction.options.getBoolean('showexecutorname') && !interaction.member.permissions.has('Administrator'))
      return interaction.editReply(getString('commands.say.nopermissionexecutornamehide'));
    if (!channel?.isTextBased()) return interaction.editReply(getString('commands.say.channelnottextbased'));
    if (message == '') return interaction.editReply(getString('commands.say.mustprovidemessage'));

    await channel?.send({ content: message, reply: { messageReference: interaction.options.getString('replyto')! } });
    return interaction.editReply(getString('commands.say.sendsuccess'));
  },
};
