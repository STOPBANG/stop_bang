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
router.post("/certification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).send("Invalid Param");
    }

    /* msa */
    const postOptions = {
      host: 'stop_bang_auth_DB',
      port: process.env.MS_PORT,
      path: `/db/cert/create`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const requestBody = req.body;
    httpRequest(postOptions, requestBody)
      .then(res => {
        mailer.sendEmail(res.body.email, res.body.code);
      });

    res.send("Success!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

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
router.post("/certification-check", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !code ||
      typeof code !== "string"
    ) {
      return res.status(400).send("Invalid Param");
    }

    /* msa */
    const postOptions = {
      host: 'stop_bang_auth_DB',
      port: process.env.MS_PORT,
      path: `/db/cert/compare`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const requestBody = req.body;
    httpRequest(postOptions, requestBody)
      .then(res => {
        if(!res) {
          return res.status(404).send("Data Not Found.");      
        }
      })

    res.send("Success!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

/* 안 쓰는 코드 */
router.post("/send-mail", async (req, res, next) => {
  var email = req.body.email;

  // console.log(sendEmail(email, fullUrl));

  connection.query(
    'SELECT * FROM verifications WHERE email ="' + email + '"',
    function (err, result) {
      if (err) throw err;

      var type = "success";
      var msg = "Email already verified";

      console.log("jjj", result[0]);

      if (result.length > 0) {
        var token = randtoken.generate(20);

        if (result[0].verify == 0) {
          var sent = sendEmail(email, token);
          if (sent != "0") {
            var data = {
              token: token,
            };

            connection.query(
              'UPDATE verifications SET ? WHERE email ="' + email + '"',
              data,
              function (err, result) {
                if (err) throw err;
              }
            );

            type = "success";
            msg = "The verification link has been sent to your email address";
          } else {
            type = "error";
            msg = "Something goes to wrong. Please try again";
          }
        }
      } else {
        console.log("2");
        type = "error";
        msg = "The Email is not registered with us";
      }

      req.flash(type, msg);
      res.redirect("/");
    }
  );
});

/* send verification link */
/* 안 쓰는 코드 */
router.get("/verify-email", function (req, res, next) {
  connection.query(
    'SELECT * FROM verifications WHERE token ="' + req.query.token + '"',
    function (err, result) {
      if (err) throw err;

      var type;
      var msg;

      console.log("lll", result[0].verify);

      if (result[0].verify == 0) {
        if (result.length > 0) {
          var data = {
            verify: 1,
          };

          connection.query(
            'UPDATE verifications SET ? WHERE email ="' + result[0].email + '"',
            data,
            function (err, result) {
              if (err) throw err;
            }
          );
          type = "success";
          msg = "Your email has been verified";
        } else {
          console.log("2");
          type = "success";
          msg = "The email has already verified";
        }
      } else {
        type = "error";
        msg = "The email has been already verified";
      }

      req.flash(type, msg);
      res.redirect("/");
    }
  );
});

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
 *  /auth/register/resident:
 *    get:
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
