import { PlayerData, PlayerDataInfo } from "../../../entities/player-data";
import { EntityMapper } from "../../../entities/entity-mapper";
import * as Joi from 'joi';

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

export class AuthDataParser extends EntityMapper<AuthData> {
    constructor() {
        super(['csrftoken', 'sessionid', 'cook'], schema)
    }
}

const schema = Joi.object().keys({
    cook: Joi.string().trim().alphanum().min(12).max(40),
    csrftoken: Joi.string().trim().min(12).max(100).required(),
    sessionid: Joi.string().trim().alphanum().min(12).max(40).required(),
}).required();
