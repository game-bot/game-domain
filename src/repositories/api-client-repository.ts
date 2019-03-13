import LRU = require('lru-cache');

export interface IApiClientRepository {
    get<T>(key: string): Promise<T | null>
    put<T>(key: string, data: T, ttl?: number): Promise<void>
}

export type MemoryApiClientRepositoryOptions = {
    size: number
    ttl: number
}

export class MemoryApiClientRepository implements IApiClientRepository {
    private cache: LRU.Cache<string, any>
    constructor(options: MemoryApiClientRepositoryOptions) {
        this.cache = new LRU<string, any>({
            max: options.size,
            maxAge: options.ttl,
        });
    }
    async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (item === undefined) {
            return null;
        }

        return item as T;
    }
    async put<T>(key: string, data: T, ttl?: number): Promise<void> {
        this.cache.set(key, data, ttl);
    }
}

export class NoCacheApiClientRepository implements IApiClientRepository {
    async get<T>(_key: string): Promise<T | null> {
        return null;
    }
    async put<T>(_key: string, _data: T): Promise<void> {

    }
}
