const { Router } = require("express");

const router = Router();

router.get("/health-check", (req, res) => {
	return res.status(200).json("OK");
});

module.exports = router;
