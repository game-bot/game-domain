import { Player } from "./player";
import { GameApi } from "../game-api";
import { IDictionary } from "@gamebot/domain";

export interface IPlayerDataFetcher<DATA=IDictionary<string>, PD=void> {
    fetch(player: Player, playerData?: PD): Promise<DATA>
}

export abstract class PlayerDataFetcher<DATA, API extends GameApi<any>, PD=void> implements IPlayerDataFetcher<DATA, PD> {

    constructor(protected api: API) {

    }

    abstract fetch(player: Player, playerData?: PD): Promise<DATA>
}
