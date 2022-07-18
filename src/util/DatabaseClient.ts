import type { Snowflake } from 'discord.js';
import { type Collection, MongoClient, type MongoClientOptions } from 'mongodb';

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

interface GuildSchema {
  id: Snowflake;
  logsChannelId?: Snowflake;
  joinLeaveChannelId?: Snowflake;
  developerRoleId?: Snowflake;
  contributorRoleId?: Snowflake;
  vipRoleId?: Snowflake;
  development?: boolean;
}

export interface TagSchema {
  name: string;
  keywords?: string[];
  guildId: Snowflake;
  content: string;
}

interface UserSchema {
  id: Snowflake;
  flags?: string;
}

export enum UserFlags {
  Developer = 1 << 0,
  Contributor = 1 << 1,
  VIP = 1 << 2,
}
