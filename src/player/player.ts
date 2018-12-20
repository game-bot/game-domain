import { IDictionary } from "@gamebot/domain";


export type Player = {
    id: string
    gameId: string
    identity?: IDictionary<string>
}
