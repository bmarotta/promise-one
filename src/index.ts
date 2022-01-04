export enum PromiseStatus {
    NotKnownOf = 0,
    Pending = 1,
    Success = 2,
    Failed = 3
}

interface PromiseReference {
    // The current status
    status: PromiseStatus;
    // The wrapper promise created by SinglePromise
    promise: Promise<any>;
    // The function that generates the promise
    function: () => Promise<any>;
}

export class SinglePromise {
    private static _map: { [key: string]: PromiseReference } = {};

    /**
     * Executes a promise uniquely identified by a key only if not yet executed or if failed. If a previous promise with the same
     * key has status pending or success, returns this promise
     * @param key Uniquely identifies a promise
     * @param p A function that returns a promise
     * @returns A promise to wait for
     */
    static resolve<T>(key: string, p?: () => Promise<T>): Promise<T> {
        // Check if we already know about a promise with this key
        const existing = SinglePromise._map[key];
        if (existing) {
            if (existing.status == PromiseStatus.Failed) {
                // We executed it in the past, but it failed. Let's execute again
                if (!p) {
                    // In case no new function was provided, use the existing one
                    p = SinglePromise._map[key].function;
                }
                // Delete from the map
                SinglePromise.reset(key);
            } else {
                // Return the pending or successfully executed promise
                return existing.promise;
            }
        } else if (!p) {
            throw new Error(`Promise ${key} not found`);
        }
        // Create a promise for setting the status
        const result = new Promise<T>((resolve, reject) => {
            p()
                .then((value: T) => {
                    SinglePromise._map[key].status = PromiseStatus.Success;
                    resolve(value);
                })
                .catch((reason: any) => {
                    SinglePromise._map[key].status = PromiseStatus.Failed;
                    reject(reason);
                });
        });
        // Save it in our map
        SinglePromise._map[key] = {
            status: PromiseStatus.Pending,
            promise: result,
            function: p
        };
        return result;
    }

    /**
     * Reset the status of a promise. Please not that if the promise is pending it won't be cancelled
     * @param key Promise key
     */
    static reset(key: string) {
        delete SinglePromise._map[key];
    }

    /**
     * Gets the execution status of a promise based on its key
     * @param key Promise key
     * @returns The execution status
     */
    static getStatus(key: string): PromiseStatus {
        const existing = SinglePromise._map[key];
        if (existing) {
            return existing.status;
        }
        return PromiseStatus.NotKnownOf;
    }
}
