import 'dotenv/config';
import { Intents } from 'discord.js';
import { PojavClient } from './util/PojavClient';

const client = new PojavClient({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

client.login();
