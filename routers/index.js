const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

/**
 * @swagger
 * paths:
 *  /:
 *    get:
 *      summary: "랜딩페이지"
 *      description: "랜딩페이지"
 *      tags: [Index]
 *      responses:
 *        "200":
 *          description: 랜딩페이지 렌더링 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 */
router.get("/", indexController.indexView);

module.exports = router;
