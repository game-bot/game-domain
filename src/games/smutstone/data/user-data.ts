import { PlayerData, PlayerDataIndentity } from "../../../entities/player-data";
import { EntityMapper } from "../../../entities/entity-mapper";
import * as Joi from 'joi';

export const UserDataIdentity: PlayerDataIndentity = {
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
        gems?: number
        gold: number
    }
    gameTime: number
    username: string
    registered: number
    story: {
        locations: UserDataStoryLocation[]
    }
    email_verified: boolean
    items: {
        items: number[][]
    }
    country: string
    hero: {
        exp: number
    },
    vars: {
        __LBOX_T: number
    }
}

export type UserDataStoryLocation = {
    id: number
    missions: {
        doneStars: number
        won: number
        id: number
        lost: number
    }[]
}

export type UserPlayerData = PlayerData<UserData>

const UserDataPickFields = [
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

export class UserDataMapper extends EntityMapper<UserData> {
    constructor() {
        super(UserDataPickFields, userDataSchema)
    }
}

const userDataSchema = Joi.object().keys({
    email: Joi.string().email(),
    resources: Joi.object().keys({
        denier: Joi.number().integer(),
        energy_set_time: Joi.number().integer(),
        energy: Joi.number().integer().required(),
        gems: Joi.number().integer(),
        gold: Joi.number().integer().required(),
    }).required(),
    gameTime: Joi.number().integer().required(),
    username: Joi.string().min(1).max(100),
    registered: Joi.number().integer(),
    story: Joi.object().keys({
        locations: Joi.array().items(Joi.object().keys({
            id: Joi.number().integer().required(),
            missions: Joi.array().items(Joi.object().keys({
                doneStars: Joi.number().integer().required(),
                won: Joi.number().integer().required(),
                id: Joi.number().integer().required(),
                lost: Joi.number().integer().required(),
            })).required(),
        }).required()),
    }).required(),
    email_verified: Joi.boolean(),
    items: Joi.object().keys({
        items: Joi.array().items(Joi.array().items(Joi.number().integer(), null))
    }).required(),
    country: Joi.string().max(50),
    hero: Joi.object().keys({
        exp: Joi.number().integer().min(0).required(),
    }).required(),
    vars: Joi.object().keys({
        __LBOX_T: Joi.number().integer().required(),
    }).required(),
}).required();

