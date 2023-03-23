import { Colors, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import type { PojavEvent } from '.';

export const event: PojavEvent<'messageCreate'> = {
  async listener(_client, message) {
    if (message.attachments) {
      const attachment = message.attachments.first();
      if (!attachment) return;
      if (attachment.name?.slice(-4) !== '.txt') return;
      try {
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
            .setTitle('Log information')
            .setDescription(
              `**Launcher version:** ${result.version.major_code}-${result.version.branch}\n**Game Version:** ${result.minecraft_version.name} (${result.minecraft_version.type})\n**Renderer:** ${result.renderer}\n**Java version:** ${result.java_runtime.version}    **Architecture:** ${result.architecture}`
            )
            .setColor(Colors.Green);
          if (result.errors.length) {
            embed.setColor(Colors.Red);
            embed.addFields({ name: 'Errors', value: result.errors.join('\n') });
          }

          await message.reply({ embeds: [embed] });
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
};
