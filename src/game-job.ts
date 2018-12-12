const debug = require('debug')('gamebot');

import { Player } from "./player";
import { GameJobInfo } from "./game-job-info";
import { GameTaskResultStatus, GameTaskResult } from "./game-task";
import { IPlayerDataProvider } from "./data/player-data-provider";
import { GamebotError, GamebotErrorDetails } from "./errors";
import { GameResourcesData, GameResources } from "./game-resources";

export type GameJobResult = {
    gameId: string
    playerId: string
    jobId: string
    status: GameTaskResultStatus
    error?: GamebotError
    resources?: GameResourcesData
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

    protected async createJobResultFromTaskResults(taskResults: GameTaskResult[]) {

        const result = this.createJobResultFromTaskResult(taskResults[taskResults.length - 1]);

        if (taskResults.length > 0) {
            const resourcesList = taskResults.map(item => item.resources).filter(item => !!item) as GameResourcesData[];
            const resources = GameJob.mergeGameResources(resourcesList);
            result.resources = resources.getData();
        }

        return result;
    }

    static mergeGameResources<R extends string=string>(resources: GameResourcesData[]) {
        const total = new GameResources<R>();

        for (const item of resources) {
            Object.keys(item).forEach(key => {
                total.inc(key as R, ((<any>item)[key] || 0));
            });
        }

        return total;
    }

    protected abstract innerExecute(player: Player): Promise<GameJobResult>

    protected createJobResultFromTaskResult(taskResult: GameTaskResult) {
        return this.createJobResult(taskResult);
    }

    protected createJobResult({ playerId, error, resources, status }:
        {
            playerId: string,
            error?: GamebotError,
            resources?: GameResourcesData,
            status?: GameTaskResultStatus
        }) {

        status = status || (error ? 'error' : 'done');

        const result: GameJobResult = {
            jobId: this.info.id,
            gameId: this.info.gameId,
            status,
            playerId,
            error,
            resources,
        }

        return result;
    }

    protected createErrorDetails(data?: any) {
        const details: GamebotErrorDetails = {
            gameId: this.info.gameId,
            jobId: this.info.id,
            data,
        };

        return details;
    }
}
