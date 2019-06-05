import { SmutstonePlayerIdentityValidator } from "./games/smutstone/player-identity-validator";
import { PlayerIdentity } from "./entities/player";

export class PlayerIdentityValidator {
  private smutstone: SmutstonePlayerIdentityValidator;

  constructor() {
    this.smutstone = new SmutstonePlayerIdentityValidator();
  }

  async validate(player: PlayerIdentity): Promise<boolean> {
    switch (player.gameId) {
      case "smutstone":
        return this.smutstone.validate(player);
    }

    throw new Error(`Invalid game id: ${player.gameId}`);
  }
}
