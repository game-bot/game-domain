import { IPlayerDataRepository } from "../../repositories/player-data-repository";
import { IGameJob } from "../../game-job";
import { AuthDataProvider } from "./data/auth-data-provider";
import { UserDataProvider } from "./data/user-data-provider";
import { SmutstoneApi } from "./api";
import { GameJobInfo } from "../../entities/game-job-info";

interface JobConstructor {
    new(api: SmutstoneApi, authData: AuthDataProvider, userData: UserDataProvider): IGameJob;
}

export class SmutstoneJobBuilder {
    private authProvider: AuthDataProvider
    private userDataProvider: UserDataProvider

    constructor(dataRepository: IPlayerDataRepository, private api: SmutstoneApi) {
        this.authProvider = new AuthDataProvider(dataRepository, api);
        this.userDataProvider = new UserDataProvider(dataRepository, api);
    }

    private getJobCreator(id: string) {
        if (!/^[a-z0-9_-]+$/.test(id)) {
            throw new Error(`Invalid job id: ${id}`);
        }
        return require(`./jobs/${id}.js`).default as JobConstructor
    }

    build(jobInfo: GameJobInfo): IGameJob {
        const create = this.getJobCreator(jobInfo.id);

        if (!create) {
            throw new Error(`Invalid job id: ${jobInfo.id}`);
        }

        return new create(this.api, this.authProvider, this.userDataProvider);
    }
}
