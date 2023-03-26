import { Colors, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import type { GetStringFunctionOptions, PojavStringsFile } from '../util/LocalizationManager';
import { resolveLocale } from '../util/Util';
import type { PojavEvent } from '.';

export const event: PojavEvent<'messageCreate'> = {
  async listener(client, message) {
    if (message.attachments) {
      const attachment = message.attachments.first();
      if (!attachment) return;
      if (!message.guild) return;
      if (attachment.name?.slice(-4) !== '.txt') return;
      try {
        const dbGuild = await client.database.guilds.findOne({ id: message.guild.id });
        if (!dbGuild) return;
        function getString(
          key: keyof PojavStringsFile,
          { locale = resolveLocale(dbGuild?.locale), variables }: Partial<GetStringFunctionOptions> = {}
        ) {
          return client.localizations.getString(key, { locale, variables });
        }

        const response = await fetch(attachment.url);
        const text = await response.text();
        if (text) {
          const parser = await fetch('https://pojav-parser-function-3tx4ib7zya-uw.a.run.app/?should_localize=False', {
            method: 'post',
            body: text,
          });
          const result: any = await parser.json().catch(() => null);
          if (!result) return;
          const embed = new EmbedBuilder()
            .setTitle(`${getString('events.messageCreate.log_information')}`)
            .setDescription(`**${getString('events.messageCreate.launcher_version')}** ${result.version.major_code}-${result.version.commit_number}-${result.version.branch}**\n${getString('events.messageCreate.game_version')}** ${result.minecraft_version.name} (${getString(result.minecraft_version.type)})\n**${getString('events.messageCreate.render')}** ${getString(result.renderer)}**\n${getString('events.messageCreate.java_version')}** ${result.java_runtime.version}**\n${getString('events.messageCreate.architecture')}** ${getString(result.architecture)}`)
            .setColor(Colors.Green);
          if (result.errors.length) {
            embed.setColor(Colors.Red);
            embed.addFields({ name: `${getString('events.messageCreate.errors')}`, value: result.errors.join('\n') });
          }

          await message.reply({ embeds: [embed] });
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
};