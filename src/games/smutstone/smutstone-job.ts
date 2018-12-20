import { GameJob } from "../../game-job";
import { AuthData } from "./data/auth-data";
import { SmutstoneApi } from "./api";
import { IPlayerDataProvider } from "../../player/player-data-provider";


export abstract class SmutstoneJob extends GameJob<AuthData> {
    constructor(file: string, authProvider: IPlayerDataProvider<AuthData>, protected api: SmutstoneApi) {
        super(file, authProvider);
    }
}
