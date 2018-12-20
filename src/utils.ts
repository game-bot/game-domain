
import * as lodash from 'lodash';

export function pickDeep<T, R=Partial<T>>(obj: T, keys: string[]): R {
    const copy: any = {};
    keys.forEach(key => {
        const value = lodash.get(obj, key);
        if (value !== undefined) {
            lodash.set(copy, key, value);
        }
    });

    return copy as R;
}
