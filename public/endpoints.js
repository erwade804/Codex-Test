const endpointDefinitions = [
  {
    name: "Health Check",
    method: "GET",
    path: "/api/health",
    description: "Quickly confirms whether the backend is alive.",
    exampleInput: { query: {}, body: null }
  },
  {
    name: "List Categories",
    method: "GET",
    path: "/api/v1/categories",
    description: "Returns all categories and links used by the dashboard.",
    exampleInput: { query: {}, body: null }
  },
  {
    name: "Get Category by ID",
    method: "GET",
    path: "/api/v1/categories/core-daily-tools",
    description: "Gets one category by id (replace the sample id as needed).",
    exampleInput: { query: {}, body: null }
  },
  {
    name: "Create Category",
    method: "POST",
    path: "/api/v1/categories",
    description: "Creates a new category in the in-memory store.",
    exampleInput: {
      query: {},
      body: {
        id: "network-infrastructure",
        title: "Network + Infrastructure",
        description: "Switches, APs, firewall, monitoring",
        links: []
      }
    }
  },
  {
    name: "Scaffold Route + Controller",
    method: "POST",
    path: "/api/v1/scaffold/endpoint",
    description: "Generates route/controller boilerplate for a new resource.",
    exampleInput: {
      query: {},
      body: {
        resource: "device-checkout",
        dryRun: true
      }
    }
  }
];

const endpointGrid = document.querySelector("#endpointGrid");
const endpointTemplate = document.querySelector("#endpointTemplate");

function asPrettyJson(value) {
  return JSON.stringify(value, null, 2);
}

async function runEndpoint(endpoint, outputNode, buttonNode) {
  buttonNode.disabled = true;
  buttonNode.textContent = "Running...";

  try {
    const options = {
      method: endpoint.method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (endpoint.method !== "GET" && endpoint.exampleInput.body) {
      options.body = JSON.stringify(endpoint.exampleInput.body);
    }

    const response = await fetch(endpoint.path, options);
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};

    outputNode.textContent = asPrettyJson({
      status: response.status,
      statusText: response.statusText,
      body: parsed
    });
  } catch (error) {
    outputNode.textContent = asPrettyJson({
      error: "Request failed",
      details: error.message
    });
  } finally {
    buttonNode.disabled = false;
    buttonNode.textContent = "Run endpoint";
  }
}

function renderEndpoints() {
  endpointDefinitions.forEach((endpoint) => {
    const node = endpointTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".endpoint-title").textContent = endpoint.name;
    node.querySelector(".endpoint-method").textContent = endpoint.method;
    node.querySelector(".endpoint-path").textContent = endpoint.path;
    node.querySelector(".endpoint-description").textContent = endpoint.description;
    node.querySelector(".endpoint-code").textContent = asPrettyJson(endpoint.exampleInput);

    const outputNode = node.querySelector(".endpoint-output");
    const runButton = node.querySelector(".endpoint-run-btn");

    runButton.addEventListener("click", () => {
      runEndpoint(endpoint, outputNode, runButton);
    });

    endpointGrid.append(node);
  });
}

renderEndpoints();
