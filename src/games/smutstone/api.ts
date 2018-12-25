
// const debug = require('debug')('gamebot:smutstone:api');

import { IDictionary } from "@gamebot/domain";
import { Player } from "../../entities/player";
import { BaseSmutstoneApi } from "./base-api";
import { PvpBattleFightApiDataMapper, PvpLoadApiDataParser, PvpClaimChestApiDataParser, PvpBattleFightApiData, PvpClaimChestApiData, PvpLoadApiData } from "./data/api/pvp-data";
import { ApiEndpoints, ApiEndpointInfo } from "./data/endpoints";
import { CardsFightApiDataParser, CardsFightApiData } from "./data/api/cards-fight-data";
import { LootboxOpenApiDataMapper, LootboxOpenApiData } from "./data/api/toolbox-data";
import ms = require("ms");
import { IApiClientRepository } from "../../repositories/api-client-repository";
import { AuthDataMapper } from "./data/auth-data";
import { UserDataMapper } from "./data/user-data";




export class SmutstoneApi extends BaseSmutstoneApi {

    constructor(repository: IApiClientRepository, version: number = 28, defaultHeaders?: IDictionary<string>) {
        const endpoints = new Map<ApiEndpoints, ApiEndpointInfo>();
        endpoints.set(ApiEndpoints.cards_battle_fight, {
            mapper: new CardsFightApiDataParser(),
            // ttl: ms('30m'),
        });
        endpoints.set(ApiEndpoints.lootbox_open, {
            mapper: new LootboxOpenApiDataMapper(),
            // ttl: ms('1h'),
        });
        endpoints.set(ApiEndpoints.pvp_battle_fight, {
            mapper: new PvpBattleFightApiDataMapper(),
            // ttl: ms('30m'),
        });
        // endpoints.set(ApiEndpoints.pvp_battle_start, new EmptyEntityMapper());
        endpoints.set(ApiEndpoints.pvp_chest_claim, {
            mapper: new PvpClaimChestApiDataParser(),
            // ttl: ms('30m'),
        });
        endpoints.set(ApiEndpoints.pvp_load, {
            mapper: new PvpLoadApiDataParser(),
            ttl: ms('1h'),
        });
        endpoints.set(ApiEndpoints.pvp_starchest_claim, {
            mapper: new PvpClaimChestApiDataParser(),
            // ttl: ms('30m'),
        });
        endpoints.set(ApiEndpoints.authenticate, {
            mapper: new AuthDataMapper(),
            ttl: ms('30m'),
        });
        endpoints.set(ApiEndpoints.user_data, {
            mapper: new UserDataMapper(),
            ttl: ms('30m'),
        });

        super(repository, endpoints, version, defaultHeaders);
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
