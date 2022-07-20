import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  Formatters,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import type { PojavChatInputCommand } from '..';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Gives the bot status')
    .addUserOption((option) => option.setName('user').setDescription('User to report').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason of report').setRequired(true))
    .addAttachmentOption((option) => option.setName('proof').setDescription('Proof for report. Must be image or gif')),

  async listener(interaction, { client }) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const proof = interaction.options.getAttachment('proof');

    const embed = new EmbedBuilder().setTitle(`Do you really want to report ${user.username}?`).setFields([
      {
        name: 'Reason',
        value: reason,
      },
    ]);
    if (proof) embed.setImage(proof.url);
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('yes').setLabel('Yes').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('no').setLabel('No').setStyle(ButtonStyle.Danger)
    );
    const message = await interaction.reply({
      embeds: [embed],
      components: [buttons],
      fetchReply: true,
      ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({ time: 60_000, max: 1 });

    collector.once('collect', async (buttonInteraction) => {
      if (buttonInteraction.customId == 'yes') {
        const embed = new EmbedBuilder()
          .setTitle('New user report')
          .setThumbnail(user.displayAvatarURL())
          .setFields([
            {
              name: 'Author',
              value: `${interaction.user} ${Formatters.inlineCode(interaction.user.tag)} (${interaction.user.id})`,
            },
            {
              name: 'User',
              value: `${user} ${Formatters.inlineCode(user.tag)} (${user.id})`,
            },
            {
              name: 'Reason',
              value: `${reason}`,
            },
          ]);

        if (proof && proof.contentType?.startsWith('image')) embed.setImage(proof.url);
        const dbGuild = await client.database.guilds.findOne({ id: interaction.guild.id });
        const logsChannel = client.channels.resolve(dbGuild?.logsChannelId!);
        if (logsChannel?.type !== ChannelType.GuildText) return;
        logsChannel.send({ embeds: [embed] });

        await buttonInteraction.update({
          content: 'Your report has been successfully sent',
          embeds: [],
          components: [],
        });
      } else if (buttonInteraction.customId == 'no')
        await buttonInteraction.update({ content: 'Your report has been canceled', embeds: [], components: [] });
    });

    collector.once('end', async (collected) => {
      if (collected.size < 1)
        await interaction.editReply({
          content: "You haven't clicked a button for too long. Your report has been canceled",
          embeds: [],
          components: [],
        });
    });
  },
};
