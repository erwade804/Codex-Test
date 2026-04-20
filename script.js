const STORAGE_KEY = "projectTrackerData";

const projectSelect = document.getElementById("projectSelect");
const projectNameInput = document.getElementById("projectName");
const projectDetailsInput = document.getElementById("projectDetails");
const projectMajorPointsInput = document.getElementById("projectMajorPoints");
const projectImageInput = document.getElementById("projectImage");
const imagePreview = document.getElementById("imagePreview");
const addProjectButton = document.getElementById("addProject");
const deleteProjectButton = document.getElementById("deleteProject");
const addMinorProjectButton = document.getElementById("addMinorProject");
const minorProjectList = document.getElementById("minorProjectList");

const state = loadState();

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const initialProject = createProject("Launch Website");
  return {
    projects: [initialProject],
    activeProjectId: initialProject.id,
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createProject(name = "New Project") {
  return {
    id: createId("project"),
    name,
    details: "",
    majorPoints: "",
    imageData: "",
    minorProjects: [],
  };
}

function createMinorProject() {
  return {
    id: createId("minor"),
    name: "",
    subtasks: [],
  };
}

function createSubtask() {
  return {
    id: createId("subtask"),
    name: "",
    description: "",
  };
}

function getActiveProject() {
  return state.projects.find((project) => project.id === state.activeProjectId);
}

function renderProjectSelect() {
  projectSelect.innerHTML = "";
  state.projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name || "Untitled Project";
    projectSelect.appendChild(option);
  });
  projectSelect.value = state.activeProjectId;
  deleteProjectButton.disabled = state.projects.length <= 1;
}

function renderProjectDetails() {
  const project = getActiveProject();
  if (!project) {
    return;
  }
  projectNameInput.value = project.name;
  projectDetailsInput.value = project.details;
  projectMajorPointsInput.value = project.majorPoints;

  if (project.imageData) {
    imagePreview.innerHTML = `<img src="${project.imageData}" alt="Project image" />`;
  } else {
    imagePreview.textContent = "No image uploaded.";
  }
}

function renderMinorProjects() {
  const project = getActiveProject();
  minorProjectList.innerHTML = "";

  if (!project || project.minorProjects.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No minor projects yet. Add one to start tracking tasks.";
    minorProjectList.appendChild(empty);
    return;
  }

  project.minorProjects.forEach((minorProject) => {
    const card = document.createElement("div");
    card.className = "minor-project-card";
    card.dataset.minorId = minorProject.id;

    const header = document.createElement("div");
    header.className = "minor-project-header";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Minor project name";
    nameInput.value = minorProject.name;
    nameInput.dataset.action = "minor-name";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "danger";
    deleteButton.dataset.action = "delete-minor";

    header.appendChild(nameInput);
    header.appendChild(deleteButton);

    const subtaskList = document.createElement("div");
    subtaskList.className = "subtask-list";

    minorProject.subtasks.forEach((subtask) => {
      const item = document.createElement("div");
      item.className = "subtask-item";
      item.dataset.subtaskId = subtask.id;

      const subtaskName = document.createElement("input");
      subtaskName.type = "text";
      subtaskName.placeholder = "Subtask name";
      subtaskName.value = subtask.name;
      subtaskName.dataset.action = "subtask-name";

      const subtaskDescription = document.createElement("textarea");
      subtaskDescription.placeholder = "Optional description";
      subtaskDescription.value = subtask.description;
      subtaskDescription.dataset.action = "subtask-description";

      const deleteSubtaskButton = document.createElement("button");
      deleteSubtaskButton.type = "button";
      deleteSubtaskButton.textContent = "Delete";
      deleteSubtaskButton.className = "danger";
      deleteSubtaskButton.dataset.action = "delete-subtask";

      item.appendChild(subtaskName);
      item.appendChild(subtaskDescription);
      item.appendChild(deleteSubtaskButton);

      subtaskList.appendChild(item);
    });

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const addSubtaskButton = document.createElement("button");
    addSubtaskButton.type = "button";
    addSubtaskButton.textContent = "Add Subtask";
    addSubtaskButton.className = "secondary";
    addSubtaskButton.dataset.action = "add-subtask";

    actions.appendChild(addSubtaskButton);

    card.appendChild(header);
    card.appendChild(subtaskList);
    card.appendChild(actions);

    minorProjectList.appendChild(card);
  });
}

