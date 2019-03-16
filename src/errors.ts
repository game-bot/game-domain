
export enum GAMEBOT_ERROR_CODES {
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    API_400_ERROR = 'API_400_ERROR',
    API_500_ERROR = 'API_500_ERROR',
    API_DATA_ERROR = 'API_DATA_ERROR',
    JOB_CONFIG_ERROR = 'JOB_CONFIG_ERROR',
}

export type GamebotErrorDetails = {
    gameId?: string
    jobId?: string
    taskId?: string
    data?: any
    params?: any
}

export class GamebotError extends Error {
    constructor(readonly code: GAMEBOT_ERROR_CODES, message: string, readonly details: GamebotErrorDetails, readonly statusCode: number) {
        super(message);
        this.message = message;
        // this.name = this.constructor.name;
        // if (typeof Error.captureStackTrace === 'function') {
        //     Error.captureStackTrace(this, this.constructor);
        // } else {
        //     this.stack = (new Error(message)).stack;
        // }
    }
}

export class GamebotUnknownError extends GamebotError {
    constructor(message: string, details: GamebotErrorDetails, statusCode: number) {
        super(GAMEBOT_ERROR_CODES.UNKNOWN_ERROR, message, details, statusCode);
    }
}

export class GamebotApi400Error extends GamebotError {
    constructor(message: string, details: GamebotErrorDetails, statusCode: number = 400) {
        super(GAMEBOT_ERROR_CODES.API_400_ERROR, message, details, statusCode);
    }
}

export class GamebotApi500Error extends GamebotError {
    constructor(message: string, details: GamebotErrorDetails, statusCode: number = 500) {
        super(GAMEBOT_ERROR_CODES.API_500_ERROR, message, details, statusCode);
    }
}

export class GamebotApiDataError extends GamebotError {
    constructor(message: string, details: GamebotErrorDetails, statusCode: number = 500) {
        super(GAMEBOT_ERROR_CODES.API_DATA_ERROR, message, details, statusCode);
    }
}

export class GamebotJobConfigError extends GamebotError {
    constructor(message: string, details: GamebotErrorDetails, statusCode: number = 500) {
        super(GAMEBOT_ERROR_CODES.JOB_CONFIG_ERROR, message, details, statusCode);
    }
}
