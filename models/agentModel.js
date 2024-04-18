//db정보받기
const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  // 공인중개사 공공데이터 조회
  getAgentPublicData: async (ra_regno) => {
    try {
      const res = await db.query(
        `SELECT * FROM agentList WHERE ra_regno = ?;`,
        [ra_regno]
      );
      return res[0];
    } catch(error) {
      return error;
    }
  },

  // 공인중개사 개인정보 조회
  getAgentPrivateData: async (ra_regno) => {
    try {
      const res = await db.query(
        `SELECT * FROM agent WHERE agentList_ra_regno = ?;`,
        [ra_regno]
      );
      return res[0];
    } catch(error) {
      return error;
    }
  },

  getAgentProfile: async (ra_regno) => {
    try {
      const res = await db.query(
        `
    SELECT agentList.rdealer_nm, agentList.cmp_nm, agentList.address, agent.a_profile_image
    FROM agentList
    LEFT JOIN agent ON agentList.ra_regno = agent.agentList_ra_regno
    WHERE agentList.ra_regno = ?;`,
        [ra_regno]
      );
      return res[0];
    } catch (error) {
      return error;
    }
  },

  getMainInfo: async (ra_regno) => {
    let rawQuery = `
    SELECT a_username, a_id, ra_regno, a_image1, a_image2, a_image3, a_introduction
    FROM agent
    RIGHT OUTER JOIN agentList
    ON agentList_ra_regno=ra_regno
    WHERE ra_regno = ?;`;
    let res = await db.query(rawQuery, [ra_regno]);
    return res[0][0];
  },

  getEnteredAgent: async (ra_regno) => {
    try {
      const res = await db.query(
        `
			SELECT a_office_hours, contact_number, telno, ra_regno
			FROM agent_contact
			RIGHT OUTER JOIN agentList
			ON agent_contact.agent_agentList_ra_regno = agentList.ra_regno
			LEFT OUTER JOIN agent
			ON agentList.ra_regno = agent.agentList_ra_regno
			WHERE ra_regno = ?;`,
        [ra_regno]
      );
      return res;
    } catch (error) {
      return error;
    }
  },

  getReviewByRaRegno: async (ra_regno) => {
    try {
      //입주민 회원이 작성한 후기 평균을 가져오느라 조인 많이~
      //7회 이상 신고된 후기 case when절로 확인
      //check_repo 값이 0인 후기는 나쁜 후기로,
      //🚨신고가 7회 누적되어 더이상 접근할 수 없는 후기입니다.🚨 표시
      let rawQuery = `
      SELECT cmp_nm, ra_regno, rv_id, r_id, r_username, rating, content, tags, avgRRating, DATE_FORMAT(newTable.created_time,'%Y-%m-%d') AS created_time,
      CASE
      WHEN rv_id IN (
      SELECT repo_rv_id
      FROM report
      GROUP BY repo_rv_id
      HAVING COUNT(repo_rv_id) >= 7)
      THEN 0
      ELSE 1
      END AS check_repo
      FROM agentList
      JOIN(
      SELECT rv_id, r_id, r_username, agentList_ra_regno, rating, tags, content, avgRRating, newTable3.created_time AS created_time
      FROM resident
      RIGHT JOIN (
      SELECT *
      FROM review
      LEFT OUTER JOIN (
      SELECT resident_r_id AS review_r_id, TRUNCATE(AVG(rating), 1) AS avgRRating
      FROM review
      GROUP BY resident_r_id
      ) newTable2
      ON resident_r_id=review_r_id
      ) newTable3
      ON r_id=resident_r_id
      ) newTable
      ON agentList_ra_regno=ra_regno
      WHERE ra_regno=?`;
      let res = await db.query(rawQuery, [ra_regno]);
      return res[0];
    } catch (err) {
      return err;
    }
  },

  //신고된 후기는 별점 반영X
  getRating: async (ra_regno) => {
    let rawQuery = `
		SELECT TRUNCATE(AVG(rating), 1) AS agentRating
		FROM review
		RIGHT OUTER JOIN agentList
		ON agentList_ra_regno=ra_regno
		WHERE ra_regno=? AND rv_id NOT IN (
			SELECT rv_id
			FROM (
			SELECT rv_id, COUNT(rv_id) AS cnt, agentList_ra_regno
			FROM report
			JOIN review
			ON repo_rv_id=rv_id
			WHERE agentList_ra_regno=?
			GROUP BY rv_id
			HAVING cnt >= 7) newTable
		);`;
    let res = await db.query(rawQuery, [ra_regno, ra_regno]);
    return res[0][0].agentRating;
  },

  //agent 본인이 본인의 부동산 페이지의 후기를 신고했다면 🚔신고완료 표시
  getReport: async (ra_regno, a_username) => {
    let rawQuery = `
    SELECT repo_rv_id
		FROM review
		JOIN (
		SELECT *
		FROM report
		JOIN agent
		ON reporter=a_username
    WHERE a_username=?
		) newTable
		ON rv_id=repo_rv_id
		WHERE newTable.agentList_ra_regno=?;`;
    let res = await db.query(rawQuery, [a_username, ra_regno]);
    return res[0];
  },

  reportProcess: async (req, a_username) => {
    let rawQuery = `
		INSERT
		INTO report(reporter, repo_rv_id, reportee, reason) 
		VALUES(?, ?, ?, ?)`;
    let getReportee = `
		SELECT r_username
		FROM review
		JOIN resident
		ON resident_r_id=r_id
		WHERE rv_id=?`;
    let getRaRegno = `
		SELECT agentList_ra_regno
		FROM review
		WHERE rv_id=?`;

    let reportee = await db.query(getReportee, [req.params.rv_id]);
    await db.query(rawQuery, [
      a_username,
      req.params.rv_id,
      reportee[0][0].r_username,
      req.query.reason,
    ]);
    return await db.query(getRaRegno, [req.params.rv_id]);
  },

  updateMainInfo: async (ra_regno, files, body, result) => {
    try {
      const res = await db.query(
        `UPDATE agent SET a_image1=?, a_image2=?, a_image3=?, a_introduction=?
			WHERE agentList_ra_regno=?`,
        [
          files.myImage1 ? files.myImage1[0].filename : null,
          files.myImage2 ? files.myImage2[0].filename : null,
          files.myImage3 ? files.myImage3[0].filename : null,
          body.introduction,
          ra_regno,
        ]
      );
      result(res);
    } catch (error) {
      result(null, "imageError");
    }
  },

  getEnteredAgent: async (ra_regno) => {
    try {
      const res = await db.query(
        `SELECT a_profile_image, a_office_hours, contact_number, telno, ra_regno
			FROM agentList
			LEFT JOIN agent_contact
			ON agentList.ra_regno=agent_contact.agent_agentList_ra_regno
			LEFT JOIN agent
			ON agentList.ra_regno=agent.agentList_ra_regno
			WHERE agentList_ra_regno=?`,
        [ra_regno]
      );
      return res;
    } catch (error) {
      console.error(error);
      //   result(null, error);
    }
  },

  getUnEnteredAgent: async (ra_regno, result) => {
    try {
      const res = await db.query("SELECT * FROM agentList WHERE ra_regno = ?", [
        ra_regno,
      ]);
      result(res);
    } catch (error) {
      result(null, error);
    }
  },

  updateEnterdAgentInfo: async (ra_regno, file, body, result) => {
    try {
      console.log(file);
      const office_hour = body.office_hour_start + " to " + body.office_hour_end;
      const res = await db.query(
        `UPDATE agent SET a_profile_image=?, a_office_hours=? 
			WHERE agentList_ra_regno=?`,
        [file ? file.filename : null, office_hour, ra_regno]
      );
      result(res);
    } catch (error) {
      console.error(error);
      result(null, error);
    }
  },

  getAgentByUsername: async (username, result) => {
    try {
      let rawQuery = `SELECT a_username FROM agent WHERE a_username = ?`;
      const res = await db.query(rawQuery, [username]);
      result(res);
    } catch (error) {
      console.log("🚀 ~ error:", error);
      result(null, error);
    }
  },

  getAgentById: async (decoded, result) => {
    try {
      let rawQuery = `
      SELECT *
      FROM agent
      RIGHT OUTER JOIN agentList
      ON ra_regno=agentList_ra_regno
      WHERE a_username=?;`;
      const res = await db.query(rawQuery, [decoded.userId]);
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
  updateAgent: async (id, body, result) => {
    try {
      const res = await db.query(
        `UPDATE agent SET a_email=? 
      WHERE a_username=?`,
        [body.email, id]
      );
      result(res);
    } catch (error) {
      result(null, error);
    }
  },
  updateAgentPassword: async (id, body, result) => {
    try {
      const passwordHash = await bcrypt.hash(body.password, saltRounds);
      const passwordResult = await db.query(
        `SELECT a_password FROM agent WHERE a_username=?`,
        [id]
      );
      const password = passwordResult[0][0].a_password;
      const test = await bcrypt.compare(body.oldpassword, password);
      if (!test) {
        console.log("here!", test);
        result(null, "pwerror");
      } else {
        const res = await db.query(
          "UPDATE agent SET a_password=? WHERE a_id=?",
          [passwordHash, id]
        );
        result(res);
      }
    } catch (error) {
      console.error(error);
      result(null, error);
    }
  },

  deleteAccountProcess: async (a_username) => {
    try {
      const rawQuery = `
      DELETE FROM agent
      WHERE a_username=?
      `;
      await db.query(rawQuery, [a_username]);
      return 1;
    } catch (error) {
      return null;
    }
  }
};
