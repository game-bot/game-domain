import { AnySchema, validate } from "joi";
import { pickDeep } from "../utils";

export type EntityMapperValidationResult<DATA> = {
    value: DATA
    error?: Error
}

export abstract class EntityMapper<DATA> {
    constructor(private pickFields: string[], private validateSchema: AnySchema) {

    }

    map(data: any) {
        const newData = pickDeep<any, DATA>(data, this.pickFields);

        const valid = this.validate(newData);

        if (valid.error) {
            throw valid.error;
        }

        return valid.value;
    }

    validate(data: DATA): EntityMapperValidationResult<DATA> {
        const result = validate<DATA>(data, this.validateSchema, { abortEarly: true, allowUnknown: true, stripUnknown: true });

        return {
            value: result.value,
            error: result.error,
        }
    }
}
