import { Formatters, SlashCommandBuilder, EmbedBuilder, Colors, ActivityType, ClientPresenceStatusData } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { makeFormattedTime } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Gives information about user')
    .addUserOption((option) => option.setName('user').setDescription('User to give information about')),

  async listener(interaction, { getString }) {
    await interaction.deferReply();

    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member?.displayName || user.username,
        iconURL: member?.displayAvatarURL() || user.displayAvatarURL(),
      })
      .setDescription(`${user} ${Formatters.inlineCode(user.tag)} (${user.id})`)
      .setThumbnail(member?.displayAvatarURL({ size: 4096 }) || user.displayAvatarURL({ size: 4096 }))
      .setColor(member?.displayColor || Colors.LightGrey);
    if (member) {
      let emoji: string;
      const statusName = member?.presence?.status || 'offline';
      switch (member?.presence?.status) {
        case 'online':
          emoji = '<:online:999281115607085066>';
          break;
        case 'idle':
          emoji = '<:idle:999281100272713749>';
          break;
        case 'dnd':
          emoji = '<:dnd:999281147706097747>';
          break;
        default:
          emoji = '<:offline:999281170921553960>';
      }

      const platforms = member?.presence?.clientStatus ? Object.keys(member?.presence?.clientStatus) as (keyof ClientPresenceStatusData)[] : [];

      const status = `${emoji} ${getString(`commands.userinfo.status.${statusName}`)} ${(() =>
        platforms.length
          ? `(${platforms.map((platform) => getString(`commands.userinfo.platform.${platform}`)).join(', ')})`
          : '')()}`;

      embed.addFields([{ name: getString('commands.userinfo.status'), value: status }]);
    }

    embed.addFields([
      {
        name: getString('commands.userinfo.createdAccount'),
        value: makeFormattedTime(user.createdTimestamp),
      },
    ]);
    if (member?.joinedTimestamp)
      embed.addFields([
        {
          name: getString('commands.userinfo.joinedServer'),
          value: makeFormattedTime(member.joinedTimestamp),
        },
      ]);

    if (member?.premiumSinceTimestamp)
      embed.addFields([
        {
          name: getString('commands.userinfo.serverBooster'),
          value: makeFormattedTime(member.premiumSinceTimestamp),
        },
      ]);

    const roles = member?.roles.cache
      .filter((role) => role.id !== member!.guild.id)
      .sort((role1, role2) => role2.rawPosition - role1.rawPosition)
      .map((role) => `${role}`);
    if (roles?.length)
      embed.addFields([
        {
          name: `${getString('commands.userinfo.roles')} (${roles.length}) `,
          value: roles.join(', '),
        },
      ]);

    let activities = member?.presence?.activities;
    if (activities?.length) {
      const custom = activities.find((a) => a.type === ActivityType.Custom);
      if (custom) {
        let status = '';
        if (custom.emoji) status += `${custom.emoji} `;
        if (custom.state) status += custom.state;

        embed.addFields([{ name: getString('commands.userinfo.custom_status'), value: status }]);
      }
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
