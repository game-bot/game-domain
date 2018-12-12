import { Player } from "../player";
import { Dictionary } from "../utils";
import { GameApi } from "../game-api";

export interface IPlayerDataFetcher<DATA=Dictionary<string>, PD=void> {
    fetch(player: Player, playerData?: PD): Promise<DATA>
}

export abstract class PlayerDataFetcher<DATA, API extends GameApi<any>, PD=void> implements IPlayerDataFetcher<DATA, PD> {

    constructor(protected api: API) {

    }

    abstract fetch(player: Player, playerData?: PD): Promise<DATA>
}
