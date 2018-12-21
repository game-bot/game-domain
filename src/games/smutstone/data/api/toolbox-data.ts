import * as Joi from 'joi';
import { EntityMapper } from '../../../../entities/entity-mapper';

export type LootboxOpenApiData = {
    rewards: any[]
}

export class LootboxOpenApiDataMapper extends EntityMapper<LootboxOpenApiData> {
    constructor() {
        super(['rewards'], schema)
    }
}

const schema = Joi.object().keys({
    rewards: Joi.array().items(Joi.object())
}).required();

