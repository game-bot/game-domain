import { Dictionary } from "./utils";

export type Player = {
    id: string
    gameId: string
    identity?: Dictionary<string>
}
