import { Time } from '@sapphire/time-utilities';
import { type ColorResolvable, Constants, Formatters, MessageEmbed } from 'discord.js';
import type { PojavEvent } from '.';
import { makeFormattedTime, makeUserURL } from '../util/Util';

export const event: PojavEvent<'guildMemberAdd'> = {
  async listener(client, member) {
    const dbGuild = await client.database.guilds.findOne({ id: member.guild.id });
    if (!dbGuild?.joinLeaveChannelId) return;

    const joinLeaveChannel = client.channels.resolve(dbGuild.joinLeaveChannelId);
    if (!joinLeaveChannel?.isText()) return;

    const userCreatedAccountAgo = Date.now() - member.user.createdTimestamp;
    let color: ColorResolvable;
    if (userCreatedAccountAgo > Time.Day * 28) color = Constants.Colors.GREEN;
    else if (userCreatedAccountAgo > Time.Day * 14) color = Constants.Colors.YELLOW;
    else color = Constants.Colors.RED;

    const embed = new MessageEmbed()
      .setAuthor({
        iconURL: member.displayAvatarURL({ dynamic: true, format: 'png' }),
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

    joinLeaveChannel.send({ embeds: [embed] });
  },
};
