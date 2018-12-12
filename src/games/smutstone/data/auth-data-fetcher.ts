import { PlayerDataFetcher } from "../../../data/player-data-fetcher";
import { Player } from "../../../player";
import { AuthData, AuthDataParser } from "./auth-data";
import { SmutstoneApi } from "../api";
import { parseSetCookie } from "../../../game-api";

export class AuthDataFetcher extends PlayerDataFetcher<AuthData, SmutstoneApi> {
    private parser: AuthDataParser
    constructor(api: SmutstoneApi) {
        super(api);
        this.parser = new AuthDataParser();
    }

    async fetch(player: Player): Promise<AuthData> {
        if (!player.identity || !player.identity.cook) {
            throw new Error(`Player identity data is invalid!`);
        }
        const authData: AuthData = { cook: player.identity.cook, csrftoken: '', sessionid: '' };

        const response = await this.api.gamePage(authData);

        const cookies = parseSetCookie(response.headers && response.headers["set-cookie"] as string[] || []);

        const data: AuthData = this.parser.parse(cookies);
        data.cook = authData.cook;

        return data;
    }
}
