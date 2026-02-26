const categoryController = require("../controllers/categoryController");
const scaffoldController = require("../controllers/scaffoldController");
const packageController = require("../controllers/packageController");

async function routeApi({ method, pathname, body }) {
  if (method === "GET" && pathname === "/api/health") {
    return { status: 200, body: { status: "ok" } };
  }

  if (method === "GET" && pathname === "/api/v1/categories") {
    return categoryController.listCategories();
  }

  if (method === "POST" && pathname === "/api/v1/categories") {
    return categoryController.createCategory(body);
  }

  if (method === "GET" && pathname.startsWith("/api/v1/categories/")) {
    const categoryId = pathname.split("/").pop();
    return categoryController.getCategory(categoryId);
  }

  if (method === "POST" && pathname === "/api/v1/scaffold/endpoint") {
    return scaffoldController.createEndpointScaffold(body);
  }

  if (method === "GET" && pathname === "/api/v1/packages") {
    return packageController.getPackages();
  }

  if (method === "POST" && pathname === "/api/v1/packages/sync") {
    return packageController.syncPackages();
  }

  return null;
}

module.exports = {
  routeApi
};
