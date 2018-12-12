import { IPlayerDataRepository } from "./data/player-data-repository";
import { SmutstoneJobBuilder } from "./games/smutstone/job-builder";
import { GameJobInfo } from "./game-job-info";
import { IGameJob } from "./game-job";


export class JobBuilder {
    private smutstoneBuilder: SmutstoneJobBuilder

    constructor(dataRepository: IPlayerDataRepository<any>) {
        this.smutstoneBuilder = new SmutstoneJobBuilder(dataRepository);
    }

    build(jobInfo: GameJobInfo): IGameJob {
        switch (jobInfo.gameId) {
            case 'smutstone': return this.smutstoneBuilder.build(jobInfo);
        }

        throw new Error(`Invalid game id: ${jobInfo.gameId}`);
    }
}
