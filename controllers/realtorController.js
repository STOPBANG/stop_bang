//Models
const e = require("express");
const realtorModel = require("../models/realtorModel.js");
const jwt = require("jsonwebtoken");
const http = require('http');
const {httpRequest} = require('../utils/httpRequest.js');

module.exports = {
  /* msa */
  mainPage: async (req, res, next) => {
    if (req.cookies.authToken == undefined)
      return res.render("notFound.ejs", { message: "로그인이 필요합니다" });
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      let r_username = decoded.userId;
      if (r_username === null)
        return res.render("notFound.ejs", { message: "로그인이 필요합니다" });
    
    const getOptions = {
      host: 'stop_bang_mypage',
      port: process.env.MS_PORT,
      path: `/realtor/${req.params.sys_regno}`,
      method: 'GET',
      headers: {
        ...
        req.headers,
        'Content-Type': 'application/json',
      },
    }

    httpRequest(getOptions)
      .then((response) => {
        res.render("realtor/realtorIndex.ejs", response.body);
      });
    }
  },

  // 후기 열람하기
  // post("/:ra_regno/opening/:rv_id"
  opening: async (req, res) => {
    //쿠키로부터 로그인 계정 알아오기
    if (req.cookies.authToken == undefined)
      res.render("notFound.ejs", { message: "로그인이 필요합니다" });
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      let r_username = decoded.userId;
      if (r_username === null)
        res.render("notFound.ejs", { message: "로그인이 필요합니다" });
      let rv_id = req.params.rv_id;
      console.log("resident name: ", r_username);
      console.log("review id: ", rv_id);
      console.log(decoded);

      console.log("Main_realtorController 'opening' started")
      const getOptions = {
        host: 'stop_bang_mypage',
        port: process.env.MS_PORT,
        path: `/realtor/openReview/${rv_id}`,
        method: 'GET',
        headers: {
          ...
          req.headers,
          'Content-Type': 'application/json',
        },
      }
      // let openRequest = { rv_id: rv_id };
      // console.log("Request body: ", openRequest);
      try {
        const response = await httpRequest(getOptions);
        // 응답 처리
        // ...
        // response 데이터를 사용하여 작업 수행
        res.redirect(`/realtor/${req.params.sys_regno}`);
      } catch (error) {
        // 에러 처리
        // 에러가 발생했을 때의 동작 수행
        console.error("HTTP 요청 에러:", error);
        res.status(500).send("서버 에러 발생");
      }
      
    }
  },
  //후기 신고
  /* msa */
  reporting: async (req, res) => {
    //쿠키로부터 로그인 계정 알아오기
    if (req.cookies.authToken == undefined) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      let a_id = decoded.userId;
      if(a_id === null) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
      // ra_regno = await agentModel.reportProcess(req, a_id);
      //
      const rv_id = req.params.rv_id;
      /* msa */
      const postOptions = {
        host: 'stop_bang_bookmark',
        port: process.env.MS_PORT,
        path: `/agent/report`,
        method: 'POST',
        headers: {
          ...
          req.headers,
          'Content-Type': 'application/json',
        }
      }
      let requestBody = { rv_id: rv_id, a_id: a_id };
      const agentList_ra_regno = httpRequest(postOptions, requestBody)
        .then((response) => {
          //return res.json({rows: response.body})
          const agentList_ra_regno = response.body;
          res.redirect(`${req.baseUrl}/${agentList_ra_regno}`);
      })
      console.log("신고완료");
    }
  },


  /* msa */
  updateBookmark: (req, res) => {
  const updateBookmarkPostOptions = {
    host: 'stop_bang_bookmark',
    port: process.env.MS_PORT,
    path: `/realtor/${req.params.sys_regno}/bookmark`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }
  const requestBody = {r_username: res.locals.auth};
  httpRequest(updateBookmarkPostOptions, requestBody)
    .then((updateBookmarkResponse) => {
      return res.redirect(`/realtor/${req.params.sys_regno}`);
    });
  }
};