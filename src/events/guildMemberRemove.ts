import { Constants, Formatters, MessageEmbed } from 'discord.js';
import type { PojavEvent } from '.';
import { makeFormattedTime, makeUserURL } from '../util/Util';

export const event: PojavEvent<'guildMemberRemove'> = {
  async listener(client, member) {
    const dbGuild = await client.database.guilds.findOne({ id: member.guild.id });
    if (!dbGuild?.joinLeaveChannelId) return;

    const joinLeaveChannel = client.channels.resolve(dbGuild.joinLeaveChannelId);
    if (!joinLeaveChannel?.isText()) return;

    const embed = new MessageEmbed()
      .setAuthor({
        iconURL: member.displayAvatarURL({ dynamic: true, format: 'png' }),
        name: member.displayName,
        url: makeUserURL(member.id),
      })
      .setTitle('Goodbye!')
      .setDescription(`${member} ${Formatters.inlineCode(member.user.tag)} (${member.id})`)
      .setFields(
        {
          name: 'Created the account',
          value: makeFormattedTime(member.user.createdAt),
        },
        {
          name: 'Left the server',
          value: makeFormattedTime(),
        }
      )
      .setColor(Constants.Colors.LIGHT_GREY);

    joinLeaveChannel.send({ embeds: [embed] });
  },
};
