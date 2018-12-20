// const debug = require('debug')('gamebot:smutstone:data');

import { Player } from "../../../player/player";
import { SmutstoneApi } from "../api";
import { UserData, UserDataParser } from "./user-data";
import { IPlayerDataProvider } from "../../../player/player-data-provider";
import { AuthData } from "./auth-data";
import { PlayerDataFetcher } from "../../../player/player-data-fetcher";

export class UserDataFetcher extends PlayerDataFetcher<UserData, SmutstoneApi> {
    private parser: UserDataParser
    constructor(api: SmutstoneApi, private authProvider: IPlayerDataProvider<AuthData>) {
        super(api);
        this.parser = new UserDataParser();
    }

    async fetch(player: Player): Promise<UserData> {
        const authData = await this.authProvider.get(player);

        const response = await this.api.gamePage(authData.data);

        const execResult = /userData = JSON.parse\('([^']+)'\);/i.exec(response.data);
        if (!execResult) {
            throw new Error(`Not fount userData in html`);
        }
        const jsonString = execResult[1].replace(/\\"/g, '\"')
        const jsonData = JSON.parse(jsonString);

        return this.parser.map(jsonData);
    }
}
