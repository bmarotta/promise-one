import { PromiseOne, PromiseStatus } from "../src/index";

describe("promise-one", () => {
    test("cannot execute unregistered promise", async () => {
        try {
            PromiseOne.resolve("test-0");
        } catch (e) {
            expect(e instanceof Error).toBeTruthy();
            expect(e.message).toBe("Promise test-0 not found");
        }
    });

    test("can resolve promise", async () => {
        const value = await PromiseOne.resolve("test-1", () => new Promise((resolve) => resolve(true)));
        expect(value).toBeTruthy();
    });

    test("can get pending and successful status", async () => {
        const valuePromise = PromiseOne.resolve("test-2", () => new Promise((resolve) => resolve(true)));
        expect(PromiseOne.getStatus("test-2")).toEqual(PromiseStatus.Pending);
        const value = await valuePromise;
        expect(value).toBeTruthy();
        expect(PromiseOne.getStatus("test-2")).toEqual(PromiseStatus.Success);
    });

    test("can get fail promise and retry automatically", async () => {
        const p = PromiseOne.resolve("test-3", () => new Promise((resolve, reject) => reject("Error")));
        expect.assertions(1);
        try {
            await p;
        } catch (e) {
            expect(e).toMatch("Error");
        }
    });

    test("can get fail promise and retry automatically", async () => {
        let executions = 0;
        const p = PromiseOne.resolve(
            "test-3",
            () =>
                new Promise((resolve, reject) => {
                    executions++;
                    console.log(` === Executing promise ${executions}`);
                    if (executions <= 1) {
                        reject("Error");
                    } else {
                        resolve(true);
                    }
                })
        );
        // Promise not executed yet. Status must be pending
        let status = PromiseOne.getStatus("test-3");
        expect(status).toEqual(PromiseStatus.Pending);

        try {
            await PromiseOne.resolve("test-3");
        } catch (e) {
            expect(e).toMatch("Error");
        }

        // Promise failed. Status must be pending
        status = PromiseOne.getStatus("test-3");
        expect(status).toEqual(PromiseStatus.Failed);

        const value = await PromiseOne.resolve("test-3");

        // Promise retried. Status must be pending
        status = PromiseOne.getStatus("test-3");
        expect(PromiseOne.getStatus("test-3")).toEqual(PromiseStatus.Success);
        expect(value).toBeTruthy();
    });

    test("can get unknown status", async () => {
        expect(PromiseOne.getStatus("test-1000")).toBe(PromiseStatus.NotKnownOf);
    });
});
