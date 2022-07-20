import { ChatInputCommandInteraction, Formatters, ModalSubmitInteraction, type Snowflake } from 'discord.js';
import { PojavLocale } from '../util/LocalizationManager';
import type { TagSchema } from './DatabaseClient';
import type { PojavClient } from './PojavClient';

export async function findTag(interaction: ChatInputCommandInteraction<'cached'>, client: PojavClient) {
  const query = interaction.options.getString('query', true);
  const tag = await client.database.tags.findOne({ name: query, guildId: interaction.guildId });

  if (!tag) {
    interaction.reply({
      content: `Could not find a tag by your query: ${Formatters.inlineCode(query)}`,
      ephemeral: true,
    });
    return null;
  }

  return tag;
}

export function makeFormattedTime(time: Date | number = new Date()): `<t:${bigint}> (<t:${bigint}:R>)` {
  const date = typeof time === 'number' ? new Date(Math.floor(time)) : time;
  return `${Formatters.time(date)} (${Formatters.time(date, 'R')})`;
}

export function makeTagData(interaction: ModalSubmitInteraction<'cached'>) {
  const name = interaction.fields.getTextInputValue('name');
  const keywords = interaction.fields
    .getTextInputValue('keywords')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length);
  const content = interaction.fields.getTextInputValue('content');

  const data: TagSchema = { name, guildId: interaction.guildId, content };
  if (keywords.length) data.keywords = keywords;

  return data;
}

export function makeUserURL(id: Snowflake) {
  return `https://discord.com/users/${id}`;
}

export function resolveLocale(locale: unknown) {
  return Object.values(PojavLocale).includes(locale as PojavLocale) ? (locale as PojavLocale) : PojavLocale.EnglishUS;
}
