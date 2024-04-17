//Models
const e = require("express");
const realtorModel = require("../models/realtorModel.js");
const jwt = require("jsonwebtoken");

module.exports = {
  
  mainPage: async (req, res, next) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_realtor_page',
      port: process.env.MS_PORT,
      path: '/:ra_regno',
      method: 'GET',
      headers: {
        ...
        req.headers,
        auth: res.locals.auth
      }
    }
    const forwardRequest = http.request(
      getOptions,
      forwardResponse => {
        let data = '';
        forwardResponse.on('data', chunk => {
          data += chunk;
        });
        forwardResponse.on('end', () => {
          return res.render("realtor/:ra_regno", JSON.parse(data));
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [realtorDetail] message to realtor_page microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [realtorDetail] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },
  
  realtorView: (req, res) => {
    res.render("realtor/realtorIndex.ejs");
  },

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
      await realtorModel.insertOpenedReview(r_username, rv_id, () => {
        res.redirect(`/realtor/${req.params.ra_regno}`);
      });
    }
  },
  //후기 신고
  reporting: async (req, res) => {
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
      ra_regno = await realtorModel.reportProcess(req, r_username);
      console.log("신고완료");
      res.redirect(`${req.baseUrl}/${ra_regno[0][0].agentList_ra_regno}`);
    }
  },

  updateBookmark: (req, res) => {
    if (req.cookies.authToken == undefined)
      res.render("notFound.ejs", { message: "로그인이 필요합니다" });
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      const r_username = decoded.userId;
      if (r_username === null)
        res.render("notFound.ejs", { message: "로그인이 필요합니다" });
      else {
        let body = {
          r_username: r_username,
          raRegno: req.params.ra_regno,
          isBookmark: req.body.bookmarkData,
        };
        realtorModel.updateBookmark(r_username, body, (result, err) => {
          if (result === null) {
            console.log("error occured: ", err);
          } else {
            console.log(result);
            res.redirect(`/realtor/${req.params.ra_regno}`);
          }
        });
      }
    }
  }
};
