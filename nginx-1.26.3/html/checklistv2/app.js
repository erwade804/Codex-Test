document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       DOM REFERENCES
    ========================= */
    const STORAGE_KEY = "computer-tracker";

    const list = document.getElementById("computerList");
    const template = document.getElementById("computerTemplate");
    const addBtn = document.getElementById("addComputerBtn");
    const copyBtn = document.getElementById("copyNamesBtn");
    const exportBtn = document.getElementById("exportJsonBtn");
    const importInput = document.getElementById("importJsonInput");
    const unitIndex = document.getElementById("unitIndex");

    if (!list || !template || !addBtn) {
        throw new Error("Critical DOM elements missing. Check index.html IDs.");
    }

    /* =========================
       STATE
    ========================= */
    let computers = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    /* =========================
       UUID (SAFE FALLBACK)
    ========================= */
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /* =========================
       PERSISTENCE
    ========================= */
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(computers));
    }

    /* =========================
       CHECKLIST RENDERER
    ========================= */
    function renderChecklist(container, computer) {
        const listEl = container.querySelector(".checklist-items");
        const input = container.querySelector(".new-task");
        const count = container.querySelector(".count");

        listEl.innerHTML = "";
        count.textContent = `${computer.checklist.filter(t => !t.done).length} ACTIVE`;

        computer.checklist.forEach(task => {
            const li = document.createElement("li");
            li.className = "checklist-item" + (task.done ? " done" : "");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.done;

            const text = document.createElement("span");
            text.className = "text";
            text.textContent = task.text;
            text.contentEditable = true;

            const del = document.createElement("button");
            del.textContent = "X";

            checkbox.onchange = () => {
                task.done = checkbox.checked;
                li.classList.toggle("done", task.done);
                count.textContent = `${computer.checklist.filter(t => !t.done).length} ACTIVE`;
                save();
            };

            text.onblur = () => {
                const val = text.textContent.trim();
                if (val) {
                    task.text = val;
                    save();
                } else {
                    text.textContent = task.text;
                }
            };

            text.onkeydown = e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    text.blur();
                }
                if (e.key === "Escape") {
                    text.textContent = task.text;
                    text.blur();
                }
            };

            del.onclick = () => {
                computer.checklist = computer.checklist.filter(t => t.id !== task.id);
                save();
                renderChecklist(container, computer);
            };

            li.append(checkbox, text, del);
            listEl.appendChild(li);
        });

        input.onkeydown = e => {
            if (e.key === "Enter" && input.value.trim()) {
                computer.checklist.push({
                    id: uuid(),
                    text: input.value.trim(),
                    done: false
                });
                input.value = "";
                save();
                renderChecklist(container, computer);
            }
        };
    }

    /* =========================
       MAIN RENDERER
    ========================= */
    function render() {
        list.innerHTML = "";
        unitIndex.innerHTML = "";

        computers.forEach((computer, index) => {
            const node = template.content.cloneNode(true);
            const card = node.querySelector(".computer-card");

            const name = node.querySelector(".computer-name");
            const state = node.querySelector(".computer-state");
            const issues = node.querySelector(".computer-issues");
            const delBtn = node.querySelector(".delete");

            name.value = computer.name;
            state.value = computer.state;
            issues.value = computer.issues;

            /* --- Sidebar entry --- */
            const li = document.createElement("li");
            li.textContent = computer.name || "UNNAMED UNIT";

            li.onclick = () => {
                document.querySelectorAll(".computer-card").forEach(c => c.classList.remove("active"));
                document.querySelectorAll(".sidebar li").forEach(i => i.classList.remove("active"));

                card.classList.add("active");
                li.classList.add("active");

                card.scrollIntoView({ behavior: "smooth", block: "center" });
            };

            unitIndex.appendChild(li);

            /* --- Input bindings --- */
            name.oninput = e => {
                computer.name = e.target.value;
                save();
                render(); // keeps sidebar names synced
            };

            state.onchange = e => {
                computer.state = e.target.value;
                save();
            };

            issues.oninput = e => {
                computer.issues = e.target.value;
                save();
            };

            delBtn.onclick = () => {
                computers.splice(index, 1);
                save();
                render();
            };

            /* --- Checklist --- */
            renderChecklist(node.querySelector(".checklist"), computer);

            list.appendChild(node);
        });
    }

    /* =========================
       HEADER ACTIONS
    ========================= */

    // Copy names to clipboard
    copyBtn.onclick = () => {
        const names = computers
            .map(c => c.name)
            .filter(Boolean)
            .join("\n");

        navigator.clipboard.writeText(names);
    };

    // Export JSON
    exportBtn.onclick = () => {
        const blob = new Blob(
            [JSON.stringify(computers, null, 2)],
            { type: "application/json" }
        );

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "computer-tracker-backup.json";
        a.click();
    };

    // Import JSON
    importInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                computers = JSON.parse(reader.result);
                save();
                render();
            } catch {
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    /* =========================
       ADD NEW COMPUTER
    ========================= */
    addBtn.onclick = () => {
        computers.push({
            id: uuid(),
            name: "",
            state: "Todo",
            issues: "",
            checklist: []
        });
        save();
        render();
    };

    /* =========================
       BOOT
    ========================= */
    render();

    /* =========================
        Starfield Generator
    ========================= */
    const starfield = document.querySelector(".starfield");

    function spawnStar() {
        if (!starfield) return;

        const star = document.createElement("div");
        star.className = "star";

        const glint = document.createElement("span");
        star.appendChild(glint);


        const size = Math.random() * 3 + 5; // 5–8px
        const duration = Math.random() * 4 + 5; // 5–9s
        const glintDelay = Math.random() * (duration * 0.6);

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${duration}s`;

        star.style.setProperty(
            "--glint-delay",
            `${glintDelay}s`
        );

        starfield.appendChild(star);

        setTimeout(() => {
            star.remove();
        }, duration * 1000);
    }



    // Spawn stars at random intervals
    setInterval(() => {
        const count = Math.floor(Math.random() * 3) + 1; // 1–3 stars
        for (let i = 0; i < count; i++) {
            spawnStar();
        }
    }, 700);


});
