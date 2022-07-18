import { ChannelType, Colors, EmbedBuilder, Formatters } from 'discord.js';
import type { PojavEvent } from '.';
import { makeFormattedTime, makeUserURL } from '../util/Util';

export const event: PojavEvent<'guildMemberRemove'> = {
  async listener(client, member) {
    const dbGuild = await client.database.guilds.findOne({ id: member.guild.id });
    if (!dbGuild?.joinLeaveChannelId) return;

    const joinLeaveChannel = client.channels.resolve(dbGuild.joinLeaveChannelId);
    if (joinLeaveChannel?.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        iconURL: member.displayAvatarURL({ extension: 'png' }),
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
      .setColor(Colors.LightGrey);

    await joinLeaveChannel.send({ embeds: [embed] });
  },
};
