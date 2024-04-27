const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const passwordSchema = require("../models/passwordValidator");
const mailer = require("../modules/mailer");
const path = require("path");
const db = require("../config/db");
const {httpRequest} = require('../utils/httpRequest');

/**
 * @swagger
 * paths:
 *  /auth/register:
 *    get:
 *      summary: "회원가입 페이지"
 *      description: "회원가입 페이지로 이동, 입주민/공인중개사 선택 필요"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 회원가입 페이지로 이동
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
router.get("/register", authController.registerView);

/**
 * @swagger
 * paths:
 *  /auth/certification:
 *    post:
 *      summary: "이메일 인증 메일 전송"
 *      description: "이메일 인증 코드를 생성하고 메일 전송"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 이메일 전송 성공
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
router.post("/certification", authController.certification);

/**
 * @swagger
 * paths:
 *  /auth/certification-check:
 *    post:
 *      summary: "이메일 인증"
 *      description: "이메일 인증 시도"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 이메일 인증 성공
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
router.post("/certification-check", authController.certificationCheck);

/**
 * @swagger
 * paths:
 *  /auth/register/resident:
 *    get:
 *      summary: "입주민 회원가입 페이지"
 *      description: "입주민 회원가입 페이지 렌더링"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 입주민 회원가입 페이지 렌더링
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
router.get("/register/resident", authController.registerResidentView);

/**
 * @swagger
 * paths:
 *  /auth/register/resident:
 *    post:
 *      summary: "입주민 회원가입 시도"
 *      description: "입주민 회원가입 폼 제출"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 입주민 회원가입 성공
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
router.post("/register/resident", authController.registerResident);

/**
 * @swagger
 * paths:
 *  /auth/register/agent:
 *    get:
 *      summary: "공인중개사 회원가입 페이지"
 *      description: "공인중개사 회원가입 페이지 렌더링"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 공인중개사 회원가입 페이지 렌더링
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
router.get("/register/agent", authController.registerAgentView);

/**
 * @swagger
 * paths:
 *  /auth/register/agent:
 *    post:
 *      summary: "공인중개사 회원가입 시도"
 *      description: "공인중개사 회원가입 폼 제출"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 공인중개사 회원가입 성공
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
router.post("/register/agent", authController.registerAgent);

/**
 * @swagger
 * paths:
 *  /auth/register/agent/phoneNumber:
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
router.get("/register/agent/phoneNumber", authController.getAgentPhoneNumber);

/**
 * @swagger
 * paths:
 *  /auth/login:
 *    post:
 *      summary: "로그인 페이지"
 *      description: "로그인 페이지 렌더링"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 로그인 페이지 렌더링
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
router.get("/login", authController.loginView);
/**
 * @swagger
 * paths:
 *  /auth/login:
 *    post:
 *      summary: "로그인 시도"
 *      description: "입주민, 공인중개사 모두 로그인 시도"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 로그인 성공
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
router.post("/login", authController.login);

/**
 * @swagger
 * paths:
 *  /auth/logout:
 *    get:
 *      summary: "로그아웃"
 *      description: "입주민, 공인중개사 모두 로그아웃 시도"
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: 로그아웃 성공
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
router.get("/logout", authController.logout);

module.exports = router;
