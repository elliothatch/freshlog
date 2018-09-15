/** Writes serialized log (e.g. json) to the target (e.g. stdout) */
export interface Target {
    name: string;
    write: (serializedData: string) => void;
}

/** Standard targets */
export const Target = {
    stderr: {
        name: 'stderr',
        write(serializedData: string): void {
            console.error(serializedData);
        }
    },
    stdout: {
        name: 'stdout',
        write(serializedData: string): void {
            console.log(serializedData);
        }
    },
};

