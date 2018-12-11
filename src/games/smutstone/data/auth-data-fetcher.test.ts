
import test from 'ava';

import { AuthDataFetcher } from './auth-data-fetcher';

test('invalid data', async t => {
    const fetcher = new AuthDataFetcher();
    const data = await fetcher.fetch({
        gameId: 'a',
        id: 'a',
        identity: { cook: 'a' }
    })

    t.true(typeof data.cook === 'string')
})
