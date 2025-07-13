const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/", userController.createUser);

// Route: change avatar
router.put("/changeavt", userController.changeAvatar);

// Route: change password
router.put("/changepass", userController.changePassword);

module.exports = router;
