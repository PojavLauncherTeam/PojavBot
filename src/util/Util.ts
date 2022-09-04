import type { Channel, TextChannel, User } from 'discord.js';
import {
  type ChatInputCommandInteraction,
  inlineCode,
  type ModalSubmitInteraction,
  type Snowflake,
  time,
} from 'discord.js';
import { PojavLocale } from '../util/LocalizationManager';
import type { GuildSchema, TagSchema } from './DatabaseClient';
import type { PojavClient } from './PojavClient';

export async function findTag(interaction: ChatInputCommandInteraction<'cached'>, client: PojavClient) {
  const query = interaction.options.getString('query', true);
  const tag = await client.database.tags.findOne({ name: query, guildId: interaction.guildId });

  if (!tag) {
    await interaction.reply({
      content: `Could not find a tag by your query: ${inlineCode(query)}`,
      ephemeral: true,
    });
    return null;
  }

  return tag;
}

export async function getChannel<T extends Channel>(
  client: PojavClient,
  getChannelId: (dbGuild: GuildSchema) => Snowflake | undefined,
  guildId?: Snowflake
) {
  const dbGuild = guildId
    ? await client.database.guilds.findOne({ guildId })
    : await client.database.guilds.findOne({ development: true });
  if (!dbGuild) return null;

  const channelId = getChannelId(dbGuild);
  if (!channelId) return null;

  const channel = client.channels.cache.get(channelId) as T | undefined;
  if (!channel) return null;
  return channel;
}

export async function getLogsChannel(client: PojavClient, guildId?: Snowflake) {
  return getChannel<TextChannel>(client, (dbGuild) => dbGuild.logsChannelId, guildId);
}

export async function getReportsChannel(client: PojavClient, guildId: Snowflake) {
  return getChannel<TextChannel>(client, (dbGuild) => dbGuild.reportsChannelId, guildId);
}

export function makeFormattedTime(inputTime: Date | number = new Date()) {
  const date = typeof inputTime === 'number' ? new Date(Math.floor(inputTime)) : inputTime;
  return `${time(date)} (${time(date, 'R')})`;
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

export function makeUserMention(user: User) {
  return `${user} ${inlineCode(user.tag)} (${user.id})`;
}

export function makeUserURL(id: Snowflake) {
  return `https://discord.com/users/${id}`;
}

export function resolveLocale(locale: unknown) {
  return Object.values(PojavLocale).includes(locale as PojavLocale) ? (locale as PojavLocale) : PojavLocale.EnglishUS;
}
