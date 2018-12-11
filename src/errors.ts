
export enum GAMEBOT_ERROR_CODES {
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    API_400_ERROR = 'API_400_ERROR',
    API_500_ERROR = 'API_500_ERROR',
    API_DATA_PARSE_ERROR = 'API_DATA_PARSE_ERROR',
}

export class GamebotError extends Error {
    constructor(readonly code: GAMEBOT_ERROR_CODES, message: string, readonly data?: any) {
        super(message);
    }
}
