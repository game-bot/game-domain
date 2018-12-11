import { PlayerData, PlayerDataInfo } from "../../../data/player-data";

export const AuthDataInfo: PlayerDataInfo = {
    identifier: 'auth',
    version: 1,
    ttl: '15m',
}

export type AuthData = {
    cook: string
    csrftoken: string
    sessionid: string
}

export type AuthPlayerData = PlayerData<AuthData>
