
import test from 'ava';
import { PlayerIdentityValidator } from './player-identity-validator';

const validator = new PlayerIdentityValidator();

test('throw invalid game', async t => {
    await t.throws(() => validator.validate({ gameId: 'nogame', identity: 'dsfsdfsfd' }), /Invalid game id/);
})

test('not valid identity', async t => {
    await t.is(await validator.validate({ gameId: 'smutstone', identity: 'dsfsdfsfd' }), false);
})
