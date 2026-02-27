const photoService = require("../services/photoService");

async function listPhotos() {
  const photos = await photoService.listPhotos();

  return {
    status: 200,
    body: {
      data: photos
    }
  };
}

module.exports = {
  listPhotos
};
