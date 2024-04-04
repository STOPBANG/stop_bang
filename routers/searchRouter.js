const express = require('express');
const router = express.Router();
const db = require("../config/db");
const searchControl = require("../controllers/searchController");

const gu_options =["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"]

/**
 * @swagger
 * paths:
 *  /search:
 *    get:
 *      summary: "서울시 부동산 검색 페이지"
 *      description: "부동산 검색 지도 페이지 렌더링"
 *      tags: [Search]
 *      responses:
 *        "200":
 *          description: 부동산 검색 지도 페이지 렌더링 성공
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
router.get('/',(req,res,next)=>{
    res.render('search', {gu_options:gu_options});

});

/**
 * @swagger
 * paths:
 *  /search/agencies:
 *    get:
 *      summary: "서울시 부동산 검색"
 *      description: "DB에 저장된 서울시 부동산 데이터 검색"
 *      tags: [Search]
 *      responses:
 *        "200":
 *          description: 자치구명, 법정동명으로 부동산 검색 성공
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
router.get("/agencies",searchControl.getAgency);
/**
 * @swagger
 * paths:
 *  /search/agencyName:
 *    get:
 *      summary: "서울시 부동산 이름 검색"
 *      description: "DB에 저장된 서울시 부동산 데이터 중 부동산 이름으로 검색"
 *      tags: [Search]
 *      responses:
 *        "200":
 *          description: 부동산 이름으로 부동산 검색 성공
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
router.get("/agencyName",searchControl.getOneAgency);


    

module.exports = router;