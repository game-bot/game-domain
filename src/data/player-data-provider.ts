import { PlayerData, PlayerDataHelpers, PlayerDataInfo } from "./player-data";
import { Player } from "../player";
import { unixTime } from "../utils";
import ms = require("ms");
import { IPlayerDataRepository } from "./player-data-repository";
import { IPlayerDataFetcher } from "./player-data-fetcher";

export interface IPlayerDataProvider<T> {
    get(player: Player): Promise<PlayerData<T>>
}

export abstract class PlayerDataProvider<T> implements IPlayerDataProvider<T> {
    constructor(protected dataInfo: PlayerDataInfo,
        protected rep: IPlayerDataRepository<T>,
        protected fetcher: IPlayerDataFetcher<T>) {

    }

    async get(player: Player): Promise<PlayerData<T>> {

        const playerDataId = this.createPlayerDataId(player);

        const existingData = await this.rep.get(playerDataId);

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
