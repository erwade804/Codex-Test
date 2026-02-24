const scaffoldService = require("../services/scaffoldService");

function createEndpointScaffold(payload) {
  const { resource, dryRun } = payload || {};
  return scaffoldService.scaffoldEndpoint({ resource, dryRun: Boolean(dryRun) });
}

module.exports = {
  createEndpointScaffold
};
