import { ChannelType, Colors, EmbedBuilder } from 'discord.js';
import type { GetStringFunctionOptions, PojavStringsFile } from '../util/LocalizationManager';
import { makeFormattedTime, makeUserURL, resolveLocale } from '../util/Util';
import type { PojavEvent } from '.';

export const event: PojavEvent<'guildMemberRemove'> = {
  async listener(client, member) {
    const dbGuild = await client.database.guilds.findOne({ id: member.guild.id });
    if (!dbGuild?.joinLeaveChannelId) return;

    function getString(
      key: keyof PojavStringsFile,
      { locale = resolveLocale(dbGuild?.locale), variables }: Partial<GetStringFunctionOptions> = {}
    ) {
      return client.localizations.getString(key, { locale, variables });
    }

    const joinLeaveChannel = client.channels.resolve(dbGuild.joinLeaveChannelId);
    if (joinLeaveChannel?.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        iconURL: member.displayAvatarURL({ extension: 'png' }),
        name: member.displayName,
        url: makeUserURL(member.id),
      })
      .setTitle(getString('events.guildMemberRemove.goodbye'))
      .setDescription(
        getString('global.userInfo', {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          variables: { user: `${member}`, tag: member.user.tag, id: member.id },
        })
      )
      .setFields(
        {
          name: getString('global.createdAccount'),
          value: makeFormattedTime(member.user.createdAt),
        },
        {
          name: getString('events.guildMemberRemove.leftServer'),
          value: makeFormattedTime(),
        }
      )
      .setColor(Colors.LightGrey);

    await joinLeaveChannel.send({ embeds: [embed] });
  },
};
