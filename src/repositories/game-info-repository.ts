import { GameInfo, GameStatus } from "../entities/game-info";
import { dataGameById, dataGames } from "../data";


export interface ListGamesFilters {
    status?: GameStatus
    limit: number
}

export class GameInfoRepository {
    getById(id: string): GameInfo | null {
        return dataGameById(id);
    }
    getByIds(ids: string[]): GameInfo[] {
        const items = ids.map(dataGameById).filter(item => !!item) as GameInfo[];
        if (!items.length) {
            return items;
        }

        return items;
    }

    list(filters: ListGamesFilters): GameInfo[] {
        let items = dataGames();

        if (filters && filters.status) {
            items = items.filter(item => item.status === filters.status);
        }

        items = items.slice(0, filters.limit);

        return items;
    }

    all() {
        return dataGames();
    }
}
