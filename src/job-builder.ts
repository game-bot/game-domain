import { IPlayerDataRepository } from "./data/player-data-repository";
import { SmutstoneJobBuilder } from "./games/smutstone/job-builder";
import { GameJobInfo } from "./game-job-info";
import { IGameJob } from "./game-job";
import { SmutstoneApi } from "./games/smutstone/api";


export class JobBuilder {
    private smutstoneBuilder: SmutstoneJobBuilder

    constructor(dataRepository: IPlayerDataRepository<any>) {
        this.smutstoneBuilder = new SmutstoneJobBuilder(dataRepository, new SmutstoneApi());
    }

    build(jobInfo: GameJobInfo): IGameJob {
        switch (jobInfo.gameId) {
            case 'smutstone': return this.smutstoneBuilder.build(jobInfo);
        }

        throw new Error(`Invalid game id: ${jobInfo.gameId}`);
    }
}
