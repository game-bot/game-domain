
const debug = require('debug')('gamebot:smutstone:api');

import { AuthData } from "./data/auth-data";
import * as FormData from 'form-data';
import { IDictionary } from "@gamebot/domain";
import { Player } from "../../entities/player";
import { UserData } from "./data/user-data";
import { ApiEndpoints, ApiEndpointInfo } from "./data/endpoints";
import { IApiClientRepository } from "../../repositories/api-client-repository";
import { ApiCient, ApiEndpointCacheInfo } from "../../api/api-client";
import { GameApiRequestParams, GameApiResponse, GameApiRootResponse } from "../../api/base-api-client";
import { parseSetCookie, serializeCookies } from "../../utils";

export type ApiResponse = {
    ok: boolean
    data?: any,
    headers: IDictionary<string | string[] | undefined>
    statusCode?: number
}



export class BaseSmutstoneApi extends ApiCient<ApiEndpoints> {

    constructor(repository: IApiClientRepository,
        private _endpoints: Map<ApiEndpoints, ApiEndpointInfo>,
        private version: number = 44, defaultHeaders?: IDictionary<string>) {
        super(repository, defaultHeaders);
    }

    async endpoint<DATA>(endpoint: ApiEndpoints, player: Player, url: string, params: GameApiRequestParams, authData?: any) {
        const response = await super.endpoint<DATA>(endpoint, player, url, params, authData);
        if (response.data) {
            if (/new version available/.test((<any>response.data).error || '')) {
                debug(`Increment api version: ${this.version}`);
                this.version++;
            }
        }

        return response;
    }

    async authenticate<AD=AuthData>(player: Player) {
        const response = await this.endpoint<AD>(ApiEndpoints.authenticate, player, 'https://smutstone.com/', { method: 'GET' }, { cook: player.identity });
        return response.data;
    }

    async userData(player: Player) {
        const response = await this.endpoint<UserData>(ApiEndpoints.user_data, player, 'https://smutstone.com/', { method: 'GET' });
        return response.data;
    }

    async endpointCall<DATA>(endpoint: ApiEndpoints, player: Player, args: any) {
        const params: GameApiRequestParams = { method: 'POST' };
        const form = new FormData();
        const data = { method: endpoint, args, v: this.version };
        form.append('data', JSON.stringify(data));
        params.body = form;
        params.headers = Object.assign(form.getHeaders(), params.headers);

        return this.endpoint<DATA>(endpoint, player, 'https://smutstone.com/api/', params);
    }

    protected mapEndpointData<DATA>(endpoint: ApiEndpoints, response: GameApiResponse, player: Player): DATA {
        const item = this._endpoints.get(endpoint);

        if (item) {
            debug(`got endpoint data: ${endpoint}-${item.ttl}`);
            let data = response.data;
            if (endpoint === ApiEndpoints.authenticate) {
                const cookie = response.headers && response.headers["set-cookie"] as string[] || [];
                cookie.push(`cook=${player.identity}`);
                data = parseSetCookie(cookie);
            } else if (endpoint === ApiEndpoints.user_data) {
                const execResult = /userData = JSON.parse\('([^']+)'\);/i.exec(data);
                if (!execResult) {
                    throw new Error(`Not fount userData in html`);
                }
                const jsonString = execResult[1].replace(/\\"/g, '\"')
                data = JSON.parse(jsonString);
            }
            return item.mapper.map(data) as DATA;
        }
        return response.data;
    }

    protected getEndpointCacheInfo(endpoint: ApiEndpoints, player: Player, url: string) {
        const item = this._endpoints.get(endpoint);
        if (!item) {
            debug(`NO endpoint cahe info: ${endpoint}`);
            return null;
        }
        return {
            key: `${endpoint}_${player.id}_${url}`,
            ttl: item.ttl,
        } as ApiEndpointCacheInfo;
    }

    protected formatHttpRequestParams(_url: string, params: GameApiRequestParams, authData: any): GameApiRequestParams {
        params.headers = params.headers || {};
        params.headers.Cookie = serializeCookies(authData || {});

        if (params.body) {

        }

        if (authData.csrftoken) {
            params.headers['x-csrftoken'] = authData.csrftoken;
            params.headers.Origin = 'https://smutstone.com';
            params.headers.Referer = 'https://smutstone.com/';
            params.headers.Host = 'smutstone.com';
        }

        return params;
    }

    protected formatApiResponse(apiResponse: GameApiRootResponse): GameApiResponse {
        let ok = true;
        let body: any;
        try {
            body = apiResponse.body && JSON.parse(apiResponse.body);
            ok = body && body.result === 'ok';
        } catch (e) {
            ok = false;
        }

        return {
            ok,
            data: body && body.response || body || apiResponse.body,
            headers: apiResponse.headers,
            statusCode: apiResponse.statusCode,
        }
    }

    parseErrorMessage(response: GameApiResponse): string | undefined {
        const data = response.data;//typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        if (data && typeof data.error === 'string') {
            return data.error;
        }
    }
}
