const express = require("express");
const router = express.Router();

//Controllers
const realtorController = require("../controllers/realtorController.js");

router.use((req, res, next) => {
  console.log("Router for realtor page was started");
  next();
});

/* 부동산 홈페이지 관련 */

/**
 * @swagger
 * paths:
 *  /realtor/{ra_regno}:
 *    get:
 *      parameters:
 *        - in: path
 *          name: ra_regno
 *          required: true
 *      summary: "입주민이 보는 공인중개사 홈페이지"
 *      description: "입주민이 보는 공인중개사 홈페이지 렌더링"
 *      tags: [Realtor]
 *      responses:
 *        "200":
 *          description: 입주민이 보는 공인중개사 홈페이지 렌더링 성공
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
//입주민이 보는 공인중개사 홈페이지
router.get(
  "/:sys_regno",
  realtorController.mainPage,
);
/**
 * @swagger
 * paths:
 *  /realtor/{ra_regno}/bookmark:
 *    post:
 *      parameters:
 *        - in: path
 *          name: ra_regno
 *          required: true
 *      summary: "입주민이 부동산 북마크"
 *      description: "입주민이 부동산 북마크"
 *      tags: [Realtor]
 *      responses:
 *        "200":
 *          description: 입주민이 부동산 북마크 성공
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
router.post("/:sys_regno/bookmark", realtorController.updateBookmark);

/**
 * @swagger
 * paths:
 *  /realtor/{ra_regno}/opening/{rv_id}:
 *    post:
 *      parameters:
 *        - in: path
 *          name: ra_regno
 *          required: true
 *        - in: path
 *          name: rv_id
 *          required: true
 *      summary: "입주민이 후기 열람"
 *      description: "입주민이 rv_id에 해당하는 후기 열람"
 *      tags: [Realtor]
 *      responses:
 *        "200":
 *          description: 입주민이 후기 열람 성공
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
//후기를 열람할 때
router.post("/:sys_regno/opening/:rv_id", realtorController.opening);

/**
 * @swagger
 * paths:
 *  /realtor/report/{rv_id}:
 *    get:
 *      parameters:
 *        - in: path
 *          name: rv_id
 *          required: true
 *      summary: "후기 신고"
 *      description: "rv_id에 해당하는 후기 신고"
 *      tags: [Realtor]
 *      responses:
 *        "200":
 *          description: 후기 신고 성공
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
//후기 신고
router.get("/report/:rv_id", realtorController.reporting);

module.exports = router;
