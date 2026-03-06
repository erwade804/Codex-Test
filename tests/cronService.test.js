const test = require("node:test");
const assert = require("node:assert/strict");

const cronModulePath = require.resolve("../src/services/cronService");

test("startPackageSyncCron schedules package sync interval and calls unref", () => {
  const originalSetInterval = global.setInterval;
  let capturedDelay;
  let capturedCallback;
  let unrefCalled = false;

  global.setInterval = (callback, delay) => {
    capturedCallback = callback;
    capturedDelay = delay;
    return {
      unref() {
        unrefCalled = true;
      }
    };
  };

  delete require.cache[cronModulePath];
  const { syncPackagesTime, startPackageSyncCron } = require("../src/services/cronService");

  const timer = startPackageSyncCron();

  assert.equal(capturedDelay, syncPackagesTime);
  assert.equal(typeof capturedCallback, "function");
  assert.equal(typeof timer.unref, "function");
  assert.equal(unrefCalled, true);

  global.setInterval = originalSetInterval;
});
