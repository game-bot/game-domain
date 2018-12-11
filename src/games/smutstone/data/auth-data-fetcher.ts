import { PlayerDataFetcher } from "../../../data/player-data-fetcher";
import { Player } from "../../../player";
import { AuthData } from "./auth-data";
import { Api, parseSetCookie } from "../api";
import { pick } from "lodash";
import got = require("got");

export class AuthDataFetcher extends PlayerDataFetcher<AuthData> {

    async fetch(player: Player): Promise<AuthData> {
        if (!player.identity || !player.identity.cook) {
            throw new Error(`Player identity data is invalid!`);
        }
        const cook = player.identity.cook;

        const response = await Api.gamePage(cook);

        return AuthDataFetcher.parseAuthData(response, cook);
    }

    static parseAuthData(response: got.Response<any>, cook: string) {
        const cookies = parseSetCookie(response.headers["set-cookie"] || []);

        const data: AuthData = pick(cookies, ['csrftoken', 'sessionid', 'cook']);
        data.cook = cook;

        return data;
    }
}
