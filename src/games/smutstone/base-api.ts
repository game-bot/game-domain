
// const debug = require('debug')('gamebot:smutstone:api');

import { AuthData, AuthDataMapper, AuthDataIdentity } from "./data/auth-data";
import * as FormData from 'form-data';
import { GameApi, GameApiRootResponse, GameApiRequestParams, GameApiResponse, serializeCookies, parseSetCookie } from "../../game-api";
import { IDictionary } from "@gamebot/domain";
import { PlayerDataIndentity } from "../../entities/player-data";
import { Player } from "../../player/player";
import { UserDataIdentity, UserDataMapper, UserData } from "./data/user-data";
import { IPlayerDataRepository } from "../../repositories/player-data-repository";
import { EntityMapper } from "../../entities/entity-mapper";
import { ApiEndpoints } from "./data/endpoints";

export type ApiResponse = {
    ok: boolean
    data?: any,
    headers: IDictionary<string | string[] | undefined>
    statusCode?: number
}

export class BaseSmutstoneApi extends GameApi<ApiEndpoints> {
    private authDataMapper: AuthDataMapper
    private userDataMapper: UserDataMapper

    constructor(dataRepository: IPlayerDataRepository,
        endpoints: Map<ApiEndpoints, EntityMapper<any>>,
        private version: number = 28, defaultHeaders?: IDictionary<string>) {
        super(dataRepository, AuthDataIdentity, endpoints, defaultHeaders);
        this.authDataMapper = new AuthDataMapper();
        this.userDataMapper = new UserDataMapper();
    }

    gamePage(authData: Partial<AuthData>) {
        return this.request('https://smutstone.com/', { method: 'GET' }, authData as AuthData);
    }

    async userData(player: Player) {
        return (await this.dataProvider.get<UserData>(this, player, UserDataIdentity)).data;
    }

    async fetchPlayerData<DATA>(player: Player, dataIdentity: PlayerDataIndentity) {

        if (dataIdentity.identifier === AuthDataIdentity.identifier) {
            return (await this.fetchAuthData(player)) as any as DATA;
        }
        if (dataIdentity.identifier === UserDataIdentity.identifier) {
            return (await this.fetchUserData(player)) as any as DATA;
        }

        throw new Error(`Invalid player data identifier: ${dataIdentity.identifier}`);
    }

    protected async fetchUserData(player: Player) {
        const response = await this.gamePage({ cook: player.identity });

        const execResult = /userData = JSON.parse\('([^']+)'\);/i.exec(response.data);
        if (!execResult) {
            throw new Error(`Not fount userData in html`);
        }
        const jsonString = execResult[1].replace(/\\"/g, '\"')
        const jsonData = JSON.parse(jsonString);

        return this.userDataMapper.map(jsonData);
    }

    protected async fetchAuthData(player: Player) {
        if (!player.identity) {
            throw new Error(`Player identity data is invalid!`);
        }

        const response = await this.gamePage({ cook: player.identity });

        const cookies = parseSetCookie(response.headers && response.headers["set-cookie"] as string[] || []);

        const data: AuthData = this.authDataMapper.map(cookies);
        data.cook = player.identity;

        return data;
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

    protected prepareRequestParams(_url: string, params: GameApiRequestParams, authData: any): GameApiRequestParams {
        params.headers = params.headers || {};
        params.headers.Cookie = serializeCookies(authData);

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
            if (/new version available/.test(data.error)) {
                this.version++;
            }
            return data.error;
        }
    }
}