function renderAll() {
  renderProjectSelect();
  renderProjectDetails();
  renderMinorProjects();
}

function updateProject(updater) {
  const project = getActiveProject();
  if (!project) {
    return;
  }
  updater(project);
  saveState();
}

projectSelect.addEventListener("change", (event) => {
  state.activeProjectId = event.target.value;
  saveState();
  renderAll();
});

projectNameInput.addEventListener("input", (event) => {
  updateProject((project) => {
    project.name = event.target.value;
  });
  renderProjectSelect();
});

projectDetailsInput.addEventListener("input", (event) => {
  updateProject((project) => {
    project.details = event.target.value;
  });
});

projectMajorPointsInput.addEventListener("input", (event) => {
  updateProject((project) => {
    project.majorPoints = event.target.value;
  });
});

projectImageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    updateProject((project) => {
      project.imageData = reader.result;
    });
    renderProjectDetails();
  };
  reader.readAsDataURL(file);
});

addProjectButton.addEventListener("click", () => {
  const newProject = createProject("New Project");
  state.projects.push(newProject);
  state.activeProjectId = newProject.id;
  saveState();
  renderAll();
});

deleteProjectButton.addEventListener("click", () => {
  const index = state.projects.findIndex(
    (project) => project.id === state.activeProjectId
  );
  if (index === -1 || state.projects.length <= 1) {
    return;
  }
  state.projects.splice(index, 1);
  state.activeProjectId = state.projects[0].id;
  saveState();
  renderAll();
});

addMinorProjectButton.addEventListener("click", () => {
  updateProject((project) => {
    project.minorProjects.push(createMinorProject());
  });
  renderMinorProjects();
});

minorProjectList.addEventListener("input", (event) => {
  const target = event.target;
  const card = target.closest(".minor-project-card");
  if (!card) {
    return;
  }
  const minorId = card.dataset.minorId;
  updateProject((project) => {
    const minor = project.minorProjects.find((item) => item.id === minorId);
    if (!minor) {
      return;
    }
    if (target.dataset.action === "minor-name") {
      minor.name = target.value;
      return;
    }
    const subtaskItem = target.closest(".subtask-item");
    if (!subtaskItem) {
      return;
    }
    const subtaskId = subtaskItem.dataset.subtaskId;
    const subtask = minor.subtasks.find((item) => item.id === subtaskId);
    if (!subtask) {
      return;
    }
    if (target.dataset.action === "subtask-name") {
      subtask.name = target.value;
    }
    if (target.dataset.action === "subtask-description") {
      subtask.description = target.value;
    }
  });
});

minorProjectList.addEventListener("click", (event) => {
  const target = event.target;
  const card = target.closest(".minor-project-card");
  if (!card) {
    return;
  }
  const minorId = card.dataset.minorId;

  if (target.dataset.action === "delete-minor") {
    updateProject((project) => {
      project.minorProjects = project.minorProjects.filter(
        (item) => item.id !== minorId
      );
    });
    renderMinorProjects();
    return;
  }

  if (target.dataset.action === "add-subtask") {
    updateProject((project) => {
      const minor = project.minorProjects.find((item) => item.id === minorId);
      if (minor) {
        minor.subtasks.push(createSubtask());
      }
    });
    renderMinorProjects();
    return;
  }

  if (target.dataset.action === "delete-subtask") {
    const subtaskItem = target.closest(".subtask-item");
    if (!subtaskItem) {
      return;
    }
    const subtaskId = subtaskItem.dataset.subtaskId;
    updateProject((project) => {
      const minor = project.minorProjects.find((item) => item.id === minorId);
      if (!minor) {
        return;
      }
      minor.subtasks = minor.subtasks.filter((item) => item.id !== subtaskId);
    });
    renderMinorProjects();
  }
});

renderAll();
