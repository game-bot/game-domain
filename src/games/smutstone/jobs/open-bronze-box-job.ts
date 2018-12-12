// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { GameJobInfo } from "../../../game-job-info";
import { Player } from "../../../player";
import gameInfo from "../game-info";
import { IPlayerDataProvider } from "../../../data/player-data-provider";
import { AuthData } from "../data/auth-data";
import { SmutstoneApi } from "../api";
import { SmutstoneApiTask } from "../smutstone-task";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards } from "../resources";
import { ToolboxApiDataParser, ToolboxApiData } from "../api/toolbox-data";

export const jobInfo: GameJobInfo = {
    id: 'open-bronze-box',
    name: 'Open Bronze Box',
    interval: '6h',
    gameId: gameInfo.id,
}

export class OpenBronzeBoxJob extends SmutstoneJob {
    private task: OpenBronzeBoxTask
    constructor(api: SmutstoneApi, authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(jobInfo, authProvider, api);
        this.task = new OpenBronzeBoxTask(api);
    }

    protected async innerExecute(player: Player) {
        const authData = (await this.authProvider.get(player)).data;
        const userData = (await this.userDataProvider.get(player)).data;

        const boxTime = userData.vars.__LBOX_T;
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

class OpenBronzeBoxTask extends SmutstoneApiTask<ToolboxApiData> {
    constructor(api: SmutstoneApi) {
        super(jobInfo, api, new ToolboxApiDataParser());
    }

    protected createApiData(_player: Player) {
        return { "method": "lootbox.open", "args": { "typeId": 6000 } };
    }
    protected createResources(data: ToolboxApiData) {
        return createGameResourcesFromRewards(data.rewards).getData();
    }
}
