import { Dictionary } from "./utils";

export type GameResourcesData = Dictionary<number>

export class GameResources<T extends string=string> {
    constructor(private data: GameResourcesData = {}) { }

    static create<T extends string>(data?: GameResourcesData) {
        return new GameResources<T>(data);
    }

    set(name: T, count: number) {
        this.data[name as string] = count;
    }

    get(name: T) {
        const count = this.data[name as string];
        if (typeof count !== 'number') {
            return undefined;
        }

        return count;
    }

    inc(name: T, count: number) {
        this.data[name as string] = (this.get(name) || 0) + count;
    }

    remove(name: T) {
        delete this.data[name as string];
    }

    getData() {
        return this.data;
    }
}
