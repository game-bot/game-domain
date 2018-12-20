import { PlayerData, PlayerDataHelpers, PlayerDataInfo } from "../entities/player-data";
import { Player } from "./player";
import ms = require("ms");
import { IPlayerDataRepository } from "../repositories/player-data-repository";
import { IPlayerDataFetcher } from "./player-data-fetcher";
import { unixTime } from "@gamebot/domain";

export interface IPlayerDataProvider<T> {
    get(player: Player): Promise<PlayerData<T>>
}

export abstract class PlayerDataProvider<T> implements IPlayerDataProvider<T> {
    constructor(protected dataInfo: PlayerDataInfo,
        protected rep: IPlayerDataRepository,
        protected fetcher: IPlayerDataFetcher<T>) {

    }

    async get(player: Player): Promise<PlayerData<T>> {

        const playerDataId = this.createPlayerDataId(player);

        const existingData = await this.rep.get<T>(playerDataId);

        const timestamp = unixTime();

        if (existingData && existingData.expiresAt > timestamp) {
            return existingData;
        }

        const data = await this.fetcher.fetch(player);

        const newData = this.formatPlayerData(player, data);

        await this.rep.put(newData);

        return newData;
    }

    formatPlayerData(player: Player, data: T, ttl?: string) {
        ttl = ttl || this.dataInfo.ttl;
        const createdAt = unixTime();
        const expiresAt = createdAt + Math.floor(ms(ttl) / 1000);
        const id = this.createPlayerDataId(player);

        const playerData: PlayerData<T> = {
            id,
            identifier: this.dataInfo.identifier,
            playerId: player.id,
            gameId: player.gameId,
            createdAt,
            expiresAt,
            version: this.dataInfo.version,
            data,
        }

        return playerData;
    }

    createPlayerDataId(player: Player) {
        return PlayerDataHelpers.createId({
            identifier: this.dataInfo.identifier,
            version: this.dataInfo.version,
            playerId: player.id
        });
    }
}
