import { AuthData, AuthDataInfo } from "./auth-data";
import { PlayerDataProvider } from "../../../data/player-data-provider";
import { IPlayerDataRepository } from "../../../data/player-data-repository";
import { AuthDataFetcher } from "./auth-data-fetcher";
import { SmutstoneApi } from "../api";

export class AuthDataProvider extends PlayerDataProvider<AuthData> {
    constructor(rep: IPlayerDataRepository<AuthData>, api: SmutstoneApi) {
        super(AuthDataInfo, rep, new AuthDataFetcher(api));
    }
}
