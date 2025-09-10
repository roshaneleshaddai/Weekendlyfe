const express = require("express");
const { getThemes, getVibes } = require("../controllers/themeController");

const router = express.Router();

router.get("/", getThemes);
router.get("/vibes", getVibes);

module.exports = router;
