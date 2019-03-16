
const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../entities/player";
import { SmutstoneApi } from "../api";
import { SmutstoneTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { SmutstoneResources } from "../resources";
import { GameResources } from "../../../game-resources";
import { PvpLoadApiData, PvpBattleFightApiData } from "../data/api/pvp-data";
import { GameJobInfo } from "../../../entities/game-job-info";
import { delay } from "@gamebot/domain";


export default class DuelsFightsJob extends SmutstoneJob {
    private fight: PvpBattleFightTask
    constructor(api: SmutstoneApi) {
        super(__filename, api);

        this.fight = new PvpBattleFightTask(this.info, api);
    }

    protected async innerExecute(player: Player) {
        const playerId = player.id;
        const duelsDataResponse = await this.api.methodPvpLoad(player);
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(duelsDataResponse, errorDetails);

        if (error) {
            return this.createJobResult({ error, playerId });
        }

        const duelsData = duelsDataResponse.data;

        const taskResults: GameTaskResult[] = []

        await this.fillChests(player, duelsData, taskResults);

        if (taskResults.length === 0) {
            return this.createJobResult({ status: 'waiting', playerId });
        }

        return this.createJobResultFromTaskResults(taskResults);
    }

    private async fillChests(player: Player, duelsData: PvpLoadApiData, results: GameTaskResult[], inc?: number) {
        inc = inc || 0;
        if (inc > 4) {
            debug(`fillChests inc > 4`)
            return results;
        }
        if (duelsData.slots > duelsData.chests.length) {
            if (inc > 0) {
                await delay(1000 * 0.5);
            }
            const result = await this.fight.execute(player);
            results.push(result);
            if (result.data) {
                duelsData.starChest = result.data.starChest || duelsData.starChest;
                if (result.data.chest) {
                    duelsData.chests.push(result.data.chest);
                }
                await this.fillChests(player, duelsData, results, inc + 1);
            }
        } else {
            debug(`duelsData.slots == duelsData.chests.length`)
        }

        return results;
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

        // await delay(1000);
        const response = await this.api.methodPvpBattleFight(player, { "deck": 1 });
        error = this.api.createError(response, errorDetails);

        const data = response.data;

        const resources = new GameResources<SmutstoneResources>();
        resources.set(SmutstoneResources.duel_points, (data.pointsGain || 0));

        return this.createTaskResult({ error, playerId, resources: resources.getData(), data });
    }
}
