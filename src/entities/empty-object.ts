import * as Joi from "joi";
import { EntityMapper } from "./entity-mapper";

export type EmptyObject = {}

export class EmptyEntityMapper extends EntityMapper<EmptyObject> {
    constructor() {
        super([], Joi.object().keys({}))
    }
}
