import { getAllGamesInfo } from "./game-info";
import { readdirSync } from "fs";
import { Dictionary } from "./utils";

const DATA = getAllGamesInfo().reduce<Dictionary<GameJobInfo[]>>((map, game) => {
    const infos = readdirSync(`./games/${game.id}/jobs`)
        .map(file => require(file).jobInfo as GameJobInfo)
        .filter(item => !!item);

    map[game.id] = infos;

    return map;
}, {});

export interface GameJobInfo {
    id: string
    name: string
    interval: string
    gameId: string
}

export function getGameJobsInfo(gameId: string) {
    return DATA[gameId] || [];
}
