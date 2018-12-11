import { PlayerData, PlayerDataInfo } from "../../../data/player-data";
import { Dictionary } from "../../../utils";

export const UserDataInfo: PlayerDataInfo = {
    identifier: 'user-data',
    version: 1,
    ttl: '1h',
}

export type UserData = {
    email: string
    resources: {
        denier: number
        energy_set_time: number
        energy: number
        gems: number
        gold: number
    }
    gameTime: number
    username: string
    registered: number
    story: {
        locations: UserStoryLocation[]
    }
    email_verified: boolean
    items: {
        items: number[][]
    }
    country: string
    hero: {
        exp: number
    },
    vars: Dictionary<any>
}

export type UserStoryLocation = {
    id: number
    missions: {
        doneStars: number
        won: number
        id: number
        lost: number
    }[]
}

export type UserPlayerData = PlayerData<UserData>

export const UserDataPickFields = [
    'email',
    'resources',
    'gameTime',
    'username',
    'registered',
    'story',
    'email_verified',
    'items',
    'country',
    'hero.exp',
    'vars.__LBOX_T',
]
