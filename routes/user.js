const express = require("express");
const { register, login, activateAccount } = require("../controllers/user");

const router = express.Router();

router.post("/register", register);
router.post("/activate", activateAccount);
router.post("/login", login);

module.exports = router;
