import type { Snowflake } from 'discord.js';
import { type Collection, MongoClient, type MongoClientOptions } from 'mongodb';
import type { PojavLocale } from './LocalizationManager';

export class DatabaseClient {
  public mongo: MongoClient;

  public guilds: Collection<GuildSchema>;

  public tags: Collection<TagSchema>;

  public users: Collection<UserSchema>;

  public constructor(url: string, options?: MongoClientOptions) {
    this.mongo = new MongoClient(url, options);
    this.guilds = this.mongo.db().collection<GuildSchema>('guilds');
    this.tags = this.mongo.db().collection<TagSchema>('tags');
    this.users = this.mongo.db().collection<UserSchema>('users');
  }
}

export type GuildSchema = {
  contributorRoleId?: Snowflake;
  developerRoleId?: Snowflake;
  development?: boolean;
  id: Snowflake;
  joinLeaveChannelId?: Snowflake;
  locale?: PojavLocale;
  logsChannelId?: Snowflake;
  reportsChannelId?: Snowflake;
  vipRoleId?: Snowflake;
};

export type TagSchema = {
  content: string;
  guildId: Snowflake;
  keywords?: string[];
  name: string;
};

type UserSchema = {
  flags?: string;
  id: Snowflake;
};

export enum UserFlags {
  Developer = 1,
  Contributor = 1 << 1,
  VIP = 1 << 2,
}
