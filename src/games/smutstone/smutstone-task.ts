import { GameJobInfo } from "../../game-job-info";
import { GameTask } from "../../game-task";
import { AuthData } from "./data/auth-data";


export abstract class SmutstoneTask<R=any> extends GameTask<AuthData, R> {
    constructor(info: GameJobInfo) {
        super(info)
    }
}
