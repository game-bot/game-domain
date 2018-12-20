
import test from 'ava';
import { dataGames, dataGameById, dataGameJobs, dataGameJobByFile } from './data';
import { join } from 'path';



test('dataGames', t => {
    const games = dataGames();
    t.is(games.length, 1);
    t.is(games[0].id, 'smutstone');
})

test('dataGameById', t => {
    const game = dataGameById('smutstone');
    t.true(!!game);
    game && t.is(game.id, 'smutstone');
})

test('dataGameJobs', t => {
    const jobs = dataGameJobs('smutstone');
    t.is(jobs.length, 3);
})

test('dataGameJobByFile', t => {
    const jobs = dataGameJobs('smutstone');
    for (const item of jobs) {
        const job = dataGameJobByFile(join(__dirname, 'games', item.gameId, 'jobs', item.id + '.js'));
        t.true(!!job);
    }
})
