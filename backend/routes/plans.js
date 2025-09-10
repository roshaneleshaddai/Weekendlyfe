const express = require("express");
const {
  getPlan,
  createPlan,
  deletePlanItem,
  exportPlan,
} = require("../controllers/planController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// All plan routes require authentication
router.use(authRequired);

router.get("/", getPlan);
router.post("/", createPlan);
router.delete("/:id", deletePlanItem);
router.get("/export", exportPlan);

module.exports = router;
