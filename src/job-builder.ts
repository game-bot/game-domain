import { IPlayerDataRepository } from "./repositories/player-data-repository";
import { SmutstoneJobBuilder } from "./games/smutstone/job-builder";
import { IGameJob } from "./game-job";
import { GameJobInfo } from "./entities/game-job-info";


export class JobBuilder {
    private smutstoneBuilder: SmutstoneJobBuilder

    constructor(dataRepository: IPlayerDataRepository) {
        this.smutstoneBuilder = new SmutstoneJobBuilder(dataRepository);
    }

    build(jobInfo: GameJobInfo): IGameJob {
        switch (jobInfo.gameId) {
            case 'smutstone': return this.smutstoneBuilder.build(jobInfo);
        }

        throw new Error(`Invalid game id: ${jobInfo.gameId}`);
    }
}
