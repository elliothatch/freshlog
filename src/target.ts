import { Observable, Subject } from 'rxjs';

/** Writes serialized log (e.g. json) to the target (e.g. stdout) */
export interface Target {
    name: string;
    write: (serializedData: any) => void;
}

/** Standard targets */
export namespace Target {
    export const stderr = {
        name: 'stderr',
        write(serializedData: string): void {
            console.error(serializedData);
        }
    };

    export const stdout = {
        name: 'stdout',
        write(serializedData: string): void {
            console.log(serializedData);
        }
    };

    /** Creates a target that emits logs as observable events, using a Subject
     * @param name - name of the target. Defaults to 'observable'
     * @param subject - the Subject to use to emit observable events. If not provided, creates a standard Subject. E.g. you can pass a ReplaySubject if you need to replay values with a specific buffer size
     * @param T - the type of serialized data that will be emitted from the Observable
     * @returns object containing the target and the observable the target will emit to */
    export function Observable<T = any>(name?: string, subject?: Subject<T>): {observable: Observable<T>, target: Target} {
        if(!subject) {
            subject = new Subject<T>();
        }

        return {
            observable: subject,
            target: {
                name: name || 'observable',
                write: (serializedData: T) => {
                    subject!.next(serializedData);
                }
            }
        };
    };
}
