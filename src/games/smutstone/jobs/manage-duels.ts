
const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../player/player";
import { SmutstoneApi } from "../api";
import { SmutstoneTask, SmutstoneApiTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards, SmutstoneResources } from "../resources";
import { GameResources } from "../../../game-resources";
import { PvpLoadApiDataParser, PvpLoadApiData, PvpClaimChestApiData, PvpBattleFightApiData, PvpChestApiData } from "../data/api/pvp-data";
import { delay, IDictionary } from "@gamebot/domain";
import { GameJobInfo } from "../../../entities/game-job-info";
import { ApiEndpoints } from "../data/endpoints";


export default class ManageDuelsJob extends SmutstoneJob {
    private fight: PvpBattleFightTask
    private claimStartchest: ClaimStarChestTask
    private claimChest: ClaimChestTask
    private pvpDataParser: PvpLoadApiDataParser
    constructor(api: SmutstoneApi) {
        super(__filename, api);

        this.pvpDataParser = new PvpLoadApiDataParser();
        this.fight = new PvpBattleFightTask(this.info, api);
        this.claimStartchest = new ClaimStarChestTask(this.info, api);
        this.claimChest = new ClaimChestTask(this.info, api);
    }

    protected async innerExecute(player: Player) {
        const playerId = player.id;
        const userData = await this.api.userData(player);
        const duelsDataResponse = await this.api.methodPvpLoad(player);
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(duelsDataResponse, errorDetails);

        if (error) {
            return this.createJobResult({ error, playerId });
        }

        const duelsData = this.pvpDataParser.map(duelsDataResponse.data);

        const taskResults = await this.claimChests(player, duelsData, userData);

        await this.fillChests(player, duelsData, taskResults);

        if (taskResults.length === 0) {
            return this.createJobResult({ status: 'waiting', playerId });
        }

        return this.createJobResultFromTaskResults(taskResults);
    }

    private async claimChests(player: Player, duelsData: PvpLoadApiData, userData: UserData) {
        const results: GameTaskResult<PvpClaimChestApiData>[] = []
        if (duelsData.starChest.stars > 2) {
            results.push(await this.claimStartchest.execute(player));
            await delay(1000)
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
                await delay(1000)
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

    private async fillChests(player: Player, duelsData: PvpLoadApiData, results: GameTaskResult[], inc?: number) {
        inc = inc || 0;
        if (inc > 4) {
            debug(`fillChests inc > 4`)
            return results;
        }
        if (duelsData.slots > duelsData.chests.length) {
            const result = await this.fight.execute(player);
            results.push(result);
            if (result.data) {
                duelsData.starChest = result.data.starChest || duelsData.starChest;
                if (result.data.chest) {
                    duelsData.chests.push(result.data.chest);
                }
                await delay(1000 * 2)
                await this.fillChests(player, duelsData, results, inc + 1);
            }
        } else {
            debug(`duelsData.slots == duelsData.chests.length`)
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

class PvpBattleFightTask extends SmutstoneTask<PvpBattleFightApiData> {

    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api);
    }

    async innerExecute(player: Player) {

        const playerId = player.id;
        const startResponse = await this.api.methodPvpBattleStart(player);
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(startResponse, errorDetails);

        if (error) {
            return this.createTaskResult({ error, playerId })
        }

        await delay(1000);
        const response = await this.api.methodPvpBattleFight(player, { "deck": 1 });
        error = this.api.createError(response, errorDetails);

        const data = response.data;

        const resources = new GameResources<SmutstoneResources>();
        resources.set(SmutstoneResources.duel_points, (data.pointsGain || 0));

        return this.createTaskResult({ error, playerId, resources: resources.getData(), data });
    }
}

const CHEST_TIMES = { 1: { time: 27e5 }, 2: { time: 108e5 }, 3: { time: 432e5 }, 4: { time: 1728e5 } } as IDictionary<{ time: number }>
