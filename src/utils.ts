import * as lodash from "lodash";
import { parse as parseCookie } from "cookie";
import { IDictionary } from "@gamebot/domain";

export function pickDeep<T, R = Partial<T>>(obj: T, keys: string[]): R {
  const copy: any = {};
  keys.forEach(key => {
    const value = lodash.get(obj, key);
    if (value !== undefined) {
      lodash.set(copy, key, value);
    }
  });

  return copy as R;
}

export function serializeCookies(data: IDictionary<string>) {
  return Object.keys(data)
    .reduce<string[]>((items, key) => {
      items.push(`${key}=${encodeURIComponent(data[key])}`);
      return items;
    }, [])
    .join(";");
}

export function parseSetCookie(setCookie: string[]): IDictionary<string> {
  return setCookie
    .map(value => parseCookie(value))
    .reduce<IDictionary<string>>((dic, item) => Object.assign(dic, item), {});
}
