import { PlayerData, PlayerDataHelpers, PlayerDataIndentity } from "../entities/player-data";
import { Player } from "./player";
import ms = require("ms");
import { IPlayerDataRepository } from "../repositories/player-data-repository";
import { unixTime } from "@gamebot/domain";
import { GameApi } from "../game-api";

export interface IPlayerDataProvider {
    get<T>(api: GameApi, player: Player, dataIdentity: PlayerDataIndentity): Promise<PlayerData<T>>
}

export class PlayerDataProvider implements IPlayerDataProvider {
    constructor(protected rep: IPlayerDataRepository) {

    }

    async get<T>(api: GameApi, player: Player, dataIdentity: PlayerDataIndentity): Promise<PlayerData<T>> {

        const playerDataId = this.createPlayerDataId(player, dataIdentity);

        const existingData = await this.rep.get<T>(playerDataId);

        const timestamp = unixTime();

        if (existingData && existingData.expiresAt > timestamp) {
            return existingData;
        }

        const data = await api.fetchPlayerData<T>(player, dataIdentity);

        const newData = this.formatPlayerData<T>(player, data, dataIdentity);

        await this.rep.put(newData);

        return newData;
    }

    formatPlayerData<T>(player: Player, data: T, dataIdentity: PlayerDataIndentity) {
        const ttl = dataIdentity.ttl;
        const createdAt = unixTime();
        const expiresAt = createdAt + Math.floor(ms(ttl) / 1000);
        const id = this.createPlayerDataId(player, dataIdentity);

        const playerData: PlayerData<T> = {
            id,
            identifier: dataIdentity.identifier,
            playerId: player.id,
            gameId: player.gameId,
            createdAt,
            expiresAt,
            version: dataIdentity.version,
            data,
        }

        return playerData;
    }

    createPlayerDataId(player: Player, dataIdentity: PlayerDataIndentity) {
        return PlayerDataHelpers.createId({
            identifier: dataIdentity.identifier,
            version: dataIdentity.version,
            playerId: player.id
        });
    }
}
