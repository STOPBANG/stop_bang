const router = require("express").Router();
const residentController = require("../controllers/residentController");

/**
 * @swagger
 * paths:
 *  /resident/myReview:
 *    get:
 *      summary: "작성 후기 조회"
 *      description: "마이페이지에서 로그인한 입주민이 작성한 후기 조회"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 로그인 사용자 후기 조회
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 *                      example:
 *                          {
 *                            reviews: [
 *                              {
 *                                'r_username': 'user',
 *                                'rv_id': 1,
 *                                'cmp_nm': '행복부동산',
 *                                'address': '행복동',
 *                                'agentList_ra_regno': '111-111',
 *                                'rating': 3.4,
 *                                'content': '후기내용',
 *                                'tags': 'tag1, tag2',
 *                                'created_time': '2023-01-01T10:00:00'
 *                              }
 *                            ],
 *                            tagsData: [
 *                              "친절해요",
 *                              "매물이 마음에 들어요",
 *                              "시간 약속을 잘 지켜요",
 *                              "부동산 지식이 풍부해요",
 *                              "정직하고 신뢰할 수 있어요",
 *                              "약속 시간에 늦었어요",
 *                              "약간 불친절하게 느껴져요",
 *                              "중개비용이 비싸요",
 *                              "법적 서류 검토가 꼼꼼하지 않았어요",
 *                              "거래 이후에 문제가 생겼어요",
 *                            ],
 *                            path: 'myreview'
 *                          }
 */
router.get(
  "/myReview",
  residentController.myReview
);
/**
 * @swagger
 * paths:
 *  /resident/openreview:
 *    get:
 *      summary: "열람 후기 조회"
 *      description: "마이페이지에서 로그인한 입주민이 열람한 후기 조회"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 로그인 사용자 열람 후기 조회
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 *                      example:
 *                          {
 *                            openReviews: [
 *                              {
 *                                'r_username': 'user',
 *                                'rv_id': 1,
 *                                'cmp_nm': '행복부동산',
 *                                'address': '행복동',
 *                                'agentList_ra_regno': '111-111',
 *                                'rating': 3.4,
 *                                'content': '후기내용',
 *                                'tags': 'tag1, tag2',
 *                                'created_time': '2023-01-01T10:00:00'
 *                              }
 *                            ],
 *                            tagsData: [
 *                              "친절해요",
 *                              "매물이 마음에 들어요",
 *                              "시간 약속을 잘 지켜요",
 *                              "부동산 지식이 풍부해요",
 *                              "정직하고 신뢰할 수 있어요",
 *                              "약속 시간에 늦었어요",
 *                              "약간 불친절하게 느껴져요",
 *                              "중개비용이 비싸요",
 *                              "법적 서류 검토가 꼼꼼하지 않았어요",
 *                              "거래 이후에 문제가 생겼어요",
 *                            ],
 *                            path: 'openreview'
 *                          }
 */
router.get(
  "/openreview",
  residentController.openReview
);
/**
 * @swagger
 * paths:
 *  /resident/bookmark:
 *    get:
 *      summary: "북마크 조회"
 *      description: "마이페이지에서 로그인한 입주민이 북마크한 부동산 조회"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 로그인 사용자 북마크한 부동산 조회
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 *                      example:
 *                          {
 *                            bookmarks: [
 *                              {
 *                                'bm_id': 1,
 *                                'agentList_ra_regno': '111-111',
 *                                'cmp_nm': '행복부동산',
 *                                'address': '행복동',
 *                              }
 *                            ],
 *                            path: 'openreview'
 *                          }
 */
router.get(
  "/bookmark",
  residentController.bookmark
);
/**
 * @swagger
 * paths:
 *  /resident/bookmark/{id}/delete:
 *    post:
 *      parameters:
 *        - in: path
 *          name: id   # Note the name is the same as in the path
 *          required: true
 *      summary: "북마크 제거"
 *      description: "마이페이지에서 로그인한 입주민이 북마크한 부동산 제거"
 *      tags: [Resident]
 *      responses:
 *        "302":
 *          description: 로그인 사용자 북마크한 부동산 제거
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 *                      example:
 *                          {
 *                            bookmarks: [
 *                              {
 *                                'bm_id': 1,
 *                                'agentList_ra_regno': '111-111',
 *                                'cmp_nm': '행복부동산',
 *                                'address': '행복동',
 *                              }
 *                            ],
 *                            path: 'openreview'
 *                          }
 */
router.post(
  "/bookmark/:id/delete",
  residentController.deleteBookmark
);
/**
 * @swagger
 * paths:
 *  /resident/settings:
 *    get:
 *      summary: "입주민 마이페이지"
 *      description: "로그인한 입주민 마이페이지로 들어가는 경로"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 로그인한 입주민 마이페이지에 필요한 데이터
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
router.get(
  "/settings",
  residentController.settings
);

/**
 * @swagger
 * paths:
 *  /resident/update:
 *    post:
 *      summary: "입주민 회원 정보 수정"
 *      description: "로그인한 입주민의 회원 정보 수정하는 기능"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 수정 완료 여부가 전달 됨
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
router.post(
  "/settings/update",
  residentController.updateSettings
);

/**
 * @swagger
 * paths:
 *  /resident/pwupdate:
 *    post:
 *      summary: "입주민 회원 비밀번호 수정"
 *      description: "로그인한 입주민의 회원 비밀번호 수정하는 기능"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 비밀번호 수정 완료 여부가 전달 됨
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
router.post(
  "/settings/pwupdate",
  residentController.updatePassword
);

/**
 * @swagger
 * paths:
 *  /resident/pwupdate:
 *    post:
 *      summary: "입주민 회원 탈퇴"
 *      description: "로그인한 입주민 회원 탈퇴 기능"
 *      tags: [Resident]
 *      responses:
 *        "200":
 *          description: 탈퇴 했다면 1이 반환 됨
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
router.post(
  "/deleteAccount",
  residentController.deleteAccount
);

module.exports = router;
