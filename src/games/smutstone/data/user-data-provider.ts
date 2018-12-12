import { PlayerDataProvider } from "../../../data/player-data-provider";
import { IPlayerDataRepository } from "../../../data/player-data-repository";
import { UserDataFetcher } from "./user-data-fetcher";
import { UserData, UserDataInfo } from "./user-data";
import { AuthDataProvider } from "./auth-data-provider";
import { AuthData } from "./auth-data";
import { SmutstoneApi } from "../api";

export class UserDataProvider extends PlayerDataProvider<UserData> {
    constructor(rep: IPlayerDataRepository<UserData>, authRep: IPlayerDataRepository<AuthData>, api: SmutstoneApi) {
        super(UserDataInfo, rep, new UserDataFetcher(api, new AuthDataProvider(authRep, api)));
    }
}
