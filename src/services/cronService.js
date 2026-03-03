const { syncPackagesFromPi } = require("./packageService");

const syncPackagesTime = 60 * 1000;

function startPackageSyncCron() {
  const timer = setInterval(async () => {
    try {
      await syncPackagesFromPi();
      console.log("[cron] syncPackagesFromPi completed");
    } catch (error) {
      console.error("[cron] syncPackagesFromPi failed", error);
    }
  }, syncPackagesTime);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  return timer;
}

module.exports = {
  syncPackagesTime,
  startPackageSyncCron
};
