//Models
const reviewModel = require("../models/reviewModel.js");
const tags = require("../public/assets/tag.js");
const jwt = require("jsonwebtoken");
const {httpRequest} = require("../utils/httpRequest.js");

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

  //후기 수정
  updateReview: (req, res) => {
    reviewModel.getReviewByRvId(req.params, (residentReview) => {
      let cmpName = residentReview.cmp_nm;
      let userName = residentReview.r_username;
      let raRegno = residentReview.ra_regno;
      let rate = residentReview.rating;
      let description = residentReview.content;
      let updatedTime = residentReview.check_point;
      console.log(updatedTime);
      let checkedTags = residentReview.tags;

      let title = `${cmpName} - ${userName}님의 후기 수정하기`;
      res.render("review/updateReview.ejs", {
        title: title,
        reviewId: req.params.rv_id,
        raRegno: raRegno,
        rate: rate,
        description: description,
        userName: userName,
        updatedTime: updatedTime,
        checkedTags: checkedTags,
        tagsdata: tags.tags,
      });
    });
  },

  //후기 수정 DB 반영
  updatingReview: (req, res) => {
	  reviewModel.updateReviewProcess(req.params, req.body, () => {
	    res.redirect(`/resident/myReview`);
	  });
  }
};
