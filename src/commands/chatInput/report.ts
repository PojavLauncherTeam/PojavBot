import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  inlineCode,
  SlashCommandBuilder,
} from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { getReportsChannel } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Reports the user')
    .addUserOption((option) => option.setName('user').setDescription('User to report').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason of the report').setRequired(true))
    .addAttachmentOption((option) =>
      option.setName('proof').setDescription('Proof for the report. Must be image or gif')
    ),

  async listener(interaction, { client, getString }) {
    const user = interaction.options.getUser('user', true);
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason', true);
    const proof = interaction.options.getAttachment('proof');
    const proofURL = proof?.url ?? null;

    const doYouWantToReportEmbed = new EmbedBuilder()
      .setTitle(
        getString('commands.report.doYouWantTitle', { variables: { user: member?.displayName ?? user.username } })
      )
      .setFields({
        name: getString('commands.report.reason'),
        value: reason,
      })
      .setImage(proofURL);
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('yes').setLabel(getString('commands.report.yes')).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('no').setLabel(getString('commands.report.no')).setStyle(ButtonStyle.Danger)
    );
    const response = await interaction.reply({
      embeds: [doYouWantToReportEmbed],
      components: [buttons],
      ephemeral: true,
    });

    const buttonInteraction = await response
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60_000,
      })
      .catch(() => null);

    if (!buttonInteraction) {
      return void (await interaction.editReply({
        content: getString('commands.report.timeout'),
        embeds: [],
        components: [],
      }));
    }

    if (buttonInteraction.customId === 'no') {
      return void (await buttonInteraction.update({
        content: getString('commands.report.cancelled'),
        embeds: [],
        components: [],
      }));
    }

    const logEmebd = new EmbedBuilder()
      .setTitle(getString('commands.report.new_report'))
      .setThumbnail(user.displayAvatarURL())
      .setFields(
        {
          name: getString('commands.report.author'),
          value: `${interaction.user} ${inlineCode(interaction.user.tag)} (${interaction.user.id})`,
        },
        {
          name: getString('commands.report.user'),
          value: `${user} ${inlineCode(user.tag)} (${user.id})`,
        },
        {
          name: getString('commands.report.reason'),
          value: `${reason}`,
        },
      )
      .setImage(proofURL);
    const reportsChannel = await getReportsChannel(client, interaction.guildId);
    // TODO: Better error message
    if (!reportsChannel) return;

    await reportsChannel.send({ embeds: [logEmebd] });

    await buttonInteraction.update({
      content: getString('commands.report.sent'),
      embeds: [],
      components: [],
    });
  },
};
