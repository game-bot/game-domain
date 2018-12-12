// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { GameJobInfo } from "../../../game-job-info";
import { Player } from "../../../player";
import gameInfo from "../game-info";
import { IPlayerDataProvider } from "../../../data/player-data-provider";
import { AuthData } from "../data/auth-data";
import { Api } from "../api";
import { SmutstoneTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards, SmutstoneResources } from "../resources";

export const jobInfo: GameJobInfo = {
    id: 'open-bronze-box',
    name: 'Open Bronze Box',
    interval: '6h',
    gameId: gameInfo.id,
}

export class OpenBronzeBoxJob extends SmutstoneJob {
    private task: OpenBronzeBoxTask
    constructor(authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(jobInfo, authProvider);
        this.task = new OpenBronzeBoxTask();
    }

    protected async innerExecute(player: Player) {
        const authData = (await this.authProvider.get(player)).data;
        const userData = (await this.userDataProvider.get(player)).data;

        const boxTime = userData.vars.__LBOX_T as number;
        const timeDiff = boxTime + 28800 - (userData.gameTime / 1000);

        if (timeDiff > 0) {
            return this.createJobResult({
                playerId: player.id,
                status: 'waiting',
            })
        }

        return this.createJobResultFromTaskResult(await this.task.execute(player, authData));
    }
}

class OpenBronzeBoxTask extends SmutstoneTask {
    constructor() {
        super(jobInfo);
    }

    async innerExecute(player: Player, authData: AuthData): Promise<GameTaskResult<SmutstoneResources>> {
        const response = await Api.call(authData, { "method": "lootbox.open", "args": { "typeId": 6000 } });
        const error = Api.createError(response, this.createErrorDetails());
        const data = response.data;
        const resources = data && data.rewards && createGameResourcesFromRewards(data.rewards).getData() || undefined;

        return this.createTaskResult({ error, data, resources, playerId: player.id });
    }
}
