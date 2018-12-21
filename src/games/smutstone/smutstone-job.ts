import { GameJob } from "../../game-job";
import { SmutstoneApi } from "./api";


export abstract class SmutstoneJob extends GameJob {
    constructor(file: string, protected api: SmutstoneApi) {
        super(file);
    }
}
