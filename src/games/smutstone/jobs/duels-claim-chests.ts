
// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../entities/player";
import { SmutstoneApi } from "../api";
import { SmutstoneTask, SmutstoneApiTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards } from "../resources";
import { PvpLoadApiData, PvpClaimChestApiData, PvpChestApiData } from "../data/api/pvp-data";
import { delay, IDictionary } from "@gamebot/domain";
import { GameJobInfo } from "../../../entities/game-job-info";
import { ApiEndpoints } from "../data/endpoints";


export default class DuelsClaimChestsJob extends SmutstoneJob {

    private claimStartchest: ClaimStarChestTask
    private claimChest: ClaimChestTask

    constructor(api: SmutstoneApi) {
        super(__filename, api);

        this.claimStartchest = new ClaimStarChestTask(this.info, api);
        this.claimChest = new ClaimChestTask(this.info, api);
    }

    protected async innerExecute(player: Player) {
        const playerId = player.id;
        // console.time('user-data');
        const userData = await this.api.userData(player);
        // console.timeEnd('user-data');
        const duelsDataResponse = await this.api.methodPvpLoad(player);
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(duelsDataResponse, errorDetails);

        if (error) {
            return this.createJobResult({ error, playerId });
        }

        const duelsData = duelsDataResponse.data;

        const taskResults = await this.claimChests(player, duelsData, userData);

        if (taskResults.length === 0) {
            return this.createJobResult({ status: 'waiting', playerId });
        }

        return this.createJobResultFromTaskResults(taskResults);
    }

    private async claimChests(player: Player, duelsData: PvpLoadApiData, userData: UserData) {
        const results: GameTaskResult<PvpClaimChestApiData>[] = []
        if (duelsData.starChest.stars > 2) {
            results.push(await this.claimStartchest.execute(player));
            await delay(1000 * .5)
        }

        const claimedChests: PvpChestApiData[] = []

        for (const chest of duelsData.chests) {
            const endTime = 1e3 * chest.added + CHEST_TIMES[chest.rarity].time;
            if (endTime < userData.gameTime) {
                const result = await this.claimChest.execute(player, chest.id);
                results.push(result);
                if (result.status === 'done') {
                    claimedChests.push(chest);
                }
                await delay(1000 * .5)
            }
        }

        for (const chest of claimedChests) {
            const index = duelsData.chests.indexOf(chest);
            if (index > -1) {
                duelsData.chests.splice(index, 1);
            }
        }

        return results;
    }
}

class ClaimChestTask extends SmutstoneTask {
    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api);
    }

    async innerExecute(player: Player, chestId: number) {
        const playerId = player.id;
        const response = await this.api.methodPvpChestClaim(player, { "id": chestId, "unlock": true });
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(response, errorDetails);

        if (error) {
            return this.createTaskResult({ error, playerId });
        }

        const data = response.data;

        const resources = createGameResourcesFromRewards([data && data.reward || {}]).getData();

        return this.createTaskResult({ playerId, resources, data });
    }
}

class ClaimStarChestTask extends SmutstoneApiTask<PvpClaimChestApiData> {
    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api, ApiEndpoints.pvp_starchest_claim);
    }

    protected createApiEndpointArgs(_player: Player) {
        return {};
    }
    protected createResources(data: PvpClaimChestApiData) {
        return createGameResourcesFromRewards([data && data.reward || {}]).getData()
    }
}

const CHEST_TIMES = { 1: { time: 27e5 }, 2: { time: 108e5 }, 3: { time: 432e5 }, 4: { time: 1728e5 } } as IDictionary<{ time: number }>
