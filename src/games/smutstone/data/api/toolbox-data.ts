import * as Joi from 'joi';
import { DataParser } from '../../../../data/data-parser';

export type ToolboxApiData = {
    rewards: any[]
}

export class ToolboxApiDataParser extends DataParser<ToolboxApiData> {
    constructor() {
        super(['rewards'], schema)
    }
}

const schema = Joi.object().keys({
    rewards: Joi.array().items(Joi.object())
}).required();

