import got = require("got");
import { parse as parseCookie } from 'cookie';
import { GamebotErrorDetails, GAMEBOT_ERROR_CODES, GamebotError } from "./errors";
import { IDictionary } from "@gamebot/domain";
import { Player } from "./player/player";
import { PlayerDataIndentity } from "./entities/player-data";
import { IPlayerDataProvider, PlayerDataProvider } from "./player/player-data-provider";
import { IPlayerDataRepository } from "./repositories/player-data-repository";
import { EntityMapper } from "./entities/entity-mapper";

export type GameApiResponse<DATA=any> = {
    ok: boolean
    data: DATA,
    headers?: IDictionary<string | string[] | undefined>
    statusCode?: number
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

export abstract class GameApi<ENDPOINT extends string=string> {
    protected readonly defaultHeaders: IDictionary<string>
    protected readonly dataProvider: IPlayerDataProvider

    constructor(dataRepository: IPlayerDataRepository,
        protected readonly authDataIdentity: PlayerDataIndentity,
        protected readonly endpoints: Map<ENDPOINT, EntityMapper<any>>,
        defaultHeaders?: IDictionary<string>) {

        this.dataProvider = new PlayerDataProvider(dataRepository);
        this.defaultHeaders = { ...DEFAULT_HEADERS, ...defaultHeaders };
    }

    async endpoint<D=any>(endpoint: ENDPOINT, player: Player, url: string, params: GameApiRequestParams) {
        const authData = await this.authenticate(player);
        const response = await this.request(url, params, authData);
        if (response.data) {
            const mapper = this.endpoints.get(endpoint);
            if (!mapper) {
                throw new Error(`No entity mapper for endpoint: ${endpoint}`);
            }
            response.data = mapper.map(response.data);
        }

        return response as GameApiResponse<D>;
    }

    async request<AD=any>(url: string, params: GameApiRequestParams, authData: AD): Promise<GameApiResponse> {
        params = this.prepareRequestParams(url, params, authData);
        params = { ...params };
        params.headers = { ...this.defaultHeaders, ...params.headers };
        params.timeout = params.timeout || 1000 * 5;

        const response = await got(url, params);

        return this.formatApiResponse({
            body: response.body,
            headers: response.headers,
            statusCode: response.statusCode,
        })
    }

    async authenticate<AD=any>(player: Player): Promise<AD> {
        return (await this.dataProvider.get<AD>(this, player, this.authDataIdentity)).data;
    }

    abstract async fetchPlayerData<DATA=any>(player: Player, dataIdentity: PlayerDataIndentity): Promise<DATA>

    protected abstract prepareRequestParams<AD=any>(url: string, params: GameApiRequestParams, authData: AD): GameApiRequestParams

    protected abstract formatApiResponse(apiResponse: GameApiRootResponse): GameApiResponse

    createError(response: GameApiResponse, details: GamebotErrorDetails, defaultMessage?: string, defaultStatusCode?: number) {
        if (response.ok) {
            return undefined;
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

export function serializeCookies(data: IDictionary<string>) {
    return Object.keys(data).reduce<string[]>((items, key) => {
        items.push(`${key}=${encodeURIComponent(data[key])}`);
        return items;
    }, []).join(';');
}

export function parseSetCookie(setCookie: string[]): IDictionary<string> {
    return setCookie
        .map(value => parseCookie(value))
        .reduce<IDictionary<string>>((dic, item) => Object.assign(dic, item), {});
}
