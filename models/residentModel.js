const sql = require("../config/db");

let residentModel = {
  getReviewById: async (id, result) => {
    try {
      const res = await sql.query(
				`SELECT rv_id, r_id, r_username, cmp_nm, address, ra_regno, rating, content, newTable.created_time
					FROM agentList
					JOIN (SELECT rv_id, r_id, r_username, agentList_ra_regno, rating, content, review.created_time 
            FROM review
            JOIN resident
            ON r_id=resident_r_id
            WHERE r_id=?) newTable
					ON ra_regno=agentList_ra_regno`,
        [id]
      );
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
  getOpenedReviewById: async (id, result) => {
    try {
      const res = await sql.query(
        `SELECT review_rv_id as rv_id, cmp_nm, address, agentList_ra_regno, rating, content, opened_review.created_time AS created_time 
        FROM opened_review 
          INNER JOIN review 
          ON opened_review.review_rv_id = review.rv_id 
          INNER JOIN agentList
          ON agentList_ra_regno=agentList.ra_regno
          WHERE opened_review.resident_r_id = ? `,
        [id]
      );
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
  getBookMarkById: async (id, result) => {
    try {
      const res = await sql.query(
        `SELECT bm_id, agentList_ra_regno, cmp_nm, address 
          FROM bookmark 
          INNER JOIN agentList 
          ON agentList_ra_regno = ra_regno 
          WHERE resident_r_id = ? `,
        [id]
      );
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
  getResidentById: async (id, result) => {
    try {
      const res = await sql.query("SELECT * FROM resident WHERE r_id = ?", [
        id,
      ]);
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
};

module.exports = residentModel;
