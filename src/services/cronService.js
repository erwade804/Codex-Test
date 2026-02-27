const { syncPackagesFromPi } = require("./packageService");

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function startPackageSyncCron() {
  const timer = setInterval(async () => {
    try {
      await syncPackagesFromPi();
      console.log("[cron] syncPackagesFromPi completed");
    } catch (error) {
      console.error("[cron] syncPackagesFromPi failed", error);
    }
  }, FIVE_MINUTES_MS);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  return timer;
}

module.exports = {
  FIVE_MINUTES_MS,
  startPackageSyncCron
};
