
export interface GameJobInfo {
    readonly id: string
    readonly name: string
    readonly frequency: string
    readonly gameId: string
    readonly createdAt: string
    readonly defaultStatus: GameJobInfoStatus
}

export type GameJobInfoStatus = 'active' | 'inactive';
