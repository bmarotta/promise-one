# single-promise

A simple but reliable singleton promise implementation (key-based). Useful when you want to load remote resources only once and wants to make sure that they are successfully executed

## Installation

```
npm install single-promise
```

## Usage

Each singleton promise is identified by a key. You can call it in different parts of your code and as long as it returned successfully once it wont't be called again.

The problem of most singleton promise implementations, is that they assume that things always work. But that's not the case.
Sometimes things go wrong, mostly on async calls.

SinglePromise solves exactly these cases. It not only implements the singleton promise pattern, but it also makes sure that if the first call fails, the second time you call it, it will try to call the original promise again.

It is important to understand that a promise CANNOT be re-executed. That's why when calling promise one, we need to pass a function
that returns a Promise. It should return each time a new promise.

```javascript

// Assuming that initializeSomething return a promise, the below code will first resolve initializeSomething
// and then call doSomething
SinglePromise.resolve("init", () => initializeSomething()).then(() => doSomething());

(...)

// In some other part of your code, you need to doOtherThing, but before you have to make sure that
// initializeSomething is done. 3 scenario are possible here:
// 1. initializeSomething is still running. In this case it will wait for it to finish and then run doOtherThing
// 2. initializeSomething executed successfully. In this case it will execute doOtherThing "immediately"
// 3. initializeSomething failed. In this case it will execute initializeSomething again and then doOtherThing (if initialize something succeeds)
SinglePromise.resolve("init", () => initializeSomething()).then(() => doOtherThing());


```

Once a promise is registered, in the subsequent calls you don't need to pass the factory function again. As in the example below, the promise is first resolved in the class constructor. In the subsequent methods we don't need to pass the promise initialization again

```typescript
class MyClass {
    private myLibPromise;

    constructor() {
        SinglePromise.resolve("my-lib", () => this.loadMyLib());
    }

    async loadMyLib() {
        // Load my library.
    }

    async callMyLib() {
        await SinglePromise.resolve("my-lib");
        // Use my library
    }
}
```
