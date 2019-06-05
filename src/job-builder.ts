import { SmutstoneJobBuilder } from "./games/smutstone/job-builder";
import { IGameJob } from "./game-job";
import { GameJobInfo } from "./entities/game-job-info";
import { IApiClientRepository } from "./repositories/api-client-repository";

export class JobBuilder {
  private smutstoneBuilder: SmutstoneJobBuilder;

  constructor(repository: IApiClientRepository) {
    this.smutstoneBuilder = new SmutstoneJobBuilder(repository);
  }

  build(jobInfo: GameJobInfo): IGameJob {
    switch (jobInfo.gameId) {
      case "smutstone":
        return this.smutstoneBuilder.build(jobInfo);
    }

    throw new Error(`Invalid game id: ${jobInfo.gameId}`);
  }
}
