import { IGameJob } from "../../game-job";
import { SmutstoneApi } from "./api";
import { GameJobInfo } from "../../entities/game-job-info";
import { IApiClientRepository } from "../../repositories/api-client-repository";
import { API_VERSION } from "./config";

interface JobConstructor {
    new(api: SmutstoneApi): IGameJob;
}

export class SmutstoneJobBuilder {
    private api: SmutstoneApi

    constructor(repository: IApiClientRepository) {
        this.api = new SmutstoneApi(repository, API_VERSION);
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

        return new create(this.api);
    }
}
