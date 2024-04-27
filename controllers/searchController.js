const db = require("../config/db");
const searchModel = require("../models/searchModel");
const jwt = require("jsonwebtoken");

//컨트롤러 함수에서는 데이터베이스에서 부동산중개업소 정보를 조회하는 비즈니스 로직을 수행

exports.getAgency = async(req,res) => {
  const sgg_nm = req.query.sgg_nm;
  const bjdong_nm = req.query.bjdong_nm;
  const ra_regno = req.query.ra_regno;

  try {
    // 서울시 공공데이터 api
    const apiResponse = await fetch(
      `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/landBizInfo/1/1000/`
    );
    const js = await apiResponse.json();

    // const rows = await searchModel.getAgenciesModel(sgg_nm, bjdong_nm);
    const rows = js.landBizInfo.row;
    const filtered = [];

    for(const row of rows) {
      if(row.SGG_NM == sgg_nm && row.BJDONG_NM == bjdong_nm) {
        filtered.push(row);
        row.avg_rating = 0;
        row.countReview = 0;
      }
    }

    res.json({ rows: filtered });
  } catch (err) {
    console.error(err.stack);
  }
};

// 중개업소 정보 조회 API
exports.getOneAgency = async(req, res) => {
  const sgg_nm = req.query.sgg_nm;
  const bjdong_nm = req.query.bjdong_nm;
  const cmp_nm = '%'+req.query.cmp_nm+'%';

  try {
    // 서울시 공공데이터 api
    const apiResponse = await fetch(
      `http://openapi.seoul.go.kr:8088/${process.env.API_KEY}/json/landBizInfo/1/1000/`
    );
    const js = await apiResponse.json();

    // const rows = await searchModel.getAgenciesModel(sgg_nm, bjdong_nm);
    const rows = js.landBizInfo.row;
    const filtered = [];

    for(const row of rows) {
      if(row.CMP_NM.includes(req.query.cmp_nm)) {
        filtered.push(row);
        row.avg_rating = 0; // 여기 고치자 원채야
        row.countReview = 0; // 여기 고치자 원채야
      }
    }
    
    res.json({ rows: filtered });
    // const rows = await searchModel.getOneAgencyModel(sgg_nm,bjdong_nm,cmp_nm);
    // res.json({ rows: rows });
  } catch (err) {
    console.error(err.stack)
  }
};
