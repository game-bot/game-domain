// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../player/player";
import { IPlayerDataProvider } from "../../../player/player-data-provider";
import { AuthData } from "../data/auth-data";
import { SmutstoneApi } from "../api";
import { SmutstoneApiTask } from "../smutstone-task";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards } from "../resources";
import { ToolboxApiDataParser, ToolboxApiData } from "../data/api/toolbox-data";
import { GameJobInfo } from "../../../entities/game-job-info";

export default class OpenBronzeBoxJob extends SmutstoneJob {
    private task: OpenBronzeBoxTask
    constructor(api: SmutstoneApi, authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(__filename, authProvider, api);
        this.task = new OpenBronzeBoxTask(this.info, api);
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
    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api, new ToolboxApiDataParser());
    }

    protected createApiData(_player: Player) {
        return { "method": "lootbox.open", "args": { "typeId": 6000 } };
    }
    protected createResources(data: ToolboxApiData) {
        return createGameResourcesFromRewards(data.rewards).getData();
    }
}
