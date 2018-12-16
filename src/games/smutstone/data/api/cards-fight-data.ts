import * as Joi from 'joi';
import { DataParser } from '../../../../data/data-parser';
import { Dictionary } from '../../../../utils';

export type CardsFightApiData = {
    result: {
        result: string
    }
    rewards?: Dictionary<any>[]
}

export class CardsFightApiDataParser extends DataParser<CardsFightApiData> {
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
