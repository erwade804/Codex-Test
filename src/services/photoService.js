const fs = require("node:fs/promises");
const path = require("node:path");

const PHOTOS_DIR = path.join(__dirname, "..", "..", "public", "photos");
const ALLOWED_IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

async function listPhotos() {
  let entries;

  try {
    entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      name: entry.name,
      extension: path.extname(entry.name).toLowerCase()
    }))
    .filter((entry) => ALLOWED_IMAGE_EXTENSIONS.has(entry.extension))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }))
    .map((entry) => ({
      name: entry.name,
      url: `/photos/${encodeURIComponent(entry.name)}`
    }));
}

module.exports = {
  PHOTOS_DIR,
  listPhotos
};
