//Models
const agentModel = require("../models/agentModel.js");
const tags = require("../public/assets/tag.js");
const jwt = require("jsonwebtoken");
const db = require("../config/db.js");
//multer
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const http = require('http');

// Init Upload
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

const makeStatistics = (reviews) => {
  let array = Array.from({ length: 10 }, () => 0);
  let stArray = new Array(10);
  reviews.forEach((review) => {
    review.tags.split("").forEach((tag) => {
      array[parseInt(tag)]++;
    });
  });
  for (let index = 0; index < array.length; index++) {
    stArray[index] = { id: index, tag: tags.tags[index], count: array[index] };
  }
  stArray.sort((a, b) => {
    return b.count - a.count;
  });
  return stArray;
};

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

module.exports = {
  upload: multer({
    storage: storage,
    limits: { fileSize: 100000000 },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }),

  getAgentPhoneNumber: async (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_register', // !! 회원가입 ms로 분리 !!
      port: process.env.MS_PORT,
      path: '/phoneNumber',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const request = http.request(
      getOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    );
    request.on('close', () => {
      console.log('Sent [getAgentPhoneNumber] message to register microservice.');
    });
    request.on('error', (err) => {
      console.log('Failed to send [getAgentPhoneNumber] message');
      console.log(err && err.stack || err);
    });
    request.end();
  },

  //후기 신고
	reporting: async (req, res) => {
		//쿠키로부터 로그인 계정 알아오기
    if (req.cookies.authToken == undefined) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      let a_id = decoded.userId;
      if(a_id === null) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
      ra_regno = await agentModel.reportProcess(req, a_id);
      console.log("신고완료");
      res.redirect(`${req.baseUrl}/${ra_regno[0][0].agentList_ra_regno}`);
    }
	},

  agentProfile: async (req, res, next) => {
    //쿠키로부터 로그인 계정 알아오기
    if (req.cookies.authToken == undefined) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
    else {
      const decoded = jwt.verify(
        req.cookies.authToken,
        process.env.JWT_SECRET_KEY
      );
      try {
        let agent = await agentModel.getAgentProfile(req.params.id);
        let getMainInfo = await agentModel.getMainInfo(req.params.id);
        //다른 공인중개사 페이지 접근 제한(수정제한으로 수정 필요할지도)
        if (getMainInfo.a_username !== decoded.userId)
          res.render('notFound.ejs', {message: "접근이 제한되었습니다. 공인중개사 계정으로 로그인하세요"});
        let getEnteredAgent = await agentModel.getEnteredAgent(req.params.id);
        let getReviews = await agentModel.getReviewByRaRegno(req.params.id);
        let getReport = await agentModel.getReport(req.params.id, decoded.userId);
        let getRating = await agentModel.getRating(req.params.id);
        let statistics = makeStatistics(getReviews);
        res.locals.agent = agent[0];
        res.locals.agentMainInfo = getMainInfo;
        res.locals.agentSubInfo = getEnteredAgent[0][0];
        res.locals.agentReviewData = getReviews;
        res.locals.report = getReport;
        res.locals.statistics = statistics;

        if (getRating === null) {
          res.locals.agentRating = 0;
          res.locals.tagsData = null;
        } else {
          res.locals.agentRating = getRating;
          res.locals.tagsData = tags.tags;
        }
      } catch (err) {
        console.error(err.stack);
      }
      next();
    }
  },

  agentProfileView: (req, res) => {
    res.render("agent/agentIndex");
  },

  updateMainInfo: async (req, res) => {
    let getMainInfo = await agentModel.getMainInfo(req.params.id);

    let image1 = getMainInfo.a_image1;
    let image2 = getMainInfo.a_image2;
    let image3 = getMainInfo.a_image3;
    let introduction = getMainInfo.a_introduction;

    //여기가 문제같음...........내일 가서 model쪽이랑 여기 물어보자

      let title = `소개글 수정하기`;
      res.render("agent/updateMainInfo.ejs", {
        title: title,
        agentId: req.params.id,
        image1: image1,
        image2: image2,
        image3: image3,
        introduction: introduction,
      });
  },

  updatingMainInfo: (req, res, next) => {
    agentModel.updateMainInfo(req.params.id, req.files, req.body, () => {
      if (res === null) {
        if (error === "imageError") {
          res.render('notFound.ejs', {message: "이미지 크기가 너무 큽니다. 다른 사이즈로 시도해주세요."})
        }
      } else {
        res.locals.redirect = `/agent/${req.params.id}`;
        next();
      }
    });
  },

  updateEnteredInfo: async (req, res) => {
    let getEnteredAgent = await agentModel.getEnteredAgent(req.params.id);

    let profileImage = getEnteredAgent[0][0].a_profile_image;
    let officeHour = getEnteredAgent[0][0].a_office_hours;
    let hours = officeHour != null ? officeHour.split(' ') : null;

    let title = `부동산 정보 수정하기`;
    res.render("agent/updateAgentInfo.ejs", {
      title: title,
      agentId: req.params.id,
      profileImage: profileImage,
      officeHourS: hours != null ? hours[0] : null,
      officeHourE: hours != null ? hours[2] : null
    });
  },

  updatingEnteredInfo: (req, res, next) => {
    console.log(req.file);
    agentModel.updateEnterdAgentInfo(req.params.id, req.file, req.body, () => {
      console.log(req.params.id);
      res.locals.redirect = `/agent/${req.params.id}`;
      next();
    });
  },

  settings: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_agent_mypage',
      port: process.env.MS_PORT,
      path: '/settings',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'userId': res.locals.auth,
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
          const result = JSON.parse(data);
          if(result.agent === null)
            return res.render('notFound.ejs', { message: result.message });
          return res.render("agent/settings", result);
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [settings] message to agent_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [settings] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },

  updateSettings: (req, res) => {
    /* msa */
    req.body.userId = res.locals.auth;
    const postOptions = {
      host: 'stop_bang_agent_mypage',
      port: process.env.MS_PORT,
      path: '/settings/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        let data = '';
        forwardResponse.on('data', chunk => {
          data += chunk;
        });
        forwardResponse.on('end', () => {
          if(forwardResponse.statusCode === 302) { // redirect
            res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
            forwardResponse.pipe(res);
          } else {
            const result = JSON.parse(data);
            if(result.message !== null)
              return res.render('notFound.ejs', { message: result.message });
          }
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [updateSettings] message to agent_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updateSettings] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    req.pipe(forwardRequest);
  },
  updatePassword: (req, res) => {
    /* msa */
    req.body.userId = res.locals.auth;
    const postOptions = {
      host: 'stop_bang_agent_mypage',
      port: process.env.MS_PORT,
      path: '/settings/pwupdate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        let data = '';
        forwardResponse.on('data', chunk => {
          data += chunk;
        });
        forwardResponse.on('end', () => {
          if(forwardResponse.statusCode === 302) { // redirect
            res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
            forwardResponse.pipe(res);
          } else {
            const result = JSON.parse(data);
            if(result.message !== null)
              return res.render('notFound.ejs', { message: result.message });
          }
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [updatePassword] message to agent_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updatePassword] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    req.pipe(forwardRequest);
  },

  deleteAccount: async (req, res) => {
    /* msa */
    req.body.userId = res.locals.auth;
    const postOptions = {
      host: 'stop_bang_agent_mypage',
      port: process.env.MS_PORT,
      path: '/deleteAccount',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        if(forwardResponse.statusCode === 302) { // redirect
          res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
          forwardResponse.pipe(res);
        } else {
          let data = '';
          forwardResponse.on('data', chunk => {
            data += chunk;
          });
          forwardResponse.on('end', () => {
            const jsonData = JSON.parse(data);
            if(jsonData.message != null)
              return res.render('notFound.ejs', jsonData);
          });
        }
      }
    )
    forwardRequest.on('close', () => {
      console.log('Sent [deleteAccount] message to agent_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [deleteAccount] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  }
};
