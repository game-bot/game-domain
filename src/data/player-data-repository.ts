import { PlayerData } from "./player-data";

export type PlayerDataByPlayerParams = {
    playerId: string
    identifier?: string
}

export interface IPlayerDataRepository<T> {
    get(id: string): Promise<PlayerData<T> | null>
    findByPlayer(params: PlayerDataByPlayerParams): Promise<PlayerData<T>[]>
    put(data: PlayerData<T>): Promise<void>
}
