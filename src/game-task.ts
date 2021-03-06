const debug = require("debug")("gamebot");

import { Player } from "./entities/player";
import { GamebotError, GamebotErrorDetails } from "./errors";
import { GameResourcesData } from "./game-resources";
import { GameJobInfo } from "./entities/game-job-info";

export type GameTaskResultStatus = "done" | "error" | "waiting";

export type GameTaskResult<RD = any> = {
  gameId: string;
  playerId: string;
  taskId: string;
  status: GameTaskResultStatus;
  error?: GamebotError;
  data?: RD;
  resources?: GameResourcesData;
  startAt?: string;
  endAt?: string;
};

export interface IGameTask {
  execute(player: Player, data?: any): Promise<GameTaskResult>;
}

export abstract class GameTask<RD = any> implements IGameTask {
  constructor(protected info: GameJobInfo) {}

  async execute(player: Player, data?: any): Promise<GameTaskResult<RD>> {
    const taskName = this.constructor.name;
    debug(`Start task: ${taskName}`);
    const startAt = new Date().toISOString();
    const result = await this.innerExecute(player, data);
    const endAt = new Date().toISOString();
    result.startAt = startAt;
    result.endAt = endAt;
    debug(`End task: ${taskName}`);

    return result;
  }

  protected abstract innerExecute(
    player: Player,
    data?: any
  ): Promise<GameTaskResult<RD>>;

  getTaskId() {
    return this.constructor.name;
  }

  protected createTaskResult({
    error,
    data,
    resources,
    status,
    playerId
  }: {
    error?: GamebotError;
    data?: RD;
    resources?: GameResourcesData;
    status?: GameTaskResultStatus;
    playerId: string;
  }) {
    status = status || (error ? "error" : "done");

    const result: GameTaskResult<RD> = {
      playerId,
      gameId: this.info.gameId,
      taskId: this.getTaskId(),
      status,
      error,
      data,
      resources
    };

    return result;
  }

  protected createErrorDetails(data?: any) {
    const details: GamebotErrorDetails = {
      gameId: this.info.gameId,
      jobId: this.info.id,
      taskId: this.getTaskId(),
      data
    };

    return details;
  }
}
