import { Dictionary } from "./utils";

const DATA = ['smutstone'].map(name => require(`./games/${name}/game-info`).default as GameInfo);

const DATA_MAP = DATA.reduce<Dictionary<GameInfo>>((map, info) => {
    map[info.id] = info;
    return map;
}, {});

export interface GameInfo {
    id: string
    name: string
}

export function getGameInfo(id: string): GameInfo | null {
    const info = DATA_MAP[id];
    if (!info) {
        return null;
    }
    return info;
}

export function getAllGamesInfo(): GameInfo[] {
    return DATA;
}
