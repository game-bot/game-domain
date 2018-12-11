import { AuthData, AuthDataInfo } from "./auth-data";
import { PlayerDataProvider } from "../../../data/player-data-provider";
import { IPlayerDataRepository } from "../../../data/player-data-repository";
import { AuthDataFetcher } from "./auth-data-fetcher";

export class AuthDataProvider extends PlayerDataProvider<AuthData> {
    constructor(rep: IPlayerDataRepository<AuthData>) {
        super(AuthDataInfo, rep, new AuthDataFetcher());
    }
}
