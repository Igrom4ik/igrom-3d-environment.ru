# Browser Console Errors - 2026-01-27

## Error 1: RangeError: Invalid array length

**Context:** Occurs during Keystatic admin usage, likely triggered by a server connection abort (net::ERR_ABORTED) during a file upload or render cycle.

**Stack Trace:**
```
[error] RangeError: Invalid array length
    at addObjectToProperties (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:3947:19)
    at addValueToProperties (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:4130:15)
    at addObjectToProperties (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:3952:11)
    at addValueToProperties (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:4130:15)
    at addObjectDiffToProperties (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:4270:13)
    at addObjectDiffToProperties (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:4238:21)
    at logComponentRender (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:4352:22)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16719:13)
    ...
```

## Error 2: Error: Should not already be working.

**Context:** React Scheduler error, often a side effect of the previous error or an interrupted render phase.

**Stack Trace:**
```
[error] Error: Should not already be working.
    at performWorkOnRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:17756:15)
    at performWorkOnRootViaSchedulerTask (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:20385:7)
    at MessagePort.performWorkUntilDeadline (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/scheduler/cjs/scheduler.development.js:45:48)
```
