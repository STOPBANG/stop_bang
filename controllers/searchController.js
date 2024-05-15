const db = require("../config/db");
const searchModel = require("../models/searchModel");
const jwt = require("jsonwebtoken");
const fetch = require('node-fetch');
const {httpRequest} = require('../utils/httpRequest.js');

//컨트롤러 함수에서는 데이터베이스에서 부동산중개업소 정보를 조회하는 비즈니스 로직을 수행

module.exports = {
  // [start] 모든 agency 정보 가져오기
  getAgency: async (req, res) => {
    const { sgg_nm, bjdong_nm } = req.query;
    const postOptions = {
      host: 'stop_bang_map',
      port: process.env.MS_PORT,
      path: `/search/agencies`,
      method: 'POST',
      headers: {
        ...
        req.headers,
        'Content-Type': 'application/json',
      }
    }
    let requestBody = { sgg_nm: sgg_nm, bjdong_nm: bjdong_nm };

    httpRequest(postOptions, requestBody)
      .then((response) => {
      return res.json({rows: response.body})
    });
  },
  // [end] 모든 agency 정보 가져오기
  // [start] 하나의 agency 정보 가져오기
  getOneAgency: async(req, res) => {
    const { sgg_nm, bjdong_nm, cmp_nm } = req.query;
    
    const postOptions = {
      host: 'stop_bang_map',
      port: process.env.MS_PORT,
      path: `/search/agencyName`,
      method: 'POST',
      headers: {
        ...
        req.headers,
        'Content-Type': 'application/json',
      }    
    }
    let requestBody = { sgg_nm: sgg_nm, bjdong_nm: bjdong_nm, cmp_nm : cmp_nm };

    httpRequest(postOptions, requestBody)
    .then((response) => {
      return res.json({rows: response.body});
    });
  }
  // [end] 하나의 agency 정보 가져오기
};
