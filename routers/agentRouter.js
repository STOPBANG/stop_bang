const express = require("express");
const router = express.Router();

//Controllers
const agentController = require("../controllers/agentController.js");

/**
 * @swagger
 * paths:
 *  /agent/phoneNumber:
 *    get:
 *      summary: "공인중개사 회원 가입 시 공공데이터의 전화번호 조회"
 *      description: "공인중개사 회원 가입 시 DB에 저장된 서울시 부동산 공공데이터 중 ra_regno에 해당하는 전화번호 조회"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 전화번호 조회 성공
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
// [msa] register
router.get("/phoneNumber", agentController.getAgentPhoneNumber);

/**
 * @swagger
 * paths:
 *  /agent/settings:
 *    get:
 *      summary: "공인중개사 회원 마이페이지"
 *      description: "공인중개사 회원 마이페이지 렌더링"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 공인중개사 회원 마이페이지 렌더링 성공
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
// [msa] agent_mypage
//agent 사용자 정보 확인용
router.get("/settings", agentController.settings);
/**
 * @swagger
 * paths:
 *  /agent/settings/update:
 *    post:
 *      summary: "공인중개사 회원 정보 수정"
 *      description: "공인중개사 회원 정보 수정 사항 저장"
 *      tags: [Agent]
 *      responses:
 *        "302":
 *          description: 공인중개사 회원 정보 수정 사항 저장 성공
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
// [msa] agent_mypage
router.post(
  "/settings/update",
  agentController.updateSettings,
);
/**
 * @swagger
 * paths:
 *  /agent/settings/pwupdate:
 *    post:
 *      summary: "공인중개사 비밀번호 수정"
 *      description: "공인중개사 비밀번호 수정 사항 저장"
 *      tags: [Agent]
 *      responses:
 *        "302":
 *          description: 공인중개사 비밀번호 수정 사항 저장 성공
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
// [msa] agent_mypage
router.post(
  "/settings/pwupdate",
  agentController.updatePassword,
);
/**
 * @swagger
 * paths:
 *  /agent/{id}:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    get:
 *      summary: "부동산 홈페이지"
 *      description: "부동산 홈페이지 렌더링"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 부동산 홈페이지 렌더링 성공
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
// [msa] agent_page
//agent 홈 get
router.get(
  "/:ra_regno",
  agentController.agentProfile,
);

/**
 * @swagger
 * paths:
 *  /agent/{ra_regno}/update:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    get:
 *      summary: "부동산 홈페이지 영업시간, 프로필 사진 수정 페이지"
 *      description: "부동산 홈페이지 영업시간, 프로필 사진페이지 렌더링"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 부동산 홈페이지 영업시간, 프로필 사진 수정 페이지 렌더링 성공
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
// [msa] updateAgentInfo 페이지 랜더링
router.get("/:ra_regno/update", agentController.updateEnteredInfo);

/**
 * @swagger
 * paths:
 *  /agent/{ra_regno}/update_process:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    post:
 *      summary: "부동산 홈페이지 영업시간, 프로필 사진 수정 사항 저장"
 *      description: "부동산 홈페이지 영업시간, 프로필 사진 수정 사항 저장"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 부동산 홈페이지 영업시간, 프로필 사진 수정 사항 저장 성공
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
// [msa] updateAgentInfo 페이지 랜더링
router.post(
  "/:ra_regno/update_process",
  agentController.upload.single("myImage"),
  agentController.updatingEnteredInfo,
);

/**
 * @swagger
 * paths:
 *  /agent/{id}/info_edit:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    get:
 *      summary: "부동산 홈페이지 소개글, 이미지 수정 페이지"
 *      description: "부동산 홈페이지 소개글, 이미지 수정 페이지 렌더링"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 부동산 홈페이지 소개글, 이미지 수정 페이지 렌더링 성공
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
// [msa] agent_page
router.get("/:ra_regno/info_edit", agentController.updateMainInfo);
/**
 * @swagger
 * paths:
 *  /agent/{id}/edit_process:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *    post:
 *      summary: "부동산 홈페이지 소개글, 이미지 수정 사항 저장"
 *      description: "부동산 홈페이지 소개글, 이미지 수정 사항 저장"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 부동산 홈페이지 소개글, 이미지 수정 사항 저장 성공
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
// [msa] agent_page
router.post(
  "/:ra_regno/edit_process",
  // agentController.upload.fields([{name: 'myImage1'}, {name: 'myImage2'}, {name: 'myImage3'}]),
  agentController.updatingMainInfo,
);

/**
 * @swagger
 * paths:
 *  /agent/report/{rv_id}:
 *    parameters:
 *      - in: path
 *        name: rv_id
 *        required: true
 *    get:
 *      summary: "공인중개사가 후기 신고"
 *      description: "공인중개사가 후기 신고"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 공인중개사가 후기 신고 성공
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
// [msa] review
//후기 신고
router.get('/report/:rv_id', agentController.reporting);

/**
 * @swagger
 * paths:
 *  /agent/deleteAccount:
 *    post:
 *      summary: "공인중개사 회원 탈퇴"
 *      description: "공인중개사 회원 탈퇴"
 *      tags: [Agent]
 *      responses:
 *        "200":
 *          description: 공인중개사 회원 탈퇴 성공
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
// [msa] agent_mypage
router.post(
  "/deleteAccount",
  agentController.deleteAccount
);

module.exports = router;
