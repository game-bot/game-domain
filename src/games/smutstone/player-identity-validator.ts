import { SmutstoneApi } from "./api";
import { NoCacheApiClientRepository } from "../../repositories/api-client-repository";
import { PlayerIdentity } from "../../entities/player";

export class SmutstonePlayerIdentityValidator {
    private api: SmutstoneApi

    constructor() {
        this.api = new SmutstoneApi(new NoCacheApiClientRepository());
    }

    async validate(player: PlayerIdentity): Promise<boolean> {
        const data = await this.api.userData({ id: '', ...player });

        if (!data || !data.story || !data.story.locations || !data.story.locations.length) {
            return false;
        }

        const missions = data.story.locations[0].missions;

        if (!missions || !missions.length) {
            return false;
        }

        const wonLocations = missions.filter(item => item.doneStars > 2);

        return wonLocations.length > 0;
    }
}
