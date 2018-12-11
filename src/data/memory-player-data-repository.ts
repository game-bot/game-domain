import { IPlayerDataRepository, PlayerDataByPlayerParams } from "./player-data-repository";
import { Dictionary } from "../utils";
import { PlayerData } from "./player-data";

export class MemoryPlayerDataRepository<T> implements IPlayerDataRepository<T> {
    private cache: Dictionary<PlayerData<T>> = {}

    async get(id: string): Promise<PlayerData<T> | null> {
        const data = this.cache[id];
        if (data) {
            return data;
        }
        return null;
    }
    findByPlayer(_params: PlayerDataByPlayerParams): Promise<PlayerData<T>[]> {
        throw new Error("Method not implemented.");
    }
    async put(data: PlayerData<T>): Promise<void> {
        this.cache[data.id] = data;
    }
}
