import type { Awaitable, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { PojavClient } from '../util/PojavClient';

export * as status from './chatInput/status';
export * as tag from './chatInput/tag';
export * as tags from './chatInput/tags';

export interface PojavChatInputCommand {
  data: Pick<SlashCommandBuilder, 'toJSON'>;
  listener(interaction: ChatInputCommandInteraction<'cached'>, client: PojavClient): Awaitable<unknown>;
}
