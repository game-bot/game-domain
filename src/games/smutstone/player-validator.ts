import { SmutstoneApi } from "./api";
import { IApiClientRepository } from "../../repositories/api-client-repository";
import { Player } from "../../entities/player";

export class SmutstonePlayerValidator {
    private api: SmutstoneApi

    constructor(repository: IApiClientRepository) {
        this.api = new SmutstoneApi(repository);
    }

    async validate(player: Player): Promise<boolean> {
        const data = await this.api.userData(player);

        if (!data.story.locations.length) {
            return false;
        }

        const wonLocations = data.story.locations[0].missions.filter(item => item.doneStars > 2);

        return wonLocations.length > 0;
    }
}
