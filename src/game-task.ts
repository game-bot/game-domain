const debug = require('debug')('gamebot:smutstone');

import { Player } from "./player";
import { GameJobInfo } from "./game-job-info";
import { GamebotError } from "./errors";

export type GameTaskResult<R=any> = {
    ok: boolean
    continue: boolean
    error?: GamebotError
    data?: R
}

export interface IGameTask<AD> {
    execute(player: Player, authData: AD, data?: any): Promise<GameTaskResult>
}

export abstract class GameTask<AD, R=any> implements IGameTask<AD> {
    constructor(protected info: GameJobInfo) { }

    async execute(player: Player, authData: AD, data?: any): Promise<GameTaskResult<R>> {
        const taskName = this.constructor.name;
        debug(`Start task: ${taskName}`);
        const result = await this.innerExecute(player, authData, data);
        debug(`End task: ${taskName}`);

        return result;
    }

    abstract innerExecute(player: Player, authData: AD, data?: any): Promise<GameTaskResult<R>>
}
