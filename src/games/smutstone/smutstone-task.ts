import { GameTask } from "../../game-task";
import { AuthData } from "./data/auth-data";
import { SmutstoneApi } from "./api";
import { EntityMapper } from "../../entities/entity-mapper";
import { Player } from "../../player/player";
import { GameResourcesData } from "../../game-resources";
import { GameJobInfo } from "../../entities/game-job-info";


export abstract class SmutstoneTask<RD=any> extends GameTask<AuthData, RD> {
    constructor(info: GameJobInfo, protected api: SmutstoneApi) {
        super(info)
    }
}

export abstract class SmutstoneApiTask<DATA> extends GameTask<AuthData, DATA> {
    constructor(info: GameJobInfo, protected api: SmutstoneApi, protected parser: EntityMapper<DATA>) {
        super(info)
    }

    protected async innerExecute(player: Player, authData: AuthData, moreData?: any) {
        const playerId = player.id;
        const response = await this.api.apiCall(authData, this.createApiData(player, moreData));
        const error = this.api.createError(response, this.createErrorDetails());
        if (error) {
            return this.createTaskResult({ error, playerId });
        }
        const data = this.parser.map(response.data);
        const resources = this.createResources(data);

        return this.createTaskResult({ error, data, resources, playerId });
    }

    protected abstract createApiData(player: Player, moreData?: any): any
    protected abstract createResources(data: DATA): GameResourcesData | undefined
}
