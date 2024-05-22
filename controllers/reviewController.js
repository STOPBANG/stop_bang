//Models
const reviewModel = require("../models/reviewModel.js");
const tags = require("../public/assets/tag.js");
const jwt = require("jsonwebtoken");
const {httpRequest} = require("../utils/httpRequest.js");
const http = require('http');

module.exports = {
  //후기 추가
  createReview: async (req, res) => {
    console.log(req.params.sys_regno);
    const postOptions = {
      host: 'stop_bang_review',
      port: process.env.MS_PORT,
      path: `/review/create/${req.params.sys_regno}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        id: res.locals.id
      }
    };

    await httpRequest(postOptions)
      .then(async (response) => {
        if(response.body.length >= 1){
          // 작성한 리뷰가 있을 때
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
          res.write("<script>alert('이미 후기를 작성한 부동산입니다.')</script>");
          res.write(`<script>window.location=\"../../realtor/${req.params.sys_regno}\"</script>`);
        }
        else {
          // 서울시 공공데이터 api
          const apiResponse = await fetch(
            `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/landBizInfo/1/1/${req.params.sys_regno}`
          );
          const js = await apiResponse.json();
          const agentPublicData = js.landBizInfo.row[0];

          res.render("review/writeReview.ejs", {
            realtor: agentPublicData,
            tagsdata: tags.tags,
          });
       }
      });
  },

  //후기 추가 DB 반영
  creatingReview: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_review',
      port: process.env.MS_PORT,
      path: `/review/create_process/${req.params.sys_regno}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const requestBody = {
      ...
      req.body,
      username: res.locals.auth,
      id: res.locals.id,
    }

    httpRequest(postOptions, requestBody)
      .then(() => {
        return res.redirect(`/realtor/${req.params.sys_regno}`);
      });
  },


  updateReview: async (req, res) => {
    const username = res.locals.auth;

    /* msa */
    const getOptionsReview = {
      host: 'stop_bang_review',
      port: process.env.MS_PORT,
      path: `/review/update/${req.params.rv_id}`,
      method: 'GET',
      headers: {
        ...req.headers,
        auth: res.locals.auth
      }
    };
    
    httpRequest(getOptionsReview)
    .then(async (response) => {
      const ra_regno=response.body.agentList_ra_regno;
      const apiResponse = await fetch(
        `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/landBizInfo/1/1/${ra_regno}`
      );
      const js = await apiResponse.json();
    
      const cmp_nm = js.landBizInfo.row[0].CMP_NM;
      const title = `${cmp_nm} - ${username}님의 후기 수정하기`;

      return res.render("review/updateReview",{
        review: response.body,
        tagsdata:tags.tags,
        title: title
      });
    })
  },


  //후기 수정 DB 반영
  updatingReview: async (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_review',
      port: process.env.MS_PORT,
      path: `/review/update_process/${req.params.rv_id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    await httpRequest(postOptions, req.body);
    res.redirect(`/resident/myReview`);
  },

  }
