import { PlayerData } from "../entities/player-data";

export type PlayerDataByPlayerParams = {
    playerId: string
    identifier?: string
}

export interface IPlayerDataRepository {
    get<T>(id: string): Promise<PlayerData<T> | null>
    findByPlayer<T>(params: PlayerDataByPlayerParams): Promise<PlayerData<T>[]>
    put<T>(data: PlayerData<T>): Promise<void>
}
