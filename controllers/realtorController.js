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
      host: 'stop_bang_realtor_page',
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

  /* msa */
  updateBookmark: (req, res) => {
    req.body.userId = res.locals.auth;
    const postOptions = {
      host: 'stop_bang_bookmark',
      port: process.env.MS_PORT,
      path: `/realtor/${req.params.sys_regno}/bookmark`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {r_username: res.locals.auth}
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    )
    forwardRequest.on('close', () => {
      console.log('Sent [updateBookmark] message to bookmark microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updateBookmark] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  }
};