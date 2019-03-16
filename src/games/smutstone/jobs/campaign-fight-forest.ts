import { SmutstoneApi } from "../api";
import { CampaignFightLocationJob } from "./campaign-fight-location";

export default class CampaignFightForestJob extends CampaignFightLocationJob {
    constructor(api: SmutstoneApi) {
        super(__filename, api, 1);
    }
}
