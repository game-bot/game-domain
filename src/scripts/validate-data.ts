
import * as Ajv from 'ajv';
import { dataGames, dataGameJobs } from '../data';
import { join } from 'path';
import { existsSync } from 'fs';

validateData();
validateJobs();

function validateData() {
    const schema = require('../../data/games.schema.json');
    const data = require('../../data/games.json');

    const ajv = new Ajv();

    var valid = ajv.validate(schema, data);
    if (!valid) {
        throw new Error(JSON.stringify((<any[]>ajv.errors)[0]));
    }
}

function validateJobs() {
    const games = dataGames();
    for (const game of games) {
        const jobs = dataGameJobs(game.id);
        for (const job of jobs) {
            const file = join(__dirname, '..', 'games', game.id, 'jobs', job.id + '.js');
            if (!existsSync(file)) {
                throw new Error(`job not found: ${file}`);
            }
            const obj = require(file);
            if (!obj.default) {
                console.log(obj)
                throw new Error(`Invalid job structure: ${file}`);
            }
        }
    }
}
