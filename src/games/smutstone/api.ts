
// const debug = require('debug')('gamebot:smutstone:api');

import { Dictionary } from "../../utils";
import { AuthData } from "./data/auth-data";
import * as FormData from 'form-data';
import { GameApi, GameApiRootResponse, GameApiRequestParams, GameApiResponse, serializeCookies } from "../../game-api";

export type ApiResponse = {
    ok: boolean
    data?: any,
    headers: Dictionary<string | string[] | undefined>
    statusCode?: number
}

export class SmutstoneApi extends GameApi<AuthData> {
    constructor(private version: number = 27, defaultHeaders?: Dictionary<string>) {
        super(defaultHeaders);
    }

    gamePage(authData: AuthData) {
        return this.request('https://smutstone.com/', { method: 'GET' }, authData);
    }

    async apiCall(authData: AuthData, data: any) {
        const params: GameApiRequestParams = { method: 'POST' };
        const form = new FormData();
        data.v = this.version;
        form.append('data', JSON.stringify(data));
        params.body = form;

        params.headers = Object.assign(form.getHeaders(), params.headers);

        return await this.request('https://smutstone.com/api/', params, authData);
    }

    protected prepareRequestParams(_url: string, params: GameApiRequestParams, authData: AuthData): GameApiRequestParams {
        params.headers = params.headers || {};
        params.headers.Cookie = serializeCookies(authData);

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
            if (/new version available/.test(data.error)) {
                this.version++;
            }
            return data.error;
        }
    }
}
