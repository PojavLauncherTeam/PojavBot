import 'dotenv/config';
import { disableValidators, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import { PojavClient } from './util/PojavClient';
import * as web from './util/web';

disableValidators();

const client = new PojavClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember],
});

await client.login();

const app = express();
app.get('/', (_request, response) => {
  response.send('To verify your minecraft account, use /verification command on our discord server');
});

app.get('/auth', async (request, response) => {
  const { state, code } = request.query;
  if (typeof state !== 'string') return;
  if (!code || !state) return response.send('try to use /verification again');
  const data: any = state.split(/ +/);

  const ownership = await web.checkOwnership(code);
  if (ownership === 'error') return response.send('please try again');
  if (ownership) {
    const guild: any = await client.guilds.fetch(data[1]);
    const member: any = await guild.members.fetch(data[0]);
    if (data[1] === '724163890803638273') {
      // english server
      member.roles.add('951536554856312874');
      member.roles.remove('952235601397161994');
    } else if (data[1] === '962263126647144449') {
      member.roles.add('962297433918935070');
      member.roles.remove('962379472378658876');
    }

    response.send('minecraft was found, you can close this page and check your roles');
  } else {
    const guild: any = await client.guilds.fetch(data[1]);
    const member: any = await guild.members.fetch(data[0]);
    if (data[1] === '724163890803638273') {
      // english server
      member.roles.add('952235601397161994');
      member.roles.remove('951536554856312874');
    } else if (data[1] === '962263126647144449') {
      // russian server
      member.roles.add('962379472378658876');
      member.roles.remove('962297433918935070');
    }

    response.send('minecraft was not found, you can close this page');
  }
});

app.listen(80, () => {
  console.log('Web server is running');
});
