const categoryService = require("../services/categoryService");

function listCategories() {
  return {
    status: 200,
    body: {
      data: categoryService.getAllCategories()
    }
  };
}

function getCategory(categoryId) {
  const category = categoryService.getCategoryById(categoryId);

  if (!category) {
    return {
      status: 404,
      body: {
        error: `Category '${categoryId}' was not found.`
      }
    };
  }

  return {
    status: 200,
    body: { data: category }
  };
}

function createCategory(payload) {
  const { id, title, description, links } = payload || {};

  if (!id || !title || !description) {
    return {
      status: 400,
      body: {
        error: "id, title, and description are required fields."
      }
    };
  }

  if (categoryService.getCategoryById(id)) {
    return {
      status: 409,
      body: {
        error: `A category with id '${id}' already exists.`
      }
    };
  }

  return {
    status: 201,
    body: {
      data: categoryService.createCategory({ id, title, description, links })
    }
  };
}

module.exports = {
  listCategories,
  getCategory,
  createCategory
};
