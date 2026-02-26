const STORAGE_KEY = "computerProjectsDB";

let db = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    projectCounter: 1,
    issueCounter: 1,
    projects: []
};

let activeProjectId = null;
let activeComputerId = null;

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function createProject(name = "New Project") {
    const project = {
        id: db.projectCounter++,
        name,
        description: "",
        issues: [],
        computers: []
    };
    db.projects.push(project);
    save();
    return project;
}

function getActiveProject() {
    return db.projects.find(p => p.id === activeProjectId);
}

function getActiveComputer() {
    const project = getActiveProject();
    if (!project) return null;
    return project.computers.find(c => c.id === activeComputerId);
}

/* ---------- UI Rendering ---------- */

function renderProjects() {
    const tabs = document.getElementById("projectTabs");
    tabs.innerHTML = "";
    db.projects.forEach(p => {
        const btn = document.createElement("button");
        btn.textContent = p.name;
        if (p.id === activeProjectId) btn.classList.add("active");
        btn.onclick = () => {
            activeProjectId = p.id;
            activeComputerId = null;
            render();
        };
        tabs.appendChild(btn);
    });
}

function renderProjectPanel() {
    const project = getActiveProject();
    if (!project) return;

    document.getElementById("projectTitle").textContent = project.name;
    const desc = document.getElementById("projectDescription");
    desc.value = project.description;
    desc.oninput = () => {
        project.description = desc.value;
        save();
    };

    const issuesDiv = document.getElementById("projectIssues");
    issuesDiv.innerHTML = "";
    project.issues.forEach(issue => {
        const div = document.createElement("div");
        div.className = "issue";
        div.innerHTML = `
      <span>${issue.name}</span>
      <button>✖</button>
    `;
        div.querySelector("button").onclick = () => {
            project.issues = project.issues.filter(i => i.id !== issue.id);
            project.computers.forEach(c => delete c.checklist[issue.id]);
            save();
            render();
        };
        issuesDiv.appendChild(div);
    });
}

function renderComputerList() {
    const list = document.getElementById("computerList");
    list.innerHTML = "";
    const project = getActiveProject();
    if (!project) return;

    project.computers.forEach(c => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.justifyContent = "space-between";
        row.style.gap = "8px";

        const label = document.createElement("span");
        label.textContent = c.number;
        label.style.flex = "1";
        label.style.cursor = "pointer";

        if (c.id === activeComputerId) row.classList.add("active");

        label.onclick = () => {
            activeComputerId = c.id;
            render();
        };

        const del = document.createElement("button");
        del.textContent = "✖";
        del.style.background = "transparent";
        del.style.color = "inherit";
        del.onclick = (e) => {
            e.stopPropagation();

            project.computers = project.computers.filter(x => x.id !== c.id);

            if (activeComputerId === c.id) {
                activeComputerId = null;
            }

            save();
            render();
        };

        row.appendChild(label);
        row.appendChild(del);
        list.appendChild(row);
    });
}


function renderComputerPanel() {
    const project = getActiveProject();
    const computer = getActiveComputer();
    const issuesDiv = document.getElementById("computerIssues");
    issuesDiv.innerHTML = "";

    if (!computer || !project) return;

    project.issues.forEach(issue => {
        if (computer.removedIssues?.includes(issue.id)) return;

        const checked = computer.checklist[issue.id] || false;
        const div = document.createElement("div");
        div.className = "issue";
        div.innerHTML = `
      <input type="checkbox" ${checked ? "checked" : ""}>
      <span>${issue.name}</span>
      <button>–</button>
    `;
        div.querySelector("input").onchange = e => {
            computer.checklist[issue.id] = e.target.checked;
            save();
        };
        div.querySelector("button").onclick = () => {
            computer.removedIssues.push(issue.id);
            delete computer.checklist[issue.id];
            save();
            render();
        };
        issuesDiv.appendChild(div);
    });
}

/* ---------- Actions ---------- */

document.getElementById("addProjectBtn").onclick = () => {
    const p = createProject();
    activeProjectId = p.id;
    render();
};

document.getElementById("addProjectIssue").onclick = () => {
    const input = document.getElementById("newProjectIssue");
    const name = input.value.trim();
    if (!name) return;

    const project = getActiveProject();
    const issue = { id: db.issueCounter++, name };
    project.issues.push(issue);

    project.computers.forEach(c => {
        if (!c.removedIssues.includes(issue.id)) {
            c.checklist[issue.id] = false;
        }
    });

    input.value = "";
    save();
    render();
};

document.getElementById("addComputer").onclick = () => {
    const input = document.getElementById("newComputerId");
    const num = input.value.trim();

    if (!/^\d{4,8}$/.test(num)) return alert("Computer number must be 4–8 digits.");

    const project = getActiveProject();
    if (project.computers.some(c => c.number === num)) {
        return alert("Duplicate computer number.");
    }

    const computer = {
        id: Date.now() + Math.random(),
        number: num,
        checklist: {},
        removedIssues: []
    };

    project.issues.forEach(i => computer.checklist[i.id] = false);

    project.computers.push(computer);
    input.value = "";
    save();
    render();
};

document.getElementById("addComputerIssue").onclick = () => {
    const input = document.getElementById("newComputerIssue");
    const name = input.value.trim();
    if (!name) return;

    const project = getActiveProject();
    const computer = getActiveComputer();

    const issue = { id: db.issueCounter++, name };
    project.issues.push(issue);
    computer.checklist[issue.id] = false;

    input.value = "";
    save();
    render();
};

document.getElementById("copyComputers").onclick = () => {
    const project = getActiveProject();
    const text = project.computers.map(c => c.number).join(", ");
    navigator.clipboard.writeText(text);
};

document.getElementById("exportProject").onclick = () => {
    const project = getActiveProject();
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name}.json`;
    a.click();
};

document.getElementById("importProject").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const project = JSON.parse(reader.result);
        project.id = db.projectCounter++;
        db.projects.push(project);
        save();
        render();
    };
    reader.readAsText(file);
};

document.getElementById("deleteProject").onclick = () => {
    const project = getActiveProject();
    if (!project) return;

    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;

    db.projects = db.projects.filter(p => p.id !== project.id);

    if (db.projects.length === 0) {
        const p = createProject("New Project");
        activeProjectId = p.id;
        activeComputerId = null;
    } else {
        activeProjectId = db.projects[0].id;
        activeComputerId = null;
    }

    save();
    render();
};


/* ---------- Init ---------- */

if (db.projects.length === 0) {
    const p = createProject("Example Project");
    activeProjectId = p.id;
} else {
    activeProjectId = db.projects[0].id;
}

function render() {
    renderProjects();
    renderProjectPanel();
    renderComputerList();
    renderComputerPanel();
}

render();
