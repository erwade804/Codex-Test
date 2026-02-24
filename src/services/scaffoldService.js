const fs = require("node:fs");
const path = require("node:path");

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toCamelCase(value) {
  return value
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^(.)/, (first) => first.toLowerCase());
}

function toPascalCase(value) {
  const camel = toCamelCase(value);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function validateResourceName(resource) {
  return typeof resource === "string" && /^[a-zA-Z][a-zA-Z0-9-_\s]*$/.test(resource.trim());
}

function generateControllerTemplate(resourceName) {
  const entityName = toCamelCase(resourceName);
  const listFn = `list${toPascalCase(resourceName)}`;

  return `function ${listFn}() {\n  return {\n    status: 200,\n    body: {\n      message: \"TODO: implement ${entityName} list endpoint\"\n    }\n  };\n}\n\nmodule.exports = {\n  ${listFn}\n};\n`;
}

function generateRouteTemplate(resourceName) {
  const entityName = toCamelCase(resourceName);
  const listFn = `list${toPascalCase(resourceName)}`;

  return `const ${entityName}Controller = require("../../controllers/${entityName}Controller");\n\nfunction register${toPascalCase(resourceName)}Routes(routeApi) {\n  if (routeApi.method === \"GET\" && routeApi.pathname === \"/api/v1/${toKebabCase(resourceName)}\") {\n    return ${entityName}Controller.${listFn}();\n  }\n\n  return null;\n}\n\nmodule.exports = {\n  register${toPascalCase(resourceName)}Routes\n};\n`;
}

function scaffoldEndpoint({ resource, dryRun = false, rootDir = process.cwd() }) {
  if (!validateResourceName(resource)) {
    return {
      status: 400,
      body: {
        error: "Invalid resource name. Use letters, numbers, spaces, hyphens, or underscores; start with a letter."
      }
    };
  }

  const safeName = resource.trim();
  const baseName = toCamelCase(safeName);
  const controllerFile = path.join(rootDir, "src", "controllers", `${baseName}Controller.js`);
  const routeFile = path.join(rootDir, "src", "routes", "v1", `${baseName}Routes.js`);

  if (fs.existsSync(controllerFile) || fs.existsSync(routeFile)) {
    return {
      status: 409,
      body: {
        error: "Scaffold target already exists.",
        files: {
          controllerFile,
          routeFile
        }
      }
    };
  }

  const controllerTemplate = generateControllerTemplate(safeName);
  const routeTemplate = generateRouteTemplate(safeName);

  if (!dryRun) {
    fs.mkdirSync(path.dirname(controllerFile), { recursive: true });
    fs.mkdirSync(path.dirname(routeFile), { recursive: true });
    fs.writeFileSync(controllerFile, controllerTemplate, "utf8");
    fs.writeFileSync(routeFile, routeTemplate, "utf8");
  }

  return {
    status: 201,
    body: {
      message: dryRun ? "Dry run successful. No files were written." : "Scaffold created successfully.",
      dryRun,
      resource: {
        raw: safeName,
        kebabCase: toKebabCase(safeName),
        camelCase: baseName
      },
      files: {
        controllerFile,
        routeFile
      },
      nextSteps: [
        `Require ./v1/${baseName}Routes in src/routes/index.js`,
        `Call register${toPascalCase(safeName)}Routes(routeApi) inside routeApi()`
      ]
    }
  };
}

module.exports = {
  scaffoldEndpoint,
  toCamelCase,
  toKebabCase,
  toPascalCase
};
