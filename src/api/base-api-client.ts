const debug = require('debug')('gamebot:api');

import got = require("got");
import { IDictionary } from "@gamebot/domain";
import { Player } from "../entities/player";
import { GamebotErrorDetails, GAMEBOT_ERROR_CODES, GamebotError } from "../errors";

export type GameApiResponse<DATA=any> = {
    ok: boolean
    data: DATA,
    headers?: IDictionary<string | string[] | undefined>
    statusCode?: number
    error?: GamebotError
}

export type GameApiRequestParams = {
    method: 'GET' | 'POST'
    headers?: IDictionary<string>
    body?: any
    timeout?: number
}

export type GameApiRootResponse = {
    body?: string
    statusCode?: number
    headers?: IDictionary<string | string[] | undefined>
}

const DEFAULT_HEADERS: IDictionary<string> = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
    'Accept-Language': 'en,en-US;q=0.9,en;q=0.8,cs;q=0.7,es;q=0.6,hu;q=0.5,it;q=0.4,lt;q=0.3,ru;q=0.2,sk;q=0.1,uk;q=0.1,pl;q=0.1,bg;q=0.1,mo;q=0.1',
}

export abstract class BaseApiClient {
    protected readonly defaultHeaders: IDictionary<string>

    constructor(defaultHeaders?: IDictionary<string>) {
        this.defaultHeaders = { ...DEFAULT_HEADERS, ...defaultHeaders };
    }

    async httpRequest<AD=any>(url: string, params: GameApiRequestParams, authData?: AD): Promise<GameApiResponse> {
        params = { ...params };
        params = this.formatHttpRequestParams(url, params, authData);
        params.headers = { ...this.defaultHeaders, ...params.headers };
        params.timeout = params.timeout || 1000 * 5;

        debug(`http ${params.method} ${url}, ${params.headers.Cookie} - ${new Date()}`);

        const response = await got(url, params);

        // debug(`http ${params.method} ${url} - ${new Date()}`);

        return this.formatApiResponse({
            body: response.body,
            headers: response.headers,
            statusCode: response.statusCode,
        })
    }

    abstract async authenticate<AD=any>(player: Player): Promise<AD>

    protected abstract formatHttpRequestParams<AD=any>(url: string, params: GameApiRequestParams, authData?: AD): GameApiRequestParams

    protected abstract formatApiResponse(apiResponse: GameApiRootResponse): GameApiResponse

    createError(response: GameApiResponse, details: GamebotErrorDetails, defaultMessage?: string, defaultStatusCode?: number) {
        if (response.ok) {
            return undefined;
        }
        if (response.error && response.error instanceof GamebotError) {
            (<any>response.error).details = { ...details, ...response.error.details };
            return response.error;
        }
        let code: GAMEBOT_ERROR_CODES = GAMEBOT_ERROR_CODES.UNKNOWN_ERROR;
        let message = this.parseErrorMessage(response);

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

    abstract parseErrorMessage(response: GameApiResponse): string | undefined
}
