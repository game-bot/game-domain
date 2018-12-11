const debug = require('debug')('gamebot');

import { Player } from "./player";
import { GameJobInfo } from "./game-job-info";
import { IGameTask } from "./game-task";
import { IPlayerDataProvider } from "./data/player-data-provider";
import { GamebotError } from "./errors";

export type GameJobResult = {
    ok: boolean
    error?: GamebotError
}

export interface IGameJob {
    execute(player: Player): Promise<GameJobResult>
}

export abstract class GameJob<AD> implements IGameJob {
    constructor(protected info: GameJobInfo, protected authProvider: IPlayerDataProvider<AD>) { }

    async execute(player: Player): Promise<GameJobResult> {
        const jobName = this.constructor.name;
        debug(`Start job: ${jobName}`);
        const result = await this.innerExecute(player);
        debug(`End job: ${jobName}`);
        return result;
    }

    protected async executeTasks(player: Player, authData: AD, tasks: IGameTask<AD>[]) {
        const result: GameJobResult = {
            ok: true
        }

        for (const task of tasks) {
            const taskResult = await task.execute(player, authData);
            if (!taskResult.ok) {
                if (!taskResult.continue) {
                    result.ok = false;
                    result.error = taskResult.error;
                    break;
                }
            }
        }

        return result;
    }

    protected abstract innerExecute(player: Player): Promise<GameJobResult>
}
