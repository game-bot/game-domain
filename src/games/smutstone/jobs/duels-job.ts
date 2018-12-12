
const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { GameJobInfo } from "../../../game-job-info";
import { Player } from "../../../player";
import gameInfo from "../game-info";
import { IPlayerDataProvider } from "../../../data/player-data-provider";
import { AuthData } from "../data/auth-data";
import { Api } from "../api";
import { SmutstoneTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { delay, Dictionary } from "../../../utils";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards, SmutstoneResources } from "../resources";
import { GameResources } from "../../../game-resources";

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
    constructor(authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(jobInfo, authProvider);

        this.fight = new PvpBattleFightTask();
        this.claimStartchest = new ClaimStarChestTask();
        this.claimChest = new ClaimChestTask();
    }

    protected async innerExecute(player: Player) {
        const playerId = player.id;
        const authData = (await this.authProvider.get(player)).data;
        const userData = (await this.userDataProvider.get(player)).data;
        const duelsDataResponse = await Api.call(authData, { "method": "pvp.load", "args": {} });
        const errorDetails = this.createErrorDetails();
        let error = Api.createError(duelsDataResponse, errorDetails);

        if (error) {
            return this.createJobResult({ error, playerId });
        }

        const duelsData = duelsDataResponse.data as DuelsData;

        const taskResults = await this.claimChests(player, authData, duelsData, userData);

        await this.fillChests(player, authData, duelsData, taskResults);

        return this.createJobResultFromTaskResults(taskResults);
    }

    private async claimChests(player: Player, authData: AuthData, duelsData: DuelsData, userData: UserData) {
        const results: GameTaskResult<SmutstoneResources>[] = []
        if (duelsData.starChest.stars > 2) {
            results.push(await this.claimStartchest.execute(player, authData));
            await delay(1000)
        }

        const claimedChests: DuelsChestData[] = []

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

    private async fillChests(player: Player, authData: AuthData, duelsData: DuelsData, results: GameTaskResult[], inc?: number) {
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
    constructor() {
        super(jobInfo);
    }

    async innerExecute(player: Player, authData: AuthData, chestId: number) {
        const playerId = player.id;
        const response = await Api.call(authData, { "method": "pvp.chest.claim", "args": { "id": chestId, "unlock": true } });
        const errorDetails = this.createErrorDetails();
        let error = Api.createError(response, errorDetails);

        if (error) {
            return this.createTaskResult({ error, playerId });
        }

        const data = response.data;

        const resources = createGameResourcesFromRewards([data && data.reward || {}]).getData();

        return this.createTaskResult({ playerId, resources, data });
    }
}

class ClaimStarChestTask extends SmutstoneTask {
    constructor() {
        super(jobInfo);
    }

    async innerExecute(player: Player, authData: AuthData) {
        const playerId = player.id;

        const response = await Api.call(authData, { "method": "pvp.starchest.claim", "args": {} });
        const errorDetails = this.createErrorDetails();
        let error = Api.createError(response, errorDetails);

        const data = response.data;

        const resources = createGameResourcesFromRewards([data && data.reward || {}]).getData();

        return this.createTaskResult({ error, playerId, resources, data });
    }
}

class PvpBattleFightTask extends SmutstoneTask<PvpFightBattleData> {
    constructor() {
        super(jobInfo);
    }

    async innerExecute(player: Player, authData: AuthData) {

        const playerId = player.id;
        const startResponse = await Api.call(authData, { "method": "pvp.battle.start", "args": {} });
        const errorDetails = this.createErrorDetails();
        let error = Api.createError(startResponse, errorDetails);

        if (error) {
            return this.createTaskResult({ error, playerId })
        }

        await delay(1000);
        const response = await Api.call(authData, { "method": "pvp.battle.fight", "args": { "deck": 1 } });
        error = Api.createError(response, errorDetails);

        const data = response.data as PvpFightBattleData;

        const resources = new GameResources<SmutstoneResources>();
        resources.set(SmutstoneResources.duel_points, (data.pointsGain || 0));

        return this.createTaskResult({ error, playerId, resources: resources.getData(), data });
    }
}

type PvpFightBattleData = {
    chest?: DuelsChestData
    result: {
        result: string
    }
    starChest: { stars: number, last: number, league: number }
    pointsGain: number
}

type DuelsData = {
    chests: DuelsChestData[]
    points: number
    starChest: { stars: number, last: number, league: number }
    slots: number
}

type DuelsChestData = { added: number, rarity: number, id: number, league: number }

const CHEST_TIMES = { 1: { time: 27e5 }, 2: { time: 108e5 }, 3: { time: 432e5 }, 4: { time: 1728e5 } } as Dictionary<{ time: number }>
