import { GameTask } from "../../game-task";
import { SmutstoneApi } from "./api";
import { Player } from "../../player/player";
import { GameResourcesData } from "../../game-resources";
import { GameJobInfo } from "../../entities/game-job-info";
import { ApiEndpoints } from "./data/endpoints";


export abstract class SmutstoneTask<RD=any> extends GameTask<RD> {
    constructor(info: GameJobInfo, protected api: SmutstoneApi) {
        super(info)
    }
}

export abstract class SmutstoneApiTask<DATA> extends GameTask<DATA> {
    constructor(info: GameJobInfo, protected api: SmutstoneApi, protected endpoint: ApiEndpoints) {
        super(info)
    }

    protected async innerExecute(player: Player, moreData?: any) {
        const playerId = player.id;
        const response = await this.api.endpointCall<DATA>(this.endpoint, player, this.createApiEndpointArgs(player, moreData));
        const error = this.api.createError(response, this.createErrorDetails());
        if (error) {
            return this.createTaskResult({ error, playerId });
        }
        const data = response.data;
        const resources = this.createResources(data);

        return this.createTaskResult({ error, data, resources, playerId });
    }

    protected abstract createApiEndpointArgs(player: Player, moreData?: any): any
    protected abstract createResources(data: DATA): GameResourcesData | undefined
}
