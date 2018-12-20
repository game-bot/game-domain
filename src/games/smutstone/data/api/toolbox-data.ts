import * as Joi from 'joi';
import { EntityMapper } from '../../../../entities/entity-mapper';

export type ToolboxApiData = {
    rewards: any[]
}

export class ToolboxApiDataParser extends EntityMapper<ToolboxApiData> {
    constructor() {
        super(['rewards'], schema)
    }
}

const schema = Joi.object().keys({
    rewards: Joi.array().items(Joi.object())
}).required();

