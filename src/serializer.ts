import * as JsonStringifySafe from 'json-stringify-safe';

/** Serializes log object to a string (e.g. json) */
export interface Serializer {
    name: string;
    serialize: (data: object) => any;
}

/** Standard serializers */
export const Serializer = {
    json: {
        name: 'json',
        serialize(data: any): string {
            return JsonStringifySafe(data);
        }
    },
    identity: {
        name: 'identity',
        serialize(data: any): string {
            return data;
        }
    }
};
