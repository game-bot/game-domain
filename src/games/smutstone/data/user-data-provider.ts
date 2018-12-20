import { PlayerDataProvider } from "../../../player/player-data-provider";
import { IPlayerDataRepository } from "../../../repositories/player-data-repository";
import { UserDataFetcher } from "./user-data-fetcher";
import { UserData, UserDataInfo } from "./user-data";
import { AuthDataProvider } from "./auth-data-provider";
import { SmutstoneApi } from "../api";

export class UserDataProvider extends PlayerDataProvider<UserData> {
    constructor(rep: IPlayerDataRepository, api: SmutstoneApi) {
        super(UserDataInfo, rep, new UserDataFetcher(api, new AuthDataProvider(rep, api)));
    }
}
