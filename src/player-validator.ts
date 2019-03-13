
import { IApiClientRepository } from "./repositories/api-client-repository";
import { Player } from "./entities/player";
import { SmutstonePlayerValidator } from "./games/smutstone/player-validator";


export class PlayerValidator {
    private smutstone: SmutstonePlayerValidator

    constructor(repository: IApiClientRepository) {
        this.smutstone = new SmutstonePlayerValidator(repository);
    }

    validate(player: Player): Promise<boolean> {
        switch (player.gameId) {
            case 'smutstone': return this.smutstone.validate(player);
        }

        throw new Error(`Invalid game id: ${player.gameId}`);
    }
}
