import { EntityMapper } from "../../../entities/entity-mapper";

export enum ApiEndpoints {
    authenticate = 'authenticate',
    user_data = 'user.data',
    pvp_battle_fight = 'pvp.battle.fight',
    pvp_battle_start = 'pvp.battle.start',
    pvp_starchest_claim = 'pvp.starchest.claim',
    pvp_chest_claim = 'pvp.chest.claim',
    pvp_load = 'pvp.load',
    lootbox_open = 'lootbox.open',
    cards_battle_fight = 'cards.battle.fight',
}

export type ApiEndpointInfo = {
    mapper: EntityMapper<any>
    ttl?: number
}
