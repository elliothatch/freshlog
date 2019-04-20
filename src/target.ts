import { Observable, Subject } from 'rxjs';

/** Writes serialized log (e.g. json) to the target (e.g. stdout) */
export interface Target {
    name: string;
    write: (serializedData: string) => void;
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
     * @returns object containing the target and the observable the target will emit to */
    export function Observable(name?: string, subject?: Subject<any>): {observable: Observable<any>, target: Target} {
        if(!subject) {
            subject = new Subject();
        }

        return {
            observable: subject,
            target: {
                name: name || 'observable',
                write: (serializedData) => {
                    subject!.next(serializedData);
                }
            }
        };
    };
}
