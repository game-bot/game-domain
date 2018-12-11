import { IPlayerDataRepository } from "./data/player-data-repository";
import { SmutestoneJobBuilder } from "./games/smutstone/job-builder";
import { GameJobInfo } from "./game-job-info";
import { IGameJob } from "./game-job";


export class JobBuilder {
    private smutestoneBuilder: SmutestoneJobBuilder

    constructor(dataRepository: IPlayerDataRepository<any>) {
        this.smutestoneBuilder = new SmutestoneJobBuilder(dataRepository);
    }

    build(jobInfo: GameJobInfo): IGameJob {
        switch (jobInfo.gameId) {
            case 'smutestone': return this.smutestoneBuilder.build(jobInfo);
        }

        throw new Error(`Invalid game id: ${jobInfo.gameId}`);
    }
}
