import { getAllGamesInfo } from "./game-info";
import { readdirSync } from "fs";
import { Dictionary } from "./utils";
import { join } from "path";

const DATA = getAllGamesInfo().reduce<Dictionary<GameJobInfo[]>>((map, game) => {
    const dir = join(__dirname, 'games', game.id, 'jobs');
    const infos = readdirSync(dir)
        .filter(file => file.endsWith('.js'))
        .map(file => require(`./games/${game.id}/jobs/${file}`).jobInfo as GameJobInfo)
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
