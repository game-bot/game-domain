// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../entities/player";
import { SmutstoneApi } from "../api";
import { SmutstoneApiTask } from "../smutstone-task";
import { createGameResourcesFromRewards } from "../resources";
import { LootboxOpenApiData } from "../data/api/toolbox-data";
import { GameJobInfo } from "../../../entities/game-job-info";
import { ApiEndpoints } from "../data/endpoints";

export default class OpenBronzeBoxJob extends SmutstoneJob {
    private task: OpenBronzeBoxTask
    constructor(api: SmutstoneApi) {
        super(__filename, api);
        this.task = new OpenBronzeBoxTask(this.info, api);
    }

    protected async innerExecute(player: Player) {
        const userData = await this.api.userData(player);

        const boxTime = userData.vars.__LBOX_T;
        const timeDiff = boxTime + 28800 - (userData.gameTime / 1000);

        if (timeDiff > 0) {
            return this.createJobResult({
                playerId: player.id,
                status: 'waiting',
            })
        }

        return this.createJobResultFromTaskResult(await this.task.execute(player));
    }
}

class OpenBronzeBoxTask extends SmutstoneApiTask<LootboxOpenApiData> {
    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api, ApiEndpoints.lootbox_open);
    }

    protected createApiEndpointArgs(_player: Player) {
        return { "typeId": 6000 };
    }
    protected createResources(data: LootboxOpenApiData) {
        return createGameResourcesFromRewards(data.rewards).getData();
    }
}
