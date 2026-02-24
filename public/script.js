const dashboard = document.querySelector("#dashboard");
const searchInput = document.querySelector("#searchInput");
const categoryTemplate = document.querySelector("#categoryTemplate");
const linkTemplate = document.querySelector("#linkTemplate");

let categories = [];

function matchesQuery(item, query) {
  const haystack = `${item.name} ${item.meta}`.toLowerCase();
  return haystack.includes(query);
}

function render(query = "") {
  dashboard.textContent = "";

  const normalized = query.trim().toLowerCase();

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      links:
        normalized.length === 0
          ? category.links
          : category.links.filter((item) => matchesQuery(item, normalized))
    }))
    .filter((category) => category.links.length > 0);

  if (filteredCategories.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No links matched that search. Try another keyword.";
    dashboard.append(empty);
    return;
  }

  filteredCategories.forEach((category) => {
    const categoryNode = categoryTemplate.content.firstElementChild.cloneNode(true);
    categoryNode.querySelector(".category-title").textContent = category.title;
    categoryNode.querySelector(".category-description").textContent = category.description;

    const linksGrid = categoryNode.querySelector(".links-grid");

    category.links.forEach((link) => {
      const linkNode = linkTemplate.content.firstElementChild.cloneNode(true);
      linkNode.href = link.url;
      linkNode.querySelector(".link-name").textContent = link.name;
      linkNode.querySelector(".link-meta").textContent = link.meta;
      linksGrid.append(linkNode);
    });

    dashboard.append(categoryNode);
  });
}

async function loadCategories() {
  const response = await fetch("/api/v1/categories");
  if (!response.ok) {
    throw new Error("Unable to load categories");
  }

  const payload = await response.json();
  categories = payload.data;
  render();
}

searchInput.addEventListener("input", (event) => {
  render(event.target.value);
});

loadCategories().catch(() => {
  dashboard.textContent = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "Could not load links from API. Please check server status.";
  dashboard.append(empty);
});
