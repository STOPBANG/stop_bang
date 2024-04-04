const express = require("express");
const router = express.Router();
const db = require("../config/db");
const adminControl = require("../controllers/adminController");

/**
 * @swagger
 * paths:
 *  /admin:
 *    get:
 *      summary: "관리자 페이지"
 *      description: "관리자 페이지 렌더링"
 *      tags: [Admin]
 *      responses:
 *        "200":
 *          description: 관리자 페이지 렌더링 성공
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
router.get("/", async (req, res, next) => {
  //쿠키로부터 로그인 계정 알아오기
  if (req.cookies.authToken == undefined)
  res.render("notFound.ejs", { message: "로그인이 필요합니다" });
  try {
    const result1 = await adminControl.getNewUsersCount();
    const result2 = await adminControl.getNewAgent();
    const result3 = await adminControl.getReports();

    const userCount = result1[0].userCount;
    const newAgent = result2;
    const reports = result3;
    //console.log("user count : "+userCount, "new agent : "+newAgent);
    res.render("admin/admin", {
      userCount: userCount,
      newAgent: newAgent,
      reports: reports,
    });
  } catch (error) {
    console.log(error);
  }
}),
/**
 * @swagger
 * paths:
 *  /admin/newagent:
 *    get:
 *      summary: "신규 공인중개사 회원 목록 페이지"
 *      description: "신규 공인중개사 회원 목록 페이지 렌더링"
 *      tags: [Admin]
 *      responses:
 *        "200":
 *          description: 신규 공인중개사 회원 목록 페이지 렌더링 성공
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
  router.get("/newagent", async (req, res, next) => {
    try {
      const result2 = await adminControl.getNewAgent();
      const newAgent = result2;
      res.render("admin/adminAgentCheck", { newAgent: newAgent });
    } catch (error) {
      console.log(error);
    }
  }),
/**
 * @swagger
 * paths:
 *  /admin/newagent/confirm/{regno}:
 *    parameters:
 *      - in: path
 *        name: regno
 *        required: true
 *    get:
 *      summary: "신규 공인중개사 회원 승인 페이지"
 *      description: "신규 공인중개사 회원 승인 페이지 렌더링"
 *      tags: [Admin]
 *      responses:
 *        "200":
 *          description: 신규 공인중개사 회원 승인 페이지 렌더링 성공
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
  router.get("/newagent/confirm/:regno", async (req, res, next) => {
    try {
      const regno = req.params.regno;
      const result = await adminControl.getAgent(regno);
      const agent_info = result[0];
      res.render("admin/adminAgentConfirm", { agent_info: agent_info });
    } catch (error) {
      console.log(error);
    }
  }),
/**
 * @swagger
 * paths:
 *  /admin/newagent/confirmed:
 *    parameters:
 *      - in: path
 *        name: regno
 *        required: true
 *    post:
 *      summary: "신규 공인중개사 회원 승인 작업 - 미완성"
 *      description: "신규 공인중개사 회원 승인 작업 - 미완성, 그냥 관리자 홈으로 리다이렉트만 시켜 줌"
 *      tags: [Admin]
 *      responses:
 *        "302":
 *          description: 신규 공인중개사 회원 승인 작업 성공
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
  router.post("/newagent/confirmed", async (req, res, next) => {
    try {
      const regno = req.body.regno;
      const a_id = req.body.a_id;
      res.redirect("/admin");
    } catch (error) {
      console.log(error);
    }
  }),
/**
 * @swagger
 * paths:
 *  /admin/reports:
 *    get:
 *      summary: "신고 목록 페이지"
 *      description: "신고 목록 페이지 렌더링"
 *      tags: [Admin]
 *      responses:
 *        "302":
 *          description: 신고 목록 페이지 렌더링 성공
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
  router.get("/reports", async (req, res, next) => {
    try {
      const result = await adminControl.getReports();
      const reports = result;
      res.render("admin/adminReportCheck", { reports: reports });
    } catch (error) {
      console.log(error);
    }
  }),
/**
 * @swagger
 * paths:
 *  /admin/reports/onfirm/{rvid}/{reporter}:
 *    parameters:
 *      - in: path
 *        name: rvid
 *        required: true
 *      - in: path
 *        name: reporter
 *        required: true
 *    get:
 *      summary: "신고 한 개 조회"
 *      description: "신고 한 개 조회 렌더링"
 *      tags: [Admin]
 *      responses:
 *        "302":
 *          description: 신고 한 개 조회 렌더링 성공
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
  router.get("/reports/confirm/:rvid/:reporter", async (req, res, next) => {
    try {
      const rvid = req.params.rvid;
      const reporter = req.params.reporter;
      const result = await adminControl.getOneReport(rvid, reporter);
      const reports = result[0];
      res.render("admin/adminReportConfirm", { reports: reports });
    } catch (error) {
      console.log(error);
    }
  }),
/**
 * @swagger
 * paths:
 *  /admin/reports/deleted:
 *    post:
 *      summary: "신고된 후기 삭제 조치"
 *      description: "신고된 후기 삭제 조치 - DB에서 후기가 강제 제거 됨"
 *      tags: [Admin]
 *      responses:
 *        "302":
 *          description: 신고된 후기 삭제 조치 성공
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
  router.post("/reports/deleted", async (req, res, next) => {
    console.log("IN THE ROUTER !");
    try {
      const rvid = req.body.rvid;
      const ridof = await adminControl.deleteComment(rvid);
      res.redirect("/admin/reports");
    } catch (error) {
      console.log(error);
    }
  }),
/**
 * @swagger
 * paths:
 *  /admin/reports/reject:
 *    post:
 *      summary: "신고 사항 반려"
 *      description: "신고 사항 반려 조치 - DB에서 신고 내역이 강제 제거 됨"
 *      tags: [Admin]
 *      responses:
 *        "302":
 *          description: 신고된 후기 삭제 조치 성공
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
  router.post("/reports/reject", async (req, res, next) => {
    try {
      const rvid = req.body.rvid;
      const rejected = await adminControl.deleteReport(rvid);
      res.redirect("/admin/reports");
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;
