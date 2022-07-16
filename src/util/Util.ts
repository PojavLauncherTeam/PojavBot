import { Formatters, type Snowflake } from 'discord.js';

export function makeFormattedTime(time: Date | number = new Date()): `<t:${bigint}> (<t:${bigint}:R>)` {
  const date = typeof time === 'number' ? new Date(Math.floor(time)) : time;
  return `${Formatters.time(date)} (${Formatters.time(date, 'R')})`;
}

export function makeUserURL(id: Snowflake) {
  return `https://discord.com/users/${id}`;
}
