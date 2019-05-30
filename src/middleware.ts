/** Transforms the log object.
 * @returns transformed log, which is piped through remaining middlewares, then serialized and written to the target.
 */
export type Middleware = (data: object) => any;

/** Standard middlewares */
export const Middleware = {
    timestamp: <T extends object>(data: T) => Object.assign(data, {timestamp: new Date().toISOString()}),
    /** make 'message' and 'stack' enumerable on errors, add error type. recursive */
    error: <T extends object>(data: T) => {
        if (typeof data !== 'object' || !data) {
            return data;
        }

        Object.keys(data).forEach((p) => Middleware.error((data as any)[p]));

        if(data instanceof Error) {
            Object.defineProperty(data, 'message', {enumerable: true});
            Object.defineProperty(data, 'stack', {enumerable: true});
            return Object.assign(data, {errorType: data.constructor.name});
        }

        return data;
    },
};
