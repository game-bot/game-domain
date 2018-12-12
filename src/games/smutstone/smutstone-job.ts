import { GameJob } from "../../game-job";
import { AuthData } from "./data/auth-data";
import { SmutstoneApi } from "./api";
import { GameJobInfo } from "../../game-job-info";
import { IPlayerDataProvider } from "../../data/player-data-provider";


export abstract class SmutstoneJob extends GameJob<AuthData> {
    constructor(info: GameJobInfo, authProvider: IPlayerDataProvider<AuthData>, protected api: SmutstoneApi) {
        super(info, authProvider);
    }
}
