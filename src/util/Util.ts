import { Formatters } from 'discord.js';

export function makeFormattedTime(time: Date | number): `<t:${bigint}> (<t:${bigint}:R>)` {
  const date = typeof time === 'number' ? new Date(Math.floor(time)) : time;
  return `${Formatters.time(date)} (${Formatters.time(date, 'R')})`;
}
