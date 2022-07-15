import type { SlashCommandBuilder } from '@discordjs/builders';
import type { Awaitable, CommandInteraction } from 'discord.js';
import type { PojavClient } from '../util/PojavClient';

export * as status from './status';
export * as say from './status';

export interface PojavCommand {
  data: Pick<SlashCommandBuilder, 'toJSON'>;
  listener(interaction: CommandInteraction<'cached'>, client: PojavClient): Awaitable<void>;
}
