import { Colors, EmbedBuilder, PresenceUpdateStatus, SlashCommandBuilder } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { Emoji } from '../../util/Constants';
import { makeFormattedTime, makeUserMention } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Gives information about user')
    .addUserOption((option) => option.setName('user').setDescription('User to give information about')),

  async listener(interaction, { getString }) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const member = interaction.options.getMember('user') ?? user.id === interaction.user.id ? interaction.member : null;

    const userInfoEmbed = new EmbedBuilder()
      .setAuthor({ name: member?.displayName ?? user.username })
      .setDescription(makeUserMention(user))
      .setThumbnail(member?.displayAvatarURL() ?? user.displayAvatarURL())
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      .setColor(member?.displayColor || Colors.LightGrey);

    if (member) {
      const memberStatus = member.presence?.status ?? 'online';
      let emoji: Emoji;
      switch (memberStatus) {
        case PresenceUpdateStatus.DoNotDisturb:
          emoji = Emoji.DoNotDisturb;
          break;
        case PresenceUpdateStatus.Idle:
          emoji = Emoji.Idle;
          break;
        case PresenceUpdateStatus.Online:
          emoji = Emoji.Online;
          break;
        default:
          emoji = Emoji.Offline;
          break;
      }

      const satusStrings = [`${emoji} ${getString(`commands.userinfo.status.${memberStatus}`)}`];
      const memberClientStatus = member.presence?.clientStatus;
      if (memberClientStatus) satusStrings.push(Object.keys(memberClientStatus).join(', '));

      userInfoEmbed.addFields({ name: getString('commands.userinfo.status'), value: satusStrings.join(' ') });
    }

    userInfoEmbed.addFields({
      name: getString('commands.userinfo.createdAccount'),
      value: makeFormattedTime(user.createdAt),
    });

    if (member?.joinedTimestamp) {
      userInfoEmbed.addFields({
        name: getString('commands.userinfo.joinedServer'),
        value: makeFormattedTime(member.joinedAt!),
      });
    }

    const roles = member?.roles.cache;
    if (roles?.size) {
      const rolesString = roles
        .filter((role) => role.id !== role.guild.id)
        .map((role) => `${role}`)
        .join(', ');
      userInfoEmbed.addFields({
        name: getString('commands.userinfo.roles', { variables: { count: roles.size } }),
        value: rolesString,
      });
    }

    await interaction.reply({ embeds: [userInfoEmbed] });
  },
};
