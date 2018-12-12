import { GameJobInfo } from "../../game-job-info";
import { GameTask } from "../../game-task";
import { AuthData } from "./data/auth-data";
import { SmutstoneApi } from "./api";
import { DataParser } from "../../data/data-parser";
import { Player } from "../../player";
import { GameResourcesData } from "../../game-resources";


export abstract class SmutstoneTask<RD=any> extends GameTask<AuthData, RD> {
    constructor(info: GameJobInfo, protected api: SmutstoneApi) {
        super(info)
    }
}

export abstract class SmutstoneApiTask<DATA> extends GameTask<AuthData, DATA> {
    constructor(info: GameJobInfo, protected api: SmutstoneApi, protected parser: DataParser<DATA>) {
        super(info)
    }

    protected async innerExecute(player: Player, authData: AuthData) {
        const playerId = player.id;
        const response = await this.api.apiCall(authData, this.createApiData(player));
        const error = this.api.createError(response, this.createErrorDetails());
        if (error) {
            return this.createTaskResult({ error, playerId });
        }
        const data = this.parser.parse(response.data);
        const resources = this.createResources(data);

        return this.createTaskResult({ error, data, resources, playerId });
    }

    protected abstract createApiData(player: Player): any
    protected abstract createResources(data: DATA): GameResourcesData | undefined
}
