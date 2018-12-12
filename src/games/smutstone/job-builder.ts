import { IPlayerDataRepository } from "../../data/player-data-repository";
import { GameJobInfo } from "../../game-job-info";
import { IGameJob } from "../../game-job";
import { DuelsJob } from "./jobs/duels-job";
import { IPlayerDataProvider } from "../../data/player-data-provider";
import { AuthData } from "./data/auth-data";
import { UserData } from "./data/user-data";
import { AuthDataProvider } from "./data/auth-data-provider";
import { UserDataProvider } from "./data/user-data-provider";
import { OpenBronzeBoxJob } from "./jobs/open-bronze-box-job";

export class SmutstoneJobBuilder {
    private authProvider: IPlayerDataProvider<AuthData>
    private userDataProvider: IPlayerDataProvider<UserData>

    constructor(dataRepository: IPlayerDataRepository<any>) {
        this.authProvider = new AuthDataProvider(dataRepository);
        this.userDataProvider = new UserDataProvider(dataRepository, dataRepository);
    }

    build(jobInfo: GameJobInfo): IGameJob {
        switch (jobInfo.id) {
            case 'duels': return new DuelsJob(this.authProvider, this.userDataProvider);
            case 'open-bronze-box': return new OpenBronzeBoxJob(this.authProvider, this.userDataProvider);
        }

        throw new Error(`Invalid job id: ${jobInfo.id}`);
    }
}
