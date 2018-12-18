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
import { CardsFightApiData, CardsFightApiDataParser } from "../data/api/cards-fight-data";
import { getRandomIntInclusive } from "../../../utils";

export const jobInfo: GameJobInfo = {
    id: 'cards-battle-fight',
    name: 'Cards Battle Fight',
    interval: '15m',
    gameId: gameInfo.id,
}

export class CardsBattleFightJob extends SmutstoneJob {
    private task: CardsBattleFightTask
    constructor(api: SmutstoneApi, authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(jobInfo, authProvider, api);
        this.task = new CardsBattleFightTask(api);
    }

    protected async innerExecute(player: Player) {
        const authData = (await this.authProvider.get(player)).data;
        const userData = (await this.userDataProvider.get(player)).data;

        if (userData.resources.energy < 50) {
            return this.createJobResult({
                playerId: player.id,
                status: 'waiting',
            })
        }

        const locationIndex = getRandomIntInclusive(0, userData.story.locations.length - 1);
        const location = userData.story.locations[locationIndex];
        const missionIndex = getRandomIntInclusive(0, location.missions.filter(item => item.doneStars > 2).length);
        const mission = location.missions[missionIndex];
        const args = { "location": location.id, "mission": mission.id, "deck": 1 };

        return this.createJobResultFromTaskResult(await this.task.execute(player, authData, args));
    }
}

class CardsBattleFightTask extends SmutstoneApiTask<CardsFightApiData> {
    constructor(api: SmutstoneApi) {
        super(jobInfo, api, new CardsFightApiDataParser());
    }

    protected createApiData(_player: Player, args: any) {
        return { "method": "cards.battle.fight", "args": args };
    }
    protected createResources(data: CardsFightApiData) {
        return createGameResourcesFromRewards(data.rewards || []).getData();
    }
}
