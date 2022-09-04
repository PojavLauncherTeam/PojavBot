import type { MessageOptions, GuildTextBasedChannel } from 'discord.js';
import { PermissionFlagsBits, ChannelType, SlashCommandBuilder } from 'discord.js';
import type { PojavChatInputCommand } from '..';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send the message')
    .addStringOption((option) => option.setName('content').setDescription('Content of the message'))
    .addAttachmentOption((option) => option.setName('attachemnt').setDescription('Attachment of the message'))
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to send the message in')
        .addChannelTypes(
          ChannelType.GuildNews,
          ChannelType.GuildNewsThread,
          ChannelType.GuildPrivateThread,
          ChannelType.GuildPublicThread,
          ChannelType.GuildText,
          ChannelType.GuildVoice
        )
    )
    .addStringOption((option) => option.setName('replyto').setDescription('Message id to reply to')),
  async listener(interaction, { client }) {
    const content = interaction.options.getString('content');
    const attachemnt = interaction.options.getAttachment('attachemnt');
    const channel = (interaction.options.getChannel('channel') as GuildTextBasedChannel | null) ?? interaction.channel!;
    const replyto = interaction.options.getString('replyto');

    if (!content || !attachemnt) {
      // TODO: Add to strings
      return void (await interaction.reply({
        content: 'One of content or attachment should be provided',
      }));
    }

    const messageOtions: MessageOptions = {};
    if (content) messageOtions.content = content;
    if (attachemnt) messageOtions.files = [attachemnt];
    if (replyto) messageOtions.reply = { messageReference: replyto, failIfNotExists: false };

    if (
      !channel.permissionsFor(client.user)!.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])
    ) {
      // TODO: Add to strings
      return void (await interaction.reply({
        content: "I don't have perms to send message in provided channel",
        ephemeral: true,
      }));
    }

    await channel.send(messageOtions);

    await interaction.reply({
      content: 'Sent',
      ephemeral: true,
    });
  },
};
