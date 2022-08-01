import 'dotenv/config';
import { disableValidators, GatewayIntentBits, Partials } from 'discord.js';
import { PojavClient } from './util/PojavClient';

disableValidators();

const client = new PojavClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
  partials: [Partials.GuildMember],
});

client.login();
