import * as Joi from 'joi';
import { EntityMapper } from '../../../../entities/entity-mapper';
import { IDictionary } from '@gamebot/domain';

export type CardsFightApiData = {
    result: {
        result: string
    }
    rewards?: IDictionary<any>[]
}

export class CardsFightApiDataParser extends EntityMapper<CardsFightApiData> {
    constructor() {
        super(['result', 'rewards'], schema.required())
    }
}

const schema = Joi.object().keys({
    result: Joi.object().keys({
        result: Joi.string().required(),
    }).required(),
    rewards: Joi.array().items(Joi.object()),
});
