import { IPlayerDataRepository, PlayerDataByPlayerParams } from "./player-data-repository";
import { PlayerData } from "../entities/player-data";
import { IDictionary } from "@gamebot/domain";

export class MemoryPlayerDataRepository implements IPlayerDataRepository {
    private cache: IDictionary<PlayerData<any>> = {}

    async get<T>(id: string): Promise<PlayerData<T> | null> {
        const data = this.cache[id];
        if (data) {
            return data;
        }
        return null;
    }
    findByPlayer<T>(_params: PlayerDataByPlayerParams): Promise<PlayerData<T>[]> {
        throw new Error("Method not implemented.");
    }
    async put<T>(data: PlayerData<T>): Promise<void> {
        this.cache[data.id] = data;
    }
}
