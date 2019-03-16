// const debug = require('debug')('gamebot:smutstone:job');

import { SmutstoneJob } from "../smutstone-job";
import { Player } from "../../../entities/player";
import { SmutstoneApi } from "../api";
import { SmutstoneApiTask } from "../smutstone-task";
import { createGameResourcesFromRewards } from "../resources";
import { CardsFightApiData } from "../data/api/cards-fight-data";
import { getRandomIntInclusive } from "@gamebot/domain";
import { GameJobInfo } from "../../../entities/game-job-info";
import { ApiEndpoints } from "../data/endpoints";
import { GamebotJobConfigError } from "../../../errors";

export class CampaignFightLocationJob extends SmutstoneJob {
    private task: CardsBattleFightTask
    constructor(file: string, api: SmutstoneApi, private locationIndex: number) {
        super(file, api);
        if (locationIndex < 0) {
            throw new Error(`Invalid location index: ${locationIndex}`);
        }
        this.task = new CardsBattleFightTask(this.info, api);
    }

    protected async innerExecute(player: Player) {
        const userData = await this.api.userData(player);

        if (userData.resources.energy < 50) {
            return this.createJobResult({
                playerId: player.id,
                status: 'waiting',
            })
        }

        const locationIndex = this.locationIndex;

        const location = userData.story.locations[locationIndex];
        if (!location) {
            return this.createJobResult({
                playerId: player.id,
                status: 'error',
                error: new GamebotJobConfigError(
                    `You don't have access to location ${locationIndex + 1}`,
                    { gameId: this.info.gameId, jobId: this.info.id }),
            })
        }

        const validMissions = location.missions.filter(item => item.doneStars > 2);
        if (validMissions.length === 0) {
            return this.createJobResult({
                playerId: player.id,
                status: 'error',
                error: new GamebotJobConfigError(
                    `You don't have any 3 star mission on location ${this.locationIndex + 1}`,
                    { gameId: this.info.gameId, jobId: this.info.id }),
            })
        }

        const missionIndex = getRandomIntInclusive(0, validMissions.length);
        const mission = validMissions[missionIndex];
        const args = { "location": location.id, "mission": mission.id, "deck": 1 };

        const fightResults = await this.task.execute(player, args);

        if (fightResults.status === 'done') {
            userData.resources.energy -= 17;
        }

        return this.createJobResultFromTaskResult(fightResults);
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
