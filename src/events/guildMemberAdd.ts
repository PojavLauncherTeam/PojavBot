import { Time } from '@sapphire/time-utilities';
import { type ColorResolvable, BitField, ChannelType, Colors, EmbedBuilder } from 'discord.js';
import { UserFlags } from '../util/DatabaseClient';
import type { GetStringFunctionOptions, PojavStringsFile } from '../util/LocalizationManager';
import { makeFormattedTime, makeUserURL, resolveLocale } from '../util/Util';
import type { PojavEvent } from '.';

export const event: PojavEvent<'guildMemberAdd'> = {
  async listener(client, member) {
    const [dbGuild, dbUser] = await Promise.all([
      client.database.guilds.findOne({ id: member.guild.id }),
      client.database.users.findOne({ id: member.id }),
    ]);

    if (!dbGuild) return;
    const { joinLeaveChannelId, developerRoleId, contributorRoleId, vipRoleId } = dbGuild;

    function getString(
      key: keyof PojavStringsFile,
      { locale = resolveLocale(dbGuild?.locale), variables }: Partial<GetStringFunctionOptions> = {}
    ) {
      return client.localizations.getString(key, { locale, variables });
    }

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
        .setTitle(getString('events.guildMemberAdd.welcome'))
        .setDescription(
          getString('global.userInfo', {
            variables: { user: `${member}`, tag: member.user.tag, id: member.id },
          })
        )
        .setFields(
          {
            name: getString('global.createdAccount'),
            value: makeFormattedTime(member.user.createdAt),
          },
          {
            name: getString('events.guildMemberAdd.joinedServer'),
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
