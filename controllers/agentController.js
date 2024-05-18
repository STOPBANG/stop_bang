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

/* msa */
// gcp bucket
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_KEYFILE_PATH = process.env.GCP_KEYFILE_PATH;
const GCP_BUCKET_NAME = process.env.GCP_BUCKET_NAME;

const {Storage} = require('@google-cloud/storage');
const {httpRequest} = require("../utils/httpRequest.js");
const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  keyFilename: GCP_KEYFILE_PATH
});
const bucket = storage.bucket(GCP_BUCKET_NAME);

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
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }),

  getAgentPhoneNumber: async (req, res) => {
    const ra_regno = req.query.raRegno;

    /* msa */
    const getOptions = {
      host: 'stop_bang_register',
      port: process.env.MS_PORT,
      path: `/phoneNumber/${ra_regno}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const result = await httpRequest(getOptions);

    return res.json(result.body);
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
      //
      const rv_id = req.params.rv_id;
      /* msa */
      const postOptions = {
        host: 'stop_bang_bookmark',
        port: process.env.MS_PORT,
        path: `/agent/report`,
        method: 'POST',
        headers: {
          ...
              req.headers,
          'Content-Type': 'application/json',
        }
      }
      let requestBody = { rv_id: rv_id, a_id: a_id };
      const agentList_ra_regno = httpRequest(postOptions, requestBody)
          .then((response) => {
            //return res.json({rows: response.body})
            const agentList_ra_regno = response.body;
            res.redirect(`${req.baseUrl}/${agentList_ra_regno}`);
          })
      console.log("신고완료");
      // res.redirect(`${req.baseUrl}/${ra_regno[0][0].agentList_ra_regno}`);
    }
  },

  agentProfile: async (req, res, next) => {
    try {
      //쿠키로부터 로그인 계정 알아오기
      if (req.cookies.authToken == undefined) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
      else {
        const decoded = jwt.verify(
            req.cookies.authToken,
            process.env.JWT_SECRET_KEY
        );
        // let r_username = decoded.userId;
        /* msa */
        const getProfileOptions = {
          host: 'stop_bang_realtor_page',
          port: process.env.MS_PORT,
          path: `/agent/${req.params.ra_regno}`,
          method: 'GET',
          headers: {
            ...
                req.headers,
            auth: res.locals.auth
          }
        }
        httpRequest(getProfileOptions)
            .then(profileResult => {
              if (profileResult.body.length)
                return res.render('notFound.ejs', {message: "접근이 제한되었습니다. 공인중개사 계정으로 로그인하세요"});
              return res.render("agent/agentIndex", profileResult.body);
            })
      }
      // let getReport = await agentModel.getReport(req.params.id, decoded.userId);
      // let getRating = await agentModel.getRating(req.params.id);
      // res.locals.report = getReport;
    } catch (err) {
      console.error(err.stack);
    }
  },

  updateMainInfo: async (req, res) => {
    const decoded = jwt.verify(
      req.cookies.authToken,
      process.env.JWT_SECRET_KEY
    );

    /* msa */
    const getUpdateMainInfoOptions = {
      host: 'stop_bang_realtor_page',
      port: process.env.MS_PORT,
      path: `/agent/${req.params.ra_regno}/info_edit`,
      method: 'GET',
      headers: {
        ...
            req.headers,
        auth: res.locals.auth
      }
    }
    httpRequest(getUpdateMainInfoOptions)
    .then(updateMainInfoResult => {
  
      let image1 = updateMainInfoResult.body.a_image1;
      let image2 = updateMainInfoResult.body.a_image2;
      let image3 = updateMainInfoResult.body.a_image3;
      let introduction = updateMainInfoResult.body.a_introduction;

      let title = `소개글 수정하기`;

      return res.render("agent/updateMainInfo.ejs", {
        title: title,
        sys_regno: req.params.ra_regno,
        image1: image1,
        image2: image2,
        image3: image3,
        introduction: introduction,
      });
    })
  },

  updatingMainInfo: (req, res, next) => {
    /* msa */
    const decoded = jwt.verify(
      req.cookies.authToken,
      process.env.JWT_SECRET_KEY
    );

    let file_arr = [];
    if(req.files.myImage1) file_arr[0] = req.files.myImage1[0];
    if(req.files.myImage2) file_arr[1] = req.files.myImage2[0];
    if(req.files.myImage3) file_arr[2] = req.files.myImage3[0];
    // console.log(req.files.myImage2);

    console.log(file_arr);

    let filename = '';
  
    /* gcs */
    for(file of file_arr){
      const date = new Date();
      const fileTime = date.getTime();
      filename = `${fileTime}-${file.originalname}-image$`;
      console.log(filename);
      const gcsFileDir = `agent/${filename}`;
      // gcs에 agent 폴더 밑에 파일이 저장
      const blob = bucket.file(gcsFileDir);
      const blobStream = blob.createWriteStream();

      blobStream.on('finish', () => {
      console.log('gcs upload successed');
      });

      blobStream.on('error', (err) => {
      console.log(err);
      });

      blobStream.end(file.buffer);
      req.body.files = filename;
  }

    const postUpdatingMainInfoOptions = {
      host: 'stop_bang_realtor_page',
      port: process.env.MS_PORT,
      path: `/agent/${req.body.sys_regno}/edit_process`,
      method: 'POST',
      headers: {
        ...
            req.headers,
        auth: res.locals.auth
      }
    };
    let requestBody = { files: req.files, introduction: req.body.introduction, sys_regno: req.body.sys_regno};
    httpRequest(postUpdatingMainInfoOptions, requestBody)
    .then(updatingMainInfoResult => {
  
      if (updatingMainInfoResult === null) {
        if (error === "imageError") {
          return res.render('notFound.ejs', {message: "이미지 크기가 너무 큽니다. 다른 사이즈로 시도해주세요."})
        }
      } else {
        res.locals.redirect = `/agent/${req.body.sys_regno}`;
        next();
      }
    })
  },

  // 부동산 홈페이지 영업시간, 전화번호 수정 페이지 렌더링
  updateEnteredInfo: async (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_realtor_page',
      port: process.env.MS_PORT,
      path: `/realtor/${req.params.id}/entered_info_process`,
      method: 'GET',
      headers: {
        ...
            req.headers,
        auth: res.locals.auth
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
            return res.render("resident/settings", JSON.parse(data));
          });
        }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [updateEnteredInfo] message to realtor_page microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updateEnteredInfo] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },

  // 부동산 홈페이지 영업시간, 전화번호 수정 사항 저장
  updatingEnteredInfo: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_realtor_page',
      port: process.env.MS_PORT,
      path: `/realtor/${req.params.id}/entered_info_update`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const forwardRequest = http.request(
        postOptions,
        forwardResponse => {
          res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
          forwardResponse.pipe(res);
        }
    );

    forwardRequest.on('close', () => {
      console.log('Sent [updatingEnteredInfo] message to realtor_page microservice.');
    });

    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updatingEnteredInfo] message');
      console.log(err && err.stack || err);
    });

    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  },

  settings: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_agent_mypage',
      port: process.env.MS_PORT,
      path: '/settings',
      method: 'GET',
      headers: {
        ...
            req.headers,
        'Content-Type': 'application/json',
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