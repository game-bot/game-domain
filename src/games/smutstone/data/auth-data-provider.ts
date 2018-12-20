import { AuthData, AuthDataInfo } from "./auth-data";
import { PlayerDataProvider } from "../../../player/player-data-provider";
import { IPlayerDataRepository } from "../../../repositories/player-data-repository";
import { AuthDataFetcher } from "./auth-data-fetcher";
import { SmutstoneApi } from "../api";

export class AuthDataProvider extends PlayerDataProvider<AuthData> {
    constructor(rep: IPlayerDataRepository, api: SmutstoneApi) {
        super(AuthDataInfo, rep, new AuthDataFetcher(api));
    }
}
