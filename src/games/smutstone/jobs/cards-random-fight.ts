// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../player/player";
import { IPlayerDataProvider } from "../../../player/player-data-provider";
import { AuthData } from "../data/auth-data";
import { SmutstoneApi } from "../api";
import { SmutstoneApiTask } from "../smutstone-task";
import { UserData } from "../data/user-data";
import { createGameResourcesFromRewards } from "../resources";
import { CardsFightApiData, CardsFightApiDataParser } from "../data/api/cards-fight-data";
import { getRandomIntInclusive } from "@gamebot/domain";
import { GameJobInfo } from "../../../entities/game-job-info";

export default class CardsBattleFightJob extends SmutstoneJob {
    private task: CardsBattleFightTask
    constructor(api: SmutstoneApi, authProvider: IPlayerDataProvider<AuthData>, private userDataProvider: IPlayerDataProvider<UserData>) {
        super(__filename, authProvider, api);
        this.task = new CardsBattleFightTask(this.info, api);
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
    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api, new CardsFightApiDataParser());
    }

    protected createApiData(_player: Player, args: any) {
        return { "method": "cards.battle.fight", "args": args };
    }
    protected createResources(data: CardsFightApiData) {
        return createGameResourcesFromRewards(data.rewards || []).getData();
    }
}
