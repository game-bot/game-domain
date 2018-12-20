
export type GameStatus = 'active' | 'inactive';

export interface GameInfo {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly url: string
    readonly status: GameStatus
    readonly createdAt: string
}

export const GameInfoFields = [
    'id',
    'name',
    'description',
    'url',
    'status',
    'createdAt',
];
