import { Observable, Subscriber } from 'rxjs';

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

    /** Creates a target that emits logs as observable events
     * @returns object containing the target and the observable the target will emit to */
    export function Subscriber(name: string): {observable: Observable<any>, target: Target} {
        let targetSubscriber: Subscriber<any>;
        const observable = new Observable((subscriber) => {
            targetSubscriber = subscriber;
        });

        return {
            observable,
            target: {
                name,
                write: (serializedData) => {
                    if(targetSubscriber) {
                        targetSubscriber.next(serializedData)
                    }
                }
            }
        };
    };
}
