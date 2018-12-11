
import { createHash } from "crypto";
import * as lodash from 'lodash';

export function md5(value: string): string {
    return createHash('md5').update(value, 'utf8').digest('hex').toLowerCase();
}

export function sha1(value: string): string {
    return createHash('sha1').update(value, 'utf8').digest('hex').toLowerCase();
}

export function unixTime(date?: Date) {
    date = date || new Date();

    return Math.floor(date.getTime() / 1000);
}

export type Dictionary<T> = { [index: string]: T }

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function pickDeep(obj: any, keys: string[]) {
    const copy: any = {};
    keys.forEach(key => {
        const value = lodash.get(obj, key);
        if (value !== undefined) {
            lodash.set(copy, key, value);
        }
    });

    return copy;
}
