import type { Snowflake } from 'discord.js';
import { type Collection, MongoClient, type MongoClientOptions } from 'mongodb';

export class DatabaseClient {
  public mongo: MongoClient;
  public guilds: Collection<GuildSchema>;

  public constructor(url: string, options?: MongoClientOptions) {
    this.mongo = new MongoClient(url, options);
    this.guilds = this.mongo.db().collection<GuildSchema>('guilds');
  }
}

interface GuildSchema {
  id: Snowflake;
  logsChannelId?: Snowflake;
  joinLeaveChannelId?: Snowflake;
}
