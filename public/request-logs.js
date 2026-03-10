const logsTableBody = document.querySelector("#requestLogsBody");
const emptyState = document.querySelector("#requestLogsEmptyState");
const ipFilterInput = document.querySelector("#ipFilterInput");
const pathFilterInput = document.querySelector("#pathFilterInput");
const timeFilterInput = document.querySelector("#timeFilterInput");
const ipList = document.querySelector("#ipList");
const ipListEmptyState = document.querySelector("#ipListEmptyState");

let logs = [];

function matchesFilter(value, query) {
  if (!query) {
    return true;
  }

  return String(value).toLowerCase().includes(query.toLowerCase());
}

function renderIpList() {
  const uniqueIps = [...new Set(logs.map((entry) => entry.ip))].sort((a, b) => a.localeCompare(b));

  ipList.textContent = "";

  if (uniqueIps.length === 0) {
    ipListEmptyState.hidden = false;
    return;
  }

  ipListEmptyState.hidden = true;

  uniqueIps.forEach((ip) => {
    const listItem = document.createElement("li");
    const ipButton = document.createElement("button");

    ipButton.type = "button";
    ipButton.className = "ip-pill";
    ipButton.textContent = ip;
    ipButton.addEventListener("click", () => {
      ipFilterInput.value = ip;
      renderLogs();
    });

    listItem.append(ipButton);
    ipList.append(listItem);
  });
}

function renderLogs() {
  const ipQuery = ipFilterInput.value.trim();
  const pathQuery = pathFilterInput.value.trim();
  const timeQuery = timeFilterInput.value.trim();

  const filteredLogs = logs.filter((entry) => (
    matchesFilter(entry.ip, ipQuery)
    && matchesFilter(entry.path, pathQuery)
    && matchesFilter(entry.timestamp, timeQuery)
  ));

  logsTableBody.textContent = "";

  if (filteredLogs.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filteredLogs.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${entry.ip}</td><td>${entry.timestamp}</td><td>${entry.path}</td>`;
    logsTableBody.append(row);
  });
}

async function loadLogs() {
  const response = await fetch("/api/v1/request-logs");
  if (!response.ok) {
    throw new Error("Could not load request logs");
  }

  const payload = await response.json();
  logs = payload.data;
  renderIpList();
  renderLogs();
}

[ipFilterInput, pathFilterInput, timeFilterInput].forEach((input) => {
  input.addEventListener("input", renderLogs);
});

loadLogs().catch(() => {
  logsTableBody.textContent = "";
  emptyState.hidden = false;
  emptyState.textContent = "Could not load request logs. Please check server status.";
});
