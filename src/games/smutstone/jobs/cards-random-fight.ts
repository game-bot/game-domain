// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../player/player";
import { SmutstoneApi } from "../api";
import { SmutstoneApiTask } from "../smutstone-task";
import { createGameResourcesFromRewards } from "../resources";
import { CardsFightApiData } from "../data/api/cards-fight-data";
import { getRandomIntInclusive } from "@gamebot/domain";
import { GameJobInfo } from "../../../entities/game-job-info";
import { ApiEndpoints } from "../data/endpoints";

export default class CardsBattleFightJob extends SmutstoneJob {
    private task: CardsBattleFightTask
    constructor(api: SmutstoneApi) {
        super(__filename, api);
        this.task = new CardsBattleFightTask(this.info, api);
    }

    protected async innerExecute(player: Player) {
        const userData = (await this.api.userData(player));

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

        return this.createJobResultFromTaskResult(await this.task.execute(player, args));
    }
}

class CardsBattleFightTask extends SmutstoneApiTask<CardsFightApiData> {
    constructor(jobInfo: GameJobInfo, api: SmutstoneApi) {
        super(jobInfo, api, ApiEndpoints.cards_battle_fight);
    }

    protected createApiEndpointArgs(_player: Player, args: any) {
        return args;
    }
    protected createResources(data: CardsFightApiData) {
        return createGameResourcesFromRewards(data.rewards || []).getData();
    }
}
