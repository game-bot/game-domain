import { Player } from "../player";
import { Dictionary } from "../utils";

export interface IPlayerDataFetcher<T=Dictionary<string>, D=void> {
    fetch(player: Player, playerData?: D): Promise<T>
}

export abstract class PlayerDataFetcher<T, D=void> implements IPlayerDataFetcher<T, D> {
   
    constructor() {

    }

    abstract fetch(player: Player, playerData?: D): Promise<T>

    // async fetch(player: Player, playerData?: D): Promise<T> {
    //     const options = this.formatGotOptions(player, playerData);

    //     const response = await got(this.url, options as any);

    //     const data = this.formatData(response, player);

    //     return data;
    // }

    // protected abstract formatData(response: got.Response<any>, player: Player): T

    // protected abstract formatGotOptions(player: Player, playerData?: D): got.GotJSONOptions | got.GotFormOptions<string> | got.GotFormOptions<null> | got.GotBodyOptions<string> | got.GotBodyOptions<null>

    // protected abstract getData(player: Player, playerData?: D): Promise<T>
}
