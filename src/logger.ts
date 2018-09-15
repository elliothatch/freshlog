import { Middleware } from './middleware';
import { Serializer } from './serializer';
import { Target } from './target';
import { InvalidLoggerError } from './index';

/**
 * Log data to a target (default: stdout) in a specified format (default: json).
 * Configure output levels (info, warn, etc) with custom targets or serializers
 * Create transformations that extend or modify each log (e.g. add timestamp)
 * Dynamically create new log levels, or extend the Logger class
 */
class Logger {
    public static readonly defaultOptions: Logger.Options = {
        middleware: [
            {mw: Middleware.timestamp, levels: true},
            {mw: Middleware.error, levels: true},
        ]
    };

    public static readonly defaultHandler: Logger.Handler = {
        enabled: true,
        middleware: [],
        serializer: Serializer.json,
        target: Target.stdout,
    };

    public static readonly defaultHandlers = new Map<string, Logger.Handler>([
        ['diag', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['telem', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['request', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['trace', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['info', Logger.defaultHandler],
        ['warn', Logger.defaultHandler],
        ['error', Logger.defaultHandler],
        ['fatal', Logger.defaultHandler],
    ]);

    /**
     * maps each log level to a handler.
     * Enabling a log level:
     *    `handlers.get('trace').enabled = true;`
     *  Change target:
     *    `handlers.get('warn').target = Target.stderr
     */
    public handlers: Map<string, Logger.Handler>;

    constructor(opts: Partial<Logger.Options>) {
        const options: Logger.Options = Object.assign({}, Logger.defaultOptions, opts);

        this.handlers = new Map();
        // copy default handlers
        for (const item of Logger.defaultHandlers) {
            const handler = Object.assign({}, item[1]);
            handler.middleware = handler.middleware.slice();
            if(options.target) {
                handler.target = options.target;
            }
            if(options.serializer) {
                handler.serializer = options.serializer;
            }
            this.handlers.set(item[0], handler);
        }

        options.middleware.forEach((mw) => {
                this.addMiddleware(mw.mw, mw.levels);
            });
    }

    /**
     * process and serialize log.
     * @param level name of the log level. must be default handler or initialized with logger.addHandler first'
     * @param userData - custom properties to log
     */
    public log(level: string, message: string, userData: object = {}): void {
        const handler = this.handlers.get(level);

        if(!handler) {
            throw new InvalidLoggerError(level);
        }

        if(!handler.enabled) {
            return;
        }

        let data: any = {
            level,
            message
        };

        Object.assign(data, userData);

        handler.middleware.forEach((middleware) => {
            data = middleware(data);
        });

        handler.target.write(handler.serializer.serialize(data));
    }

    // Log levels

    /** system diagnostic info */
    public diag(message: string, userData?: object): void {
        this.log('diag', message, userData);
    }

    /** operational logging */
    public trace(message: string, userData?: object): void {
        this.log('trace', message, userData);
    }

    /** perforance and timing data */
    public telem(message: string, userData?: object): void {
        this.log('telem', message, userData);
    }

    /** network requests */
    public request(message: string, userData?: object): void {
        this.log('request', message, userData);
    }

    /** startup status and notable events (ENABLED BY DEFAULT) */
    public info(message: string, userData?: object): void {
        this.log('info', message, userData);
    }

    /** warning (ENABLED BY DEFAULT) */
    public warn(message: string, userData?: object): void {
        this.log('warn', message, userData);
    }

    /** unhandled error (ENABLED BY DEFAULT) */
    public error(message: string, userData?: object): void {
        this.log('error', message, userData);
    }

    /** unrecoverable error (ENABLED BY DEFAULT) */
    public fatal(message: string, userData?: object): void {
        this.log('fatal', message, userData);
    }

    /**
     * @param levels - adds the middleware to handlers for all listed levels. if true, add to all handlers
     */
    public addMiddleware(middleware: Middleware, levels: true | string[]): void {
        if(levels === true) {
            levels = Array.from(this.handlers.keys());
        }

        (levels as string[]).forEach((level) => {
            const handler = this.handlers.get(level);
            if(handler) {
                handler.middleware.push(middleware);
            }
        });
    }

    /** add a log level, which can be inovked with logger.log(name, 'my message');
     * @param name - recorded in each log
     * @param handler - handler options. missing fields are populated by Logger.defaultHandler
     * @returns fully initialized log handler
     */
    public addHandler(name: string, handler: Partial<Logger.Handler>): Logger.Handler {
        const h: Logger.Handler = Object.assign({}, Logger.defaultHandler, handler);
        if(!handler.middleware) {
            h.middleware = Logger.defaultOptions.middleware.map(mw => mw.mw);
        }
        this.handlers.set(name, h);
        return h;
    }
}

namespace Logger {
    /** class constructor options */
    export interface Options {
        /** Middleware for each log level
         * appended to the default log middleware.
         * levels is an array of level names the middleware is applied to.
         * if levels is true, it is applied to all levels
         */
        middleware: Array<{ mw: Middleware, levels: true | string[] }>;
        /** if provided, all log levels are initialized with this target */
        target?: Target;
        /** if provided, all log levels are initialized with this serializer */
        serializer?: Serializer;
    }

    /** Describes how logs for a level are processed */
    export interface Handler {
        enabled: boolean;
        middleware: Middleware[];
        serializer: Serializer;
        target: Target;
    }
}

export { Logger };
