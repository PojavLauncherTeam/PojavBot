import { Time } from '@sapphire/time-utilities';
import { type ColorResolvable, Formatters, BitField, ChannelType, Colors, EmbedBuilder } from 'discord.js';
import type { PojavEvent } from '.';
import { UserFlags } from '../util/DatabaseClient';
import { makeFormattedTime, makeUserURL } from '../util/Util';

export const event: PojavEvent<'guildMemberAdd'> = {
  async listener(client, member) {
    const [dbGuild, dbUser] = await Promise.all([
      client.database.guilds.findOne({ id: member.guild.id }),
      client.database.users.findOne({ id: member.id }),
    ]);

    if (!dbGuild) return;
    const { joinLeaveChannelId, developerRoleId, contributorRoleId, vipRoleId } = dbGuild;

    if (joinLeaveChannelId) {
      const joinLeaveChannel = client.channels.resolve(joinLeaveChannelId);
      if (joinLeaveChannel?.type !== ChannelType.GuildText) return;

      const userCreatedAccountAgo = Date.now() - member.user.createdTimestamp;
      let color: ColorResolvable;
      if (userCreatedAccountAgo > Time.Day * 28) color = Colors.Green;
      else if (userCreatedAccountAgo > Time.Day * 14) color = Colors.Yellow;
      else color = Colors.Red;

      const embed = new EmbedBuilder()
        .setAuthor({
          iconURL: member.displayAvatarURL({ extension: 'png' }),
          name: member.displayName,
          url: makeUserURL(member.id),
        })
        .setTitle('Welcome!')
        .setDescription(`${member} ${Formatters.inlineCode(member.user.tag)} (${member.id})`)
        .setFields(
          {
            name: 'Created the account',
            value: makeFormattedTime(member.user.createdAt),
          },
          {
            name: 'Joined the server',
            value: makeFormattedTime(member.joinedAt!),
          }
        )
        .setColor(color);

      await joinLeaveChannel.send({ embeds: [embed] });
    }

    if (dbUser?.flags) {
      const bitField = new BitField(dbUser.flags);
      const roleIdsToAdd = [];
      if (developerRoleId && bitField.has(UserFlags.Developer)) {
        roleIdsToAdd.push(developerRoleId);
      }
      if (contributorRoleId && bitField.has(UserFlags.Contributor)) {
        roleIdsToAdd.push(contributorRoleId);
      }
      if (vipRoleId && bitField.has(UserFlags.VIP)) {
        roleIdsToAdd.push(vipRoleId);
      }

      await member.roles.add(roleIdsToAdd);
    }
  },
};
