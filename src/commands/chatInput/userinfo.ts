import { Formatters, SlashCommandBuilder, EmbedBuilder, Colors, ActivityType } from 'discord.js';
import type { PojavChatInputCommand } from '..';
import { makeFormattedTime } from '../../util/Util';

export const command: PojavChatInputCommand = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Gives information about user')
    .addUserOption((option) => option.setName('user').setDescription('User to give information about')),

  async listener(interaction) {
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
      let statusName: string;

      switch (member?.presence?.status) {
        case 'online':
          emoji = '<:online:999281115607085066>';
          statusName = 'Online';
          break;
        case 'idle':
          emoji = '<:idle:999281100272713749>';
          statusName = 'Idle';
          break;
        case 'dnd':
          emoji = '<:dnd:999281147706097747>';
          statusName = 'Do Not Disturb';
          break;
        default:
          emoji = '<:offline:999281170921553960>';
          statusName = 'Offline';
      }

      const platforms = member?.presence?.clientStatus ? Object.keys(member?.presence?.clientStatus) : [];
      const status = `${emoji} ${statusName} ${(() =>
        platforms.length ? `(${platforms.map((platform) => platform).join(', ')})` : ' ')()}`;

      embed.addFields([{ name: 'Status', value: status }]);
    }

    embed.addFields([
      {
        name: 'Created the account',
        value: makeFormattedTime(user.createdTimestamp),
      },
    ]);
    if (member?.joinedTimestamp)
      embed.addFields([
        {
          name: 'Joined the server',
          value: makeFormattedTime(member.joinedTimestamp),
        },
      ]);

    if (member?.premiumSinceTimestamp)
      embed.addFields([
        {
          name: 'Server Booster since',
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
          name: `Roles (${roles.length}) `,
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

        embed.addFields([{ name: 'Custom Status', value: status }]);
      }
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
