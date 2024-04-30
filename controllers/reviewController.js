//Models
const reviewModel = require("../models/reviewModel.js");
const tags = require("../public/assets/tag.js");
const jwt = require("jsonwebtoken");
const {httpRequest} = require("../utils/httpRequest.js");
const http = require('http');
const { title } = require("process");

module.exports = {
  //후기 추가
  createReview: async (req, res) => {
    // 서울시 공공데이터 api
    const apiResponse = await fetch(
      `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/landBizInfo/1/1/${req.params.ra_regno}`
    );
    const js = await apiResponse.json();
    const agentPublicData = js.landBizInfo.row[0];

    res.render("review/writeReview.ejs", {
      realtor: agentPublicData,
      tagsdata: tags.tags,
    });
  },

  //후기 추가 DB 반영
  creatingReview: (req, res) => {
    const username = res.locals.auth;

    /* msa */
    const postOptionsResident = {
      host: 'stop_bang_auth_DB',
      port: process.env.MS_PORT,
      path: `/db/resident/findById`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    const requestBody = {username};
    httpRequest(postOptionsResident, requestBody)
      .then(res => {
        const postOptions = {
          host: 'stop_bang_review_DB',
          port: process.env.MS_PORT,
          path: `/db/review/create`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
        const requestBody = {
          ...
          req.body,
          r_id: res.body[0].id,
          ra_regno: req.params.ra_regno,
        }
        return httpRequest(postOptions, requestBody);
      })
      .then(() => {
        return res.redirect(`/realtor/${req.params.ra_regno}`);
      });
  },


  updateReview: async (req, res) => {
    const username = res.locals.auth;
    let title;

    /* msa */
    const getOptionsReview = {
      host: 'stop_bang_review_DB',
      port: process.env.MS_PORT,
      path: `/db/review/findAllByReviewId/${req.params.rv_id}`,
      method: 'GET',
      headers: {
        ...req.headers,
        auth: res.locals.auth
      }
    };

    const forwardRequestReview = http.request ( 
      getOptionsReview,
      forwardResponse => {
        let data='';
        forwardResponse.on('data', async chunk => {
          data += chunk;
          
          const ra_regno = JSON.parse(chunk)[0].agentList_ra_regno;

          const apiResponse = await fetch(
          `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/landBizInfo/1/1/${ra_regno}`
        );
        const js = await apiResponse.json();
        const cmp_nm = js.landBizInfo.row[0].CMP_NM;
        
        title = `${cmp_nm} - ${username}님의 후기 수정하기`;
      });
      forwardResponse.on('end', () => {
        return res.render("review/updateReview",{
          review: JSON.parse(data)[0],
          tagsdata:tags.tags,
          title: title
        });
      });
    });

    forwardRequestReview.on('close', () => {
      console.log('Sent [myReview] message to resident_mypage microservice.');
    });
    forwardRequestReview.on('error', (err) => {
      console.log('Failed to send [myReview] message');
      console.log(err && err.stack || err);
    });

    req.pipe(forwardRequestReview);

  },


  //후기 수정 DB 반영
  updatingReview: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_review_DB',
      port: process.env.MS_PORT,
      path: `/db/review/update`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const requestBody = {
      ...
      req.body,
      rv_id: req.params.rv_id
    }
    return httpRequest(postOptions, requestBody)
    .then(res.redirect(`/resident/myReview`));
  }
};
