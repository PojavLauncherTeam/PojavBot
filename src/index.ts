import 'dotenv/config';
import { GatewayIntentBits, Partials } from 'discord.js';
import { PojavClient } from './util/PojavClient';

const client = new PojavClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember],
});

client.login();
