import { DataParser } from "../../../data/data-parser";
import * as Joi from 'joi';

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

