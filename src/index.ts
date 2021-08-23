import { randomBytes } from 'crypto';
import IORedis from 'ioredis';

interface CreateSessionDto {
  app: string;
  ownerId: string;
  data: Record<string, any>;
  duration?: number;
}

interface GetSessionResponseDto {
  ownerId: string;
  data: Record<string, any>;
}

interface GetSessionDto {
  app: string;
  token: string;
}

interface KillAllSessionsDto {
  app: string;
  ownerId: string;
}

interface KillSessionDto {
  app: string;
  token: string;
}

interface RefreshSessionDto {
  app: string;
  token: string;
  duration: number;
}

interface UpdateSessionDto {
  app: string;
  token: string;
  data: Record<string, any>;
}

class SpotsSessions {
  client: IORedis.Redis;

  private tokenEncoding: BufferEncoding;

  private tokenSize: number;

  constructor({
    connectionString,
    tokenEncoding,
    tokenSize,
  }: {
    connectionString?: string;
    tokenEncoding?: BufferEncoding;
    tokenSize?: number;
  }) {
    try {
      this.client = new IORedis(connectionString);
      this.tokenEncoding = tokenEncoding || 'base64';
      this.tokenSize = tokenSize || 128;
    } catch (error) {
      throw new Error('failed to instantiate IORedis client');
    }
  }

  // Creates a session
  async create(request: CreateSessionDto): Promise<string> {
    const token = randomBytes(this.tokenSize).toString(this.tokenEncoding);
    const key = `app:${request.app}|token:${token}|ownerId:${request.ownerId}`;

    const response = await this.client.set(
      key,
      JSON.stringify(request.data),
      'ex',
      request.duration,
    );

    if (response === 'OK') return token;

    throw new Error('failed to create token');
  }

  // Gets a session
  async get(request: GetSessionDto): Promise<GetSessionResponseDto> {
    const pattern = `app:${request.app}|token:${request.token}*`;
    const keys = await this.client.keys(pattern);

    if (keys.length === 0) throw new Error('failed to get token data');

    const key = keys[0];
    const data = await this.client.get(key);

    if (!data) throw new Error('failed to get token data');

    return {
      ownerId: key.split('ownerId:')[1],
      data: JSON.parse(data),
    };
  }

  // Refreshes a session
  async refresh(request: RefreshSessionDto): Promise<void> {
    const pattern = `app:${request.app}|token:${request.token}*`;
    const keys = await this.client.keys(pattern);

    if (keys.length === 0) throw new Error('failed to refresh token data');

    const key = keys[0];

    this.client.expire(key, request.duration);
  }

  // Updates the custom data of a session
  async update(request: UpdateSessionDto): Promise<void> {
    const pattern = `app:${request.app}|token:${request.token}*`;
    const keys = await this.client.keys(pattern);

    if (keys.length === 0) throw new Error('failed to update the session');

    const key = keys[0];

    const data = await this.client.get(key);
    if (!data) throw new Error('failed to update the session');

    const parsedData = JSON.parse(data);

    Object.keys(request.data).forEach(k => {
      if (request.data[k] === null) {
        delete parsedData[k];
      } else {
        parsedData[k] = request.data[k];
      }
    });

    await this.client.set(key, JSON.stringify(parsedData), 'keepttl');
  }

  // Kills a session
  async kill(request: KillSessionDto): Promise<void> {
    const pattern = `app:${request.app}|token:${request.token}*`;
    const keys = await this.client.keys(pattern);

    if (keys.length === 0) throw new Error('failed to update the session');

    const key = keys[0];

    await this.client.expire(key, 0);
  }

  // Kills all sessions of an owner
  async killAll(request: KillAllSessionsDto): Promise<void> {
    const pattern = `app:${request.app}*ownerId:${request.ownerId}`;
    const keys = await this.client.keys(pattern);

    keys.forEach(key => {
      this.client.expire(key, 0);
    });
  }
}

export { SpotsSessions };
