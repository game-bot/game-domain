
const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { GameJobInfo } from "../../../game-job-info";
import { Player } from "../../../player";
import gameInfo from "../game-info";
import { IPlayerDataProvider } from "../../../data/player-data-provider";
import { AuthData } from "../data/auth-data";
import { Api, createErrorFromApiResponse } from "../api";
import { SmutstoneTask } from "../smutstone-task";
import { GameTaskResult } from "../../../game-task";
import { delay, Dictionary } from "../../../utils";
import { UserData } from "../data/user-data";

export const jobInfo: GameJobInfo = {
    id: 'duels',
    name: 'Duels',
    interval: '1h',
    gameId: gameInfo.id,
}

export class DuelsJob extends SmutstoneJob {
    private fight: PvpFightBattleTask
    private openStartchest: OpenStarchestTask
    private openChest: OpenChestTask
    constructor(authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(jobInfo, authProvider);

        this.fight = new PvpFightBattleTask();
        this.openStartchest = new OpenStarchestTask();
        this.openChest = new OpenChestTask();
    }

    protected async innerExecute(player: Player) {
        const authData = (await this.authProvider.get(player)).data;
        const userData = (await this.userDataProvider.get(player)).data;
        const duelsDataResponse = await Api.call(authData, { "method": "pvp.load", "args": {}, "v": 25 });
        let error = createErrorFromApiResponse(duelsDataResponse);
        if (error) {
            return {
                ok: false,
                continue: false,
                error,
            }
        }
        const duelsData = duelsDataResponse.data as DuelsData;
        debug('duelsData', duelsData);

        await this.fillChests(player, authData, duelsData);

        if (duelsData.starChest.stars > 2) {
            await this.openStartchest.execute(player, authData);
        }

        for (const chest of duelsData.chests) {
            const endTime = 1e3 * chest.added + CHAST_TIMES[chest.rarity].time;
            if (endTime < userData.gameTime) {
                const result = await this.openChest.execute(player, authData, chest.id);
                await delay(1000)
                if (result.ok) {
                    await this.fight.execute(player, authData);
                }
            }
        }

        return {
            ok: true,
        }
    }

    private async fillChests(player: Player, authData: AuthData, duelsData: DuelsData, inc?: number) {
        inc = inc || 0;
        if (inc > 4) {
            return;
        }
        if (duelsData.slots > duelsData.chests.length) {
            const result = await this.fight.execute(player, authData);
            if (result.data) {
                duelsData.starChest = result.data.starChest;
                if (result.data.chest) {
                    duelsData.chests.push(result.data.chest);
                    await this.fillChests(player, authData, duelsData, inc + 1);
                }
            }
        }
    }
}

class OpenChestTask extends SmutstoneTask {
    constructor() {
        super(jobInfo);
    }

    async innerExecute(_player: Player, authData: AuthData, chestId: number): Promise<GameTaskResult> {
        const response = await Api.call(authData, { "method": "pvp.chest.claim", "args": { "id": chestId, "unlock": true }, "v": 25 });
        const error = createErrorFromApiResponse(response);

        return {
            data: response.data,
            continue: true,
            error,
            ok: response.ok,
        }
    }
}

class OpenStarchestTask extends SmutstoneTask {
    constructor() {
        super(jobInfo);
    }

    async innerExecute(_player: Player, authData: AuthData): Promise<GameTaskResult> {
        const response = await Api.call(authData, { "method": "pvp.starchest.claim", "args": {}, "v": 25 });
        const error = createErrorFromApiResponse(response);

        return {
            data: response.data,
            continue: true,
            error,
            ok: response.ok,
        }
    }
}

class PvpFightBattleTask extends SmutstoneTask<PvpFightBattleData> {
    constructor() {
        super(jobInfo);
    }

    async innerExecute(_player: Player, authData: AuthData): Promise<GameTaskResult<PvpFightBattleData>> {

        const startResponse = await Api.call(authData, { "method": "pvp.battle.start", "args": {}, "v": 25 });
        let error = createErrorFromApiResponse(startResponse);
        if (error) {
            return {
                ok: false,
                continue: false,
                error,
            }
        }
        await delay(1000);
        const response = await Api.call(authData, { "method": "pvp.battle.fight", "args": { "deck": 1 }, "v": 25 });
        error = createErrorFromApiResponse(response);

        return {
            data: response.data,
            continue: response.ok,
            error,
            ok: response.ok,
        }
    }
}

type PvpFightBattleData = {
    chest?: DuelsChestData
    result: {
        result: string
    }
    starChest: { stars: number, last: number, league: number }
}

type DuelsData = {
    chests: DuelsChestData[]
    points: number
    starChest: { stars: number, last: number, league: number }
    slots: number
}

type DuelsChestData = { added: number, rarity: number, id: number, league: number }

const CHAST_TIMES = { 1: { time: 27e5 }, 2: { time: 108e5 }, 3: { time: 432e5 }, 4: { time: 1728e5 } } as Dictionary<{ time: number }>
