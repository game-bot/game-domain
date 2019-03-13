import * as Joi from 'joi';
import { EntityMapper } from '../../../../entities/entity-mapper';
import { IDictionary } from '@gamebot/domain';

export type PvpLoadApiData = {
    chests: PvpChestApiData[]
    points: number
    starChest: PvpStarChestApiData
    slots: number
}

export type PvpChestApiData = { added: number, rarity: number, id: number, league: number }
export type PvpStarChestApiData = { stars: number, last: number, league: number }

export class PvpLoadApiDataParser extends EntityMapper<PvpLoadApiData> {
    constructor() {
        super(['chests', 'points', 'starChest', 'slots'], pvpSchema.required())
    }
}

export type PvpClaimChestApiData = {
    unlocked: boolean
    reward?: IDictionary<any>
}

export class PvpClaimChestApiDataParser extends EntityMapper<PvpClaimChestApiData> {
    constructor() {
        super(['unlocked', 'reward'], claimChestSchema.required())
    }
}

export type PvpBattleFightApiData = {
    chest?: PvpChestApiData
    result: {
        result: string
    }
    starChest: PvpStarChestApiData
    pointsGain: number
}

export class PvpBattleFightApiDataMapper extends EntityMapper<PvpBattleFightApiData> {
    constructor() {
        super(['chest', 'result', 'starChest', 'pointsGain'], fightBattleSchema.required())
    }
}

const chestSchema = Joi.object().keys({
    added: Joi.number().integer().required(),
    rarity: Joi.number().integer().required(),
    id: Joi.number().integer().required(),
    league: Joi.number().integer().required(),
});

const starChestSchema = Joi.object().keys({
    stars: Joi.number().integer().required(),
    last: Joi.number().integer().required(),
    league: Joi.number().integer().required(),
});

const fightBattleSchema = Joi.object().keys({
    chest: chestSchema.allow(null),
    result: Joi.object().keys({
        result: Joi.string().required(),
    }).required(),
    starChest: starChestSchema.required(),
    pointsGain: Joi.number().integer().required(),
});

const claimChestSchema = Joi.object().keys({
    unlocked: Joi.bool(),
    reward: Joi.object(),
});

const pvpSchema = Joi.object().keys({
    chests: Joi.array().items(chestSchema).required(),
    points: Joi.number().integer().positive().required(),
    starChest: starChestSchema.required(),
    slots: Joi.number().integer().positive().required(),
});