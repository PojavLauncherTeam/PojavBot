import type { Awaitable, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { GetStringFunction } from '../util/LocalizationManager';
import type { PojavClient } from '../util/PojavClient';

export * as status from './chatInput/status';
export * as say from './chatInput/say';
export * as tag from './chatInput/tag';
export * as tags from './chatInput/tags';

export interface PojavChatInputCommand {
  data: Pick<SlashCommandBuilder, 'toJSON'>;
  listener(
    interaction: ChatInputCommandInteraction<'cached'>,
    options: PojavChatInputCommandOptions
  ): Awaitable<unknown>;
}

export interface PojavChatInputCommandOptions {
  client: PojavClient;
  getString: GetStringFunction;
}
