
// const debug = require('debug')('gamebot:smutstone:api');

import { Dictionary } from "../../utils";
import got = require("got");
import { parse as parseCookie } from 'cookie';
import { AuthData } from "./data/auth-data";
import { GamebotError, GAMEBOT_ERROR_CODES, GamebotErrorDetails } from "../../errors";
import * as FormData from 'form-data';

export type ApiResponse = {
    ok: boolean
    data?: any,
    headers: Dictionary<string | string[] | undefined>
    statusCode?: number
}

export class Api {
    static async gamePage(auth: string | AuthData) {
        const headers: Dictionary<string> = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
            'Accept-Language': 'ro,en-US;q=0.9,en;q=0.8,cs;q=0.7,es;q=0.6,hu;q=0.5,it;q=0.4,lt;q=0.3,ru;q=0.2,sk;q=0.1,uk;q=0.1,pl;q=0.1,bg;q=0.1,mo;q=0.1',
        }

        const cookieData: Dictionary<string> = typeof auth === 'string' ? { cook: auth } : auth;

        headers.Cookie = serializeCookies(cookieData);

        const response = await got('https://smutstone.com/', { headers });

        return response;
    }

    static async call(authData: AuthData, data: any): Promise<ApiResponse> {
        let headers: Dictionary<string> = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
            'Accept-Language': 'ro,en-US;q=0.9,en;q=0.8,cs;q=0.7,es;q=0.6,hu;q=0.5,it;q=0.4,lt;q=0.3,ru;q=0.2,sk;q=0.1,uk;q=0.1,pl;q=0.1,bg;q=0.1,mo;q=0.1',
            'x-csrftoken': authData.csrftoken,
            Origin: 'https://smutstone.com',
            Referer: 'https://smutstone.com/',
            Host: 'smutstone.com',
        }

        data.v = 26;

        headers.Cookie = serializeCookies(authData);
        const form = new FormData();
        form.append('data', JSON.stringify(data));

        headers = Object.assign(form.getHeaders(), headers);

        const response = await got('https://smutstone.com/api/', { headers, body: form, method: 'POST' });

        // console.log('typeof body', typeof response.body);

        const body = JSON.parse(response.body);

        // console.log('body', body);

        const ok = body && body.result === 'ok';

        return {
            ok,
            data: body && body.response || undefined,
            headers: response.headers,
            statusCode: response.statusCode,
        }
    }

    static createError(response: ApiResponse, details: GamebotErrorDetails, defaultMessage?: string, defaultStatusCode?: number) {
        if (response.ok) {
            return undefined;
        }
        let code: GAMEBOT_ERROR_CODES = GAMEBOT_ERROR_CODES.UNKNOWN_ERROR;
        let message = response.data && response.data.error;

        const statusCode = response.statusCode;

        if (statusCode) {
            if (statusCode >= 400 && statusCode < 500) {
                code = GAMEBOT_ERROR_CODES.API_400_ERROR;
            } else if (statusCode >= 500) {
                code = GAMEBOT_ERROR_CODES.API_500_ERROR;
            }
        }

        return new GamebotError(code, message || defaultMessage || 'Unknown', details, statusCode || defaultStatusCode || 500);
    }
}

export function serializeCookies(data: Dictionary<string>) {
    return Object.keys(data).reduce<string[]>((items, key) => {
        items.push(`${key}=${encodeURIComponent(data[key])}`);
        return items;
    }, []).join(';');
}

export function parseSetCookie(setCookie: string[]): Dictionary<string> {
    return setCookie
        .map(value => parseCookie(value))
        .reduce<Dictionary<string>>((dic, item) => Object.assign(dic, item), {});
}
