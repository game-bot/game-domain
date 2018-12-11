const debug = require('debug')('gamebot:smutstone:data');

import { PlayerDataFetcher } from "../../../data/player-data-fetcher";
import { Player } from "../../../player";
import { Api } from "../api";
import { UserData, UserDataPickFields } from "./user-data";
import { IPlayerDataProvider } from "../../../data/player-data-provider";
import { AuthData } from "./auth-data";
import { pickDeep } from "../../../utils";

export class UserDataFetcher extends PlayerDataFetcher<UserData> {

    constructor(private authProvider: IPlayerDataProvider<AuthData>) {
        super();
    }

    async fetch(player: Player): Promise<UserData> {
        const authData = await this.authProvider.get(player);

        const response = await Api.gamePage(authData.data);

        const execResult = /userData = JSON.parse\('([^']+)'\);/i.exec(response.body);
        if (!execResult) {
            throw new Error(`Not fount userData in html`);
        }
        const jsonString = execResult[1].replace(/\\"/g, '\"')
        const jsonData = JSON.parse(jsonString);
        const data = pickDeep(jsonData, UserDataPickFields) as UserData;

        debug(`got userData=${JSON.stringify(data)}`);

        return data;
    }
}
