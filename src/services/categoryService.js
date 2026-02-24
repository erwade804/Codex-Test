const { categories } = require("../data/linkStore");

function getAllCategories() {
  return categories;
}

function getCategoryById(categoryId) {
  return categories.find((category) => category.id === categoryId) || null;
}

function createCategory(payload) {
  const category = {
    id: payload.id,
    title: payload.title,
    description: payload.description,
    links: payload.links || []
  };

  categories.push(category);
  return category;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory
};
