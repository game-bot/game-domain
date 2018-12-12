const debug = require('debug')('gamebot');

import { Player } from "./player";
import { GameJobInfo } from "./game-job-info";
import { GamebotError, GamebotErrorDetails } from "./errors";
import { GameResourcesData } from "./game-resources";

export type GameTaskResultStatus = 'done' | 'error' | 'waiting';

export type GameTaskResult<D=any> = {
    gameId: string
    playerId: string
    taskId: string
    status: GameTaskResultStatus
    continuable?: boolean
    error?: GamebotError
    data?: D
    resources?: GameResourcesData
}

export interface IGameTask<AD> {
    execute(player: Player, authData: AD, data?: any): Promise<GameTaskResult>
}

export abstract class GameTask<AD, RD=any> implements IGameTask<AD> {
    constructor(protected info: GameJobInfo) { }

    async execute(player: Player, authData: AD, data?: any): Promise<GameTaskResult<RD>> {
        const taskName = this.constructor.name;
        debug(`Start task: ${taskName}`);
        const result = await this.innerExecute(player, authData, data);
        debug(`End task: ${taskName}`);

        return result;
    }

    protected abstract innerExecute(player: Player, authData: AD, data?: any): Promise<GameTaskResult<RD>>

    getTaskId() {
        return this.constructor.name;
    }

    protected createTaskResult({ continuable, error, data, resources, status, playerId }:
        {
            continuable?: boolean,
            error?: GamebotError,
            data?: RD,
            resources?: GameResourcesData,
            status?: GameTaskResultStatus,
            playerId: string,
        }) {

        status = status || (error ? 'error' : 'done');

        const result: GameTaskResult<RD> = {
            playerId,
            gameId: this.info.gameId,
            taskId: this.getTaskId(),
            status,
            continuable,
            error,
            data,
            resources,
        }

        return result;
    }

    protected createErrorDetails(data?: any) {
        const details: GamebotErrorDetails = {
            gameId: this.info.gameId,
            jobId: this.info.id,
            taskId: this.getTaskId(),
            data,
        };

        return details;
    }
}
