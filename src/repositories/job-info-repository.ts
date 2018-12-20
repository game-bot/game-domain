import { dataGameJob, dataGameJobs } from "../data";
import { GameJobInfo } from "../entities/game-job-info";


// export interface ListJobsFilters {
//     limit: number
// }

export class JobInfoRepository {
    getById(gameId: string, jobId: string): GameJobInfo | null {
        return dataGameJob(gameId, jobId);
    }
    getByGameId(gameId: string): GameJobInfo[] {
        return dataGameJobs(gameId);
    }
}
