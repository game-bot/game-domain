import { GameResources } from "../../game-resources";

const debug = require('debug')('gamebot:smutstone');

export enum SmutstoneResources {
    gold = 'gold',
    cards = 'cards',
    items = 'items',
    energy = 'energy',
    tournament_points = 'tournament_points',
    duel_points = 'duel_points',
}

export function createGameResourcesFromRewards(rewards: any[]) {
    const stats = new GameResources<SmutstoneResources>();
    for (const reward of rewards) {
        if (Array.isArray(reward.i)) {
            (reward.i as number[][]).forEach(item => stats.inc(SmutstoneResources.items, item[item.length - 1]));
        } else if (typeof reward.r === 'object') {
            if (typeof reward.r.gold === 'number') {
                stats.inc(SmutstoneResources.gold, reward.r.gold);
            } else if (typeof reward.r.energy === 'number') {
                stats.inc(SmutstoneResources.energy, reward.r.energy);
            }
        } else if (Array.isArray(reward.cards)) {
            (reward.cards as number[][]).forEach(item => stats.inc(SmutstoneResources.cards, item[item.length - 1]));
        } else if (typeof reward.p === 'number') {
            stats.inc(SmutstoneResources.tournament_points, reward.p);
        } else {
            debug(`Unknown resource type: ${JSON.stringify(reward)}`);
        }
    }

    return stats;
}
