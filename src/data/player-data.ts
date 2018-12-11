import { md5 } from "../utils";

export type PlayerDataInfo = {
    readonly identifier: string
    readonly version: number
    readonly ttl: string
}

export type PlayerData<T> = {
    id: string
    gameId: string
    playerId: string
    version: number
    identifier: string
    data: T

    createdAt: number
    expiresAt: number
}

export const PlayerDataHelpers = {
    createId({ identifier, playerId, version }: { identifier: string, playerId: string, version: number }) {
        return md5([identifier.trim(), playerId.trim(), version.toString()].join('#'));
    }
}
