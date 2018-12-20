const debug = require('debug')('gamebot');

import { Player } from "./player/player";
import { GameTaskResultStatus, GameTaskResult } from "./game-task";
import { IPlayerDataProvider } from "./player/player-data-provider";
import { GamebotError, GamebotErrorDetails } from "./errors";
import { GameResourcesData, GameResources } from "./game-resources";
import { dataGameJobByFile } from "./data";
import { GameJobInfo } from "./entities/game-job-info";

export type GameJobResult = {
    gameId: string
    playerId: string
    jobId: string
    status: GameTaskResultStatus
    error?: GamebotError
    resources?: GameResourcesData
    tasks?: GameTaskResult[]
    startAt?: string
    endAt?: string
}

export interface IGameJob {
    execute(player: Player): Promise<GameJobResult>
}

export abstract class GameJob<AD> implements IGameJob {
    protected info: GameJobInfo
    constructor(jobFile: string, protected authProvider: IPlayerDataProvider<AD>) {
        const info = dataGameJobByFile(jobFile);
        if (!info) {
            throw new Error(`Invalid job file path: ${jobFile}`);
        }

        this.info = info;
    }

    async execute(player: Player): Promise<GameJobResult> {
        const jobName = this.constructor.name;
        debug(`Start job: ${jobName}`);
        const startAt = new Date().toISOString();
        const result = await this.innerExecute(player);
        const endAt = new Date().toISOString();
        result.startAt = startAt;
        result.endAt = endAt;
        debug(`End job: ${jobName}`);
        return result;
    }

    protected async createJobResultFromTaskResults(taskResults: GameTaskResult[]) {
        if (taskResults.length === 0) {
            throw new Error(`taskResults.length must be > 0`);
        }

        const result = this.createJobResultFromTaskResult(taskResults[taskResults.length - 1]);

        if (taskResults.length > 0) {
            const resourcesList = taskResults.map(item => item.resources).filter(item => !!item) as GameResourcesData[];
            const resources = GameJob.mergeGameResources(resourcesList);
            result.resources = resources.getData();
        }

        result.tasks = taskResults;

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
        const result = this.createJobResult(taskResult);
        result.tasks = [taskResult];

        return result;
    }

    protected createJobResult({ playerId, error, resources, status, tasks }:
        {
            playerId: string,
            error?: GamebotError,
            resources?: GameResourcesData,
            status?: GameTaskResultStatus,
            tasks?: GameTaskResult[]
        }) {

        status = status || (error ? 'error' : 'done');

        const result: GameJobResult = {
            jobId: this.info.id,
            gameId: this.info.gameId,
            status,
            playerId,
            error,
            resources,
            tasks,
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
