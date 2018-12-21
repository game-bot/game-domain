
// const debug = require('debug')('gamebot:smutstone:api');

import { IDictionary } from "@gamebot/domain";
import { Player } from "../../player/player";
import { IPlayerDataRepository } from "../../repositories/player-data-repository";
import { BaseSmutstoneApi } from "./base-api";
import { PvpBattleFightApiDataMapper, PvpLoadApiDataParser, PvpClaimChestApiDataParser, PvpBattleFightApiData, PvpClaimChestApiData, PvpLoadApiData } from "./data/api/pvp-data";
import { ApiEndpoints } from "./data/endpoints";
import { EntityMapper } from "../../entities/entity-mapper";
import { CardsFightApiDataParser, CardsFightApiData } from "./data/api/cards-fight-data";
import { LootboxOpenApiDataMapper, LootboxOpenApiData } from "./data/api/toolbox-data";
import { EmptyEntityMapper } from "../../entities/empty-object";

export type ApiResponse = {
    ok: boolean
    data?: any,
    headers: IDictionary<string | string[] | undefined>
    statusCode?: number
}

export class SmutstoneApi extends BaseSmutstoneApi {

    constructor(dataRepository: IPlayerDataRepository, version: number = 28, defaultHeaders?: IDictionary<string>) {
        const endpoints = new Map<ApiEndpoints, EntityMapper<any>>();
        endpoints.set(ApiEndpoints.cards_battle_fight, new CardsFightApiDataParser());
        endpoints.set(ApiEndpoints.lootbox_open, new LootboxOpenApiDataMapper());
        endpoints.set(ApiEndpoints.pvp_battle_fight, new PvpBattleFightApiDataMapper());
        endpoints.set(ApiEndpoints.pvp_battle_start, new EmptyEntityMapper());
        endpoints.set(ApiEndpoints.pvp_chest_claim, new PvpClaimChestApiDataParser());
        endpoints.set(ApiEndpoints.pvp_load, new PvpLoadApiDataParser());
        endpoints.set(ApiEndpoints.pvp_starchest_claim, new PvpClaimChestApiDataParser());

        super(dataRepository, endpoints, version, defaultHeaders);
    }

    async methodPvpBattleFight(player: Player, args: { deck: number }) {
        return this.endpointCall<PvpBattleFightApiData>(ApiEndpoints.pvp_battle_fight, player, args);
    }

    async methodPvpBattleStart(player: Player) {
        return this.endpointCall(ApiEndpoints.pvp_battle_start, player, {});
    }

    async methodPvpStarchestClaim(player: Player) {
        return this.endpointCall<PvpClaimChestApiData>(ApiEndpoints.pvp_starchest_claim, player, {});
    }

    async methodPvpChestClaim(player: Player, args: { id: number, unlock: boolean }) {
        return this.endpointCall<PvpClaimChestApiData>(ApiEndpoints.pvp_chest_claim, player, args);
    }

    async methodPvpLoad(player: Player) {
        return this.endpointCall<PvpLoadApiData>(ApiEndpoints.pvp_load, player, {});
    }

    async methodLootboxOpen(player: Player, args: { type: number }) {
        return this.endpointCall<LootboxOpenApiData>(ApiEndpoints.lootbox_open, player, args);
    }

    async methodCardsBattleFight(player: Player, args: { location: number, mission: number, deck: number }) {
        return this.endpointCall<CardsFightApiData>(ApiEndpoints.cards_battle_fight, player, args);
    }
}
