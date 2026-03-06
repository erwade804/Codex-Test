const { syncPackagesFromPi } = require("./packageService");

const syncPackagesTime = 60 * 1000;

function startPackageSyncCron() {
  const timer = setInterval(async () => {
    try {
      await syncPackagesFromPi();
      console.log("Package sync completed at " + new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Package sync failed at " + new Date().toLocaleTimeString(), error);
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
