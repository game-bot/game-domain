import { GameJobInfo } from "../../game-job-info";
import { GameTask } from "../../game-task";
import { AuthData } from "./data/auth-data";


export abstract class SmutstoneTask<RD=any> extends GameTask<AuthData, RD> {
    constructor(info: GameJobInfo) {
        super(info)
    }
}
