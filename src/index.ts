/**
 * freshlog
 * elliot hatch 2018
 */
import { Middleware } from './middleware';
import { Serializer } from './serializer';
import { Target } from './target';

import { Logger } from './logger';

/**
 * Tried to log at a level that hasn't been configured. See logger.addHandler.
 */
export class InvalidLoggerError extends Error {
    constructor(level: string) {
        super(`Missing log handler for "${level}"`);
        Object.setPrototypeOf(this, InvalidLoggerError.prototype);
    }
}

const Log = new Logger({});
export { Log, Logger, Middleware, Serializer, Target };
