import process from 'node:process';
import fetch from 'node-fetch';

export async function checkOwnership(code: any) {
  const authToken = await authCodeToAuthToken(code);
  const xbl = await authTokenToXBL(authToken);
  const xsts = await xblToXsts(xbl);
  const mcToken = await xstsToMc(xsts);
  const games = await getGames(mcToken);

  if (!games) return false;
  if (games === 'error') return games;

  for (const game of games) {
    if (game.name === 'game_minecraft') return true;
  }

  return false;
}

export async function authCodeToAuthToken(codee: any) {
  const bodyAcess = {
    client_id: process.env.clientId!,
    client_secret: process.env.clientSecret!,
    code: codee,
    grant_type: 'authorization_code',
    redirect_uri: process.env.redirectUri,
  };

  const formBody: string[] = [];
  for (const property of Object.keys(bodyAcess) as (keyof typeof bodyAcess)[]) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(bodyAcess[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }

  const fucking_body = formBody.join('&');

  const request = await fetch(`https://login.live.com/oauth20_token.srf`, {
    method: 'post',
    body: fucking_body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const acessToken: any = await request.json().catch(() => null);
  if (!acessToken) return null;
  return `d=${acessToken.access_token}`;
}

export async function authTokenToXBL(authToken: any) {
  const data = {
    Properties: {
      AuthMethod: 'RPS',
      SiteName: 'user.auth.xboxlive.com',
      RpsTicket: authToken,
    },
    RelyingParty: 'http://auth.xboxlive.com',
    TokenType: 'JWT',
  };

  const request = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  const dataXbox: any = await request.json().catch(() => null);
  if (!dataXbox) return null;
  return dataXbox.Token;
}

export async function xblToXsts(token: any) {
  const data = {
    Properties: {
      SandboxId: 'RETAIL',
      UserTokens: [token],
    },
    RelyingParty: 'rp://api.minecraftservices.com/',
    TokenType: 'JWT',
  };

  const request = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  const tokenXSTS = await request.json().catch(() => null);
  if (!tokenXSTS) return null;

  return tokenXSTS;
}

export async function xstsToMc(token: any) {
  const data = {
    identityToken: `XBL3.0 x=${token?.DisplayClaims?.xui[0]?.uhs};${token?.Token}`,
    ensureLegacyEnabled: true,
  };
  const request = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  const mineToken: any = await request.json().catch(() => null);
  if (!mineToken) return null;

  return mineToken.access_token;
}

export async function getGames(mc_token: any) {
  const request = await fetch('https://api.minecraftservices.com/entitlements/mcstore', {
    method: 'get',
    headers: { Authorization: `Bearer ${mc_token}` },
  });

  const dataCheckCopy: any = await request.json().catch(() => null);
  if (!dataCheckCopy) return 'error';

  return dataCheckCopy.items;
}
