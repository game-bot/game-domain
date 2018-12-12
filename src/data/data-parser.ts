import { AnySchema, validate } from "joi";
import { pickDeep } from "../utils";

export type DataParserValidationResult<DATA> = {
    value: DATA
    error?: Error
}

export abstract class DataParser<DATA> {
    constructor(private pickFields: string[], private validateSchema: AnySchema) {

    }

    parse(data: any) {
        const newData = pickDeep(data, this.pickFields);

        const valid = this.validate(newData);

        if (valid.error) {
            throw valid.error;
        }

        return valid.value;
    }

    validate(data: DATA): DataParserValidationResult<DATA> {
        const result = validate<DATA>(data, this.validateSchema, { abortEarly: true, allowUnknown: true, stripUnknown: true });

        return {
            value: result.value,
            error: result.error,
        }
    }
}
