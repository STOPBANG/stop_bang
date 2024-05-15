const express = require('express');
const router = express.Router();

//Controllers
const reviewController = require('../controllers/reviewController.js');

router.use((req, res, next) => {
	console.log('Router for review page was started');
	next();
});

/**
 * @swagger
 * paths:
 *  /review/{ra_regno}/create:
 *    post:
 *      parameters:
 *        - in: path
 *          name: ra_regno
 *          required: true
 *      summary: "후기 작성 페이지"
 *      description: "입주민이 (후기 작성하고 휴지 받기) 버튼 눌렀을 때"
 *      tags: [Review]
 *      responses:
 *        "200":
 *          description: 후기 작성 페이지 렌더링 성공
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
//(후기 작성하고 휴지 받기) 버튼 눌렀을 때
//후기 추가
router.post('/:ra_regno/create', reviewController.createReview);

/**
 * @swagger
 * paths:
 *  /review/{ra_regno}/create_process:
 *    post:
 *      parameters:
 *        - in: path
 *          name: ra_regno
 *          required: true
 *      summary: "입주민이 작성한 후기 저장"
 *      description: "입주민이 작성한 후기 DB에 저장"
 *      tags: [Review]
 *      responses:
 *        "200":
 *          description: 입주민이 작성한 후기 DB에 저장 성공
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
//후기 추가 DB 반영
router.post('/:sys_ra_regno/create_process', reviewController.creatingReview);

/**
 * @swagger
 * paths:
 *  /review/{rv_id}/update:
 *    get:
 *      parameters:
 *        - in: path
 *          name: rv_id
 *          required: true
 *      summary: "작성한 후기 수정"
 *      description: "로그인한 사용자가 작성한 후기 수정 페이지 렌더링"
 *      tags: [Review]
 *      responses:
 *        "200":
 *          description: 후기 수정 페이지 렌더링 성공
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
//후기 수정 버튼 눌렀을 때
router.get('/:rv_id/update', reviewController.updateReview);

/**
 * @swagger
 * paths:
 *  /review/{rv_id}/update_process:
 *    post:
 *      parameters:
 *        - in: path
 *          name: rv_id
 *          required: true
 *      summary: "작성한 후기 수정 사항 저장"
 *      description: "로그인한 사용자가 작성한 후기 수정 사항 DB에 반영"
 *      tags: [Review]
 *      responses:
 *        "200":
 *          description: 후기 수정 사항 DB에 반영 성공
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
//후기 수정 DB 반영
router.post('/:rv_id/update_process', reviewController.updatingReview);

module.exports = router;

/*삭제 보류
app.post('/review/:rv_id/delete_process', (req, res) => {
	let reviewId = req.params.rv_id;
	let rawQuery = `DELETE FROM review WHERE rv_id=?`;
	db.dbInfo.query(rawQuery, [reviewId], (err) => {
		res.redirect(`/${req.body.userName}/myReviews`);
	});
});
*/
