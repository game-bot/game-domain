
import test from 'ava';

import { getAllGamesInfo } from './game-info';



test('getAllGamesInfo', t => {
    const games = getAllGamesInfo();

    t.is(games.length, 1);
    t.is(games[0].id, 'smutstone');
})
