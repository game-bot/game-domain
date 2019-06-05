import { IDictionary } from "@gamebot/domain";
import { GameInfo, GameInfoFields } from "./entities/game-info";
import { GameJobInfo } from "./entities/game-job-info";
import { pickDeep } from "./utils";
import path = require("path");
const DATA_GAMES_INFO_LIST = require("../data/games.json") as DataGameInfo[];

interface DataGameInfo extends GameInfo {
  jobs: DataGameJobInfo[];
}

interface DataGameJobInfo extends GameJobInfo {
  gameId: string;
}

// const DATA_GAMES_INFO_MAP = DATA_GAMES_INFO_LIST.reduce<IDictionary<DataGameInfo>>((dic, game) => {
//     dic[game.id] = game;
//     return dic;
// }, {});

const DATA_GAME_JOB_MAP = DATA_GAMES_INFO_LIST.reduce<
  IDictionary<DataGameJobInfo>
>((dic, game) => {
  for (const job of game.jobs) {
    const key = formatGameJobKey(game.id, job.id);
    job.gameId = game.id;
    dic[key] = job as GameJobInfo;
  }
  return dic;
}, {});

const GAME_JOBS_MAP = DATA_GAMES_INFO_LIST.reduce<IDictionary<GameJobInfo[]>>(
  (dic, game) => {
    dic[game.id] = game.jobs;
    return dic;
  },
  {}
);

const GAMES_INFO_LIST = DATA_GAMES_INFO_LIST.map(item =>
  pickDeep<GameInfo, GameInfo>(item, GameInfoFields)
);
const GAMES_INFO_MAP = GAMES_INFO_LIST.reduce<IDictionary<GameInfo>>(
  (dic, info) => {
    dic[info.id] = info;
    return dic;
  },
  {}
);

export function dataGames() {
  return GAMES_INFO_LIST;
}

export function dataGameById(id: string): GameInfo | null {
  return GAMES_INFO_MAP[id] || null;
}

export function dataGameJobs(gameId: string) {
  return GAME_JOBS_MAP[gameId] || [];
}

export function dataGameJob(gameId: string, jobId: string): GameJobInfo | null {
  const key = formatGameJobKey(gameId, jobId);
  return DATA_GAME_JOB_MAP[key] || null;
}

/**
 * Gets game job info from job file path
 * @param jobFile Job file path: ../games/GAME/jobs/JOB.js
 */
export function dataGameJobByFile(jobFile: string) {
  const info = path.parse(jobFile);
  const gameDir = path.dirname(info.dir);
  const gameId = path.basename(gameDir);
  const jobId = info.name;

  return dataGameJob(gameId, jobId);
}

function formatGameJobKey(gameId: string, jobId: string) {
  return gameId + "/" + jobId;
}
