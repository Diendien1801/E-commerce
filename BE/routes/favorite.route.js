const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const auth = require("../middleware/auth");

router.post(
  "/toggle",
  auth,
  favoriteController.toggleFavorite
);

router.get("/", auth, favoriteController.getFavorites);

router.delete(
  "/:productId",
  auth,
  favoriteController.removeFavorite
);

module.exports = router;