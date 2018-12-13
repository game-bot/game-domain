
const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { GameJobInfo } from "../../../game-job-info";
import { Player } from "../../../player";
import gameInfo from "../game-info";
import { IPlayerDataProvider } from "../../../data/player-data-provider";
import { AuthData } from "../data/auth-data";
import { SmutstoneApi } from "../api";
import { SmutstoneTask, SmutstoneApiTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { delay, Dictionary } from "../../../utils";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards, SmutstoneResources } from "../resources";
import { GameResources } from "../../../game-resources";
import { PvpApiDataParser, PvpApiData, PvpClaimChestApiData, PvpClaimChestApiDataParser, PvpFightBattleApiData, PvpFightBattleApiDataParser, PvpChestApiData } from "../data/api/pvp-data";

export const jobInfo: GameJobInfo = {
    id: 'duels',
    name: 'Duels',
    interval: '1h',
    gameId: gameInfo.id,
}

export class DuelsJob extends SmutstoneJob {
    private fight: PvpBattleFightTask
    private claimStartchest: ClaimStarChestTask
    private claimChest: ClaimChestTask
    private pvpDataParser: PvpApiDataParser
    constructor(api: SmutstoneApi, authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(jobInfo, authProvider, api);
        this.pvpDataParser = new PvpApiDataParser();
        this.fight = new PvpBattleFightTask(api);
        this.claimStartchest = new ClaimStarChestTask(api);
        this.claimChest = new ClaimChestTask(api);
    }

    protected async innerExecute(player: Player) {
        const playerId = player.id;
        const authData = (await this.authProvider.get(player)).data;
        const userData = (await this.userDataProvider.get(player)).data;
        const duelsDataResponse = await this.api.apiCall(authData, { "method": "pvp.load", "args": {} });
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(duelsDataResponse, errorDetails);

        if (error) {
            return this.createJobResult({ error, playerId });
        }

        const duelsData = this.pvpDataParser.parse(duelsDataResponse.data);

        const taskResults = await this.claimChests(player, authData, duelsData, userData);

        await this.fillChests(player, authData, duelsData, taskResults);

        if (taskResults.length === 0) {
            return this.createJobResult({ status: 'waiting', playerId });
        }

        return this.createJobResultFromTaskResults(taskResults);
    }

    private async claimChests(player: Player, authData: AuthData, duelsData: PvpApiData, userData: UserData) {
        const results: GameTaskResult<PvpClaimChestApiData>[] = []
        if (duelsData.starChest.stars > 2) {
            results.push(await this.claimStartchest.execute(player, authData));
            await delay(1000)
        }

        const claimedChests: PvpChestApiData[] = []

        for (const chest of duelsData.chests) {
            const endTime = 1e3 * chest.added + CHEST_TIMES[chest.rarity].time;
            if (endTime < userData.gameTime) {
                const result = await this.claimChest.execute(player, authData, chest.id);
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

    private async fillChests(player: Player, authData: AuthData, duelsData: PvpApiData, results: GameTaskResult[], inc?: number) {
        inc = inc || 0;
        if (inc > 4) {
            debug(`fillChests inc > 4`)
            return results;
        }
        if (duelsData.slots > duelsData.chests.length) {
            const result = await this.fight.execute(player, authData);
            results.push(result);
            if (result.data) {
                duelsData.starChest = result.data.starChest || duelsData.starChest;
                if (result.data.chest) {
                    duelsData.chests.push(result.data.chest);
                }
                await delay(1000 * 2)
                await this.fillChests(player, authData, duelsData, results, inc + 1);
            }
        } else {
            debug(`duelsData.slots == duelsData.chests.length`)
        }

        return results;
    }
}

class ClaimChestTask extends SmutstoneTask {
    private parser: PvpClaimChestApiDataParser
    constructor(api: SmutstoneApi) {
        super(jobInfo, api);
        this.parser = new PvpClaimChestApiDataParser();
    }

    async innerExecute(player: Player, authData: AuthData, chestId: number) {
        const playerId = player.id;
        const response = await this.api.apiCall(authData, { "method": "pvp.chest.claim", "args": { "id": chestId, "unlock": true } });
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(response, errorDetails);

        if (error) {
            return this.createTaskResult({ error, playerId });
        }

        const data = this.parser.parse(response.data);

        const resources = createGameResourcesFromRewards([data && data.reward || {}]).getData();

        return this.createTaskResult({ playerId, resources, data });
    }
}

class ClaimStarChestTask extends SmutstoneApiTask<PvpClaimChestApiData> {
    constructor(api: SmutstoneApi) {
        super(jobInfo, api, new PvpClaimChestApiDataParser());
    }

    protected createApiData(_player: Player) {
        return { "method": "pvp.starchest.claim", "args": {} };
    }
    protected createResources(data: PvpClaimChestApiData) {
        return createGameResourcesFromRewards([data && data.reward || {}]).getData()
    }
}

class PvpBattleFightTask extends SmutstoneTask<PvpFightBattleApiData> {
    private parser: PvpFightBattleApiDataParser
    constructor(api: SmutstoneApi) {
        super(jobInfo, api);
        this.parser = new PvpFightBattleApiDataParser();
    }

    async innerExecute(player: Player, authData: AuthData) {

        const playerId = player.id;
        const startResponse = await this.api.apiCall(authData, { "method": "pvp.battle.start", "args": {} });
        const errorDetails = this.createErrorDetails();
        let error = this.api.createError(startResponse, errorDetails);

        if (error) {
            return this.createTaskResult({ error, playerId })
        }

        await delay(1000);
        const response = await this.api.apiCall(authData, { "method": "pvp.battle.fight", "args": { "deck": 1 } });
        error = this.api.createError(response, errorDetails);

        const data = this.parser.parse(response.data);

        const resources = new GameResources<SmutstoneResources>();
        resources.set(SmutstoneResources.duel_points, (data.pointsGain || 0));

        return this.createTaskResult({ error, playerId, resources: resources.getData(), data });
    }
}

const CHEST_TIMES = { 1: { time: 27e5 }, 2: { time: 108e5 }, 3: { time: 432e5 }, 4: { time: 1728e5 } } as Dictionary<{ time: number }>
