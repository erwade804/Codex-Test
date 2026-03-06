const logsTableBody = document.querySelector("#requestLogsBody");
const emptyState = document.querySelector("#requestLogsEmptyState");
const ipFilterInput = document.querySelector("#ipFilterInput");
const pathFilterInput = document.querySelector("#pathFilterInput");
const timeFilterInput = document.querySelector("#timeFilterInput");

let logs = [];

function matchesFilter(value, query) {
  if (!query) {
    return true;
  }

  return String(value).toLowerCase().includes(query.toLowerCase());
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
