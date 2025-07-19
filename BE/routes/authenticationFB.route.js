const express = require("express");
const router = express.Router();
const authFBController = require("../controllers/authenticationFB.controller");

router.post("/auth/facebook", authFBController.facebookLogin);

module.exports = router;
