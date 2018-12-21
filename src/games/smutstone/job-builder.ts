import { IPlayerDataRepository } from "../../repositories/player-data-repository";
import { IGameJob } from "../../game-job";
import { SmutstoneApi } from "./api";
import { GameJobInfo } from "../../entities/game-job-info";

interface JobConstructor {
    new(api: SmutstoneApi): IGameJob;
}

export class SmutstoneJobBuilder {
    private api: SmutstoneApi

    constructor(dataRepository: IPlayerDataRepository) {
        this.api = new SmutstoneApi(dataRepository);
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
