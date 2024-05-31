const tags = require("../public/assets/tag.js");
const jwt = require("jsonwebtoken");
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
      host: 'register-ms',
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
    console.log("(main): reporting 함수 시작");
    try {
      //쿠키로부터 로그인 계정 알아오기
      if (req.cookies.authToken == undefined) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
      else {
        const decoded = jwt.verify(
            req.cookies.authToken,
            process.env.JWT_SECRET_KEY
        );
        let a_id = decoded.userId;
        // console.log("decoded: ", decoded);
        if(a_id === null) res.render('notFound.ejs', {message: "로그인이 필요합니다"});
        
        const { rv_id, reason } = req.params;

        /* msa */
        const postOptions = {
          host: 'bookmark-ms',
          port: process.env.MS_PORT,
          path: `/agent/report`,
          method: 'POST',
          headers: {
            ...
            req.headers,
            'Content-Type': 'application/json',
          }
        };

        let requestBody = { rv_id: rv_id, a_id: a_id, reason: reason };
        const response = await httpRequest(postOptions, requestBody);
        res.redirect(`${req.baseUrl}/${response.body}`);
        console.log("신고완료");
      }
    } catch (error) {
        console.error(error);
        res.render('notFound.ejs', { message: "main: reporting error" });
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
          host: 'mypage-ms',
          port: process.env.MS_PORT,
          path: `/agent/${req.params.sys_regno}`,
          method: 'GET',
          headers: {
            ...
                req.headers,
            auth: res.locals.auth,
            'Content-Type': 'application/json',
          }
        }
        httpRequest(getProfileOptions)
            .then(profileResult => {
              if (profileResult.body.length)
                return res.render('notFound.ejs', {message: "접근이 제한되었습니다. 공인중개사 계정으로 로그인하세요"});
              console.log("profileResult.body: ", profileResult.body);
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: `/agent/${req.params.sys_regno}/info_edit`,
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
        sys_regno: req.params.sys_regno,
        image1: image1,
        image2: image2,
        image3: image3,
        introduction: introduction,
      });
    })
  },

  updatingMainInfo: async (req, res, next) => {
    /* msa */
    const decoded = jwt.verify(
      req.cookies.authToken,
      process.env.JWT_SECRET_KEY
    );

    let filename = '';
    let file_arr = [];
    if (req.files.myImage1) file_arr[0] = req.files.myImage1[0];
    else file_arr[0] = '';
    if (req.files.myImage2) file_arr[1] = req.files.myImage2[0];
    else file_arr[1] = '';
    if (req.files.myImage3) file_arr[2] = req.files.myImage3[0];
    else file_arr[2] = '';
    
    let i = 0;
    /* gcs */
    for (file of file_arr) {
      if(file == ''){
        file_arr[i] = '';
        i += 1;
        continue;
      }

      const date = new Date();
      const fileTime = date.getTime();
      filename = `${fileTime}-${file.originalname}`;
      const gcsFileDir = `agent/${filename}`;
      // gcs에 agent 폴더 밑에 파일이 저장
      const blob = bucket.file(gcsFileDir);

      await new Promise((resolve, reject) => { // 즉각적인 사진 조회를 위한 Promise 처리 추가
        const blobStream = blob.createWriteStream();

        blobStream.on('finish', () => {
        console.log('gcs upload successed');
        resolve();
        });
  
        blobStream.on('error', (err) => {
        console.log(err);
        reject(err);
        });
  
        blobStream.end(file.buffer);
      });
      file_arr[i] = filename;
      i += 1;
    }

    const postUpdatingMainInfoOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: `/agent/${req.body.sys_regno}/edit_process`,
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      }
    };
    const updatingMainInfoRequestBody = {file: file_arr, introduction: req.body.introduction, sys_regno: req.body.sys_regno};
    httpRequest(postUpdatingMainInfoOptions, updatingMainInfoRequestBody)
    .then(updatingMainInfoResult => {
  
      if (updatingMainInfoResult === null) {
        if (error === "imageError") {
          return res.render('notFound.ejs', {message: "이미지 크기가 너무 큽니다. 다른 사이즈로 시도해주세요."})
        }
      } else {
        return res.redirect(`/agent/${req.body.sys_regno}`);
      }
    })
  },

  // 부동산 홈페이지 영업시간, 전화번호 수정 페이지 렌더링
  updateEnteredInfo: async (req, res) => {
    /* msa */
    const getUpdateEnteredInfoOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: `/agent/${req.params.sys_regno}/entered_info_process`,
      method: 'GET',
      headers: {
        ...
            req.headers,
        auth: res.locals.auth
      }
    }
    httpRequest(getUpdateEnteredInfoOptions)
    .then(updateEnteredInfoResult => {
  
      let profileImage = updateEnteredInfoResult.body.profileImage;
      let hours = updateEnteredInfoResult.body.hours;

      let title = `부동산 정보 수정하기`;
      
      res.render("agent/updateAgentInfo.ejs", {
      title: title,
      agentId: req.params.sys_regno,
      profileImage: profileImage,
      officeHourS: hours != null ? hours[0] : null,
      officeHourE: hours != null ? hours[2] : null
      });
    })
  },

  // 부동산 홈페이지 영업시간, 전화번호 수정 사항 저장
  updatingEnteredInfo: async (req, res) => {
    let img = '';
    if (req.files.myImage) img = req.files.myImage[0];
    let filename = '';
    /* gcs */
    const date = new Date();
    const fileTime = date.getTime();
    filename = `${fileTime}-${img.originalname}`;
    const gcsFileDir = `agent/${filename}`;
    // gcs에 agent 폴더 밑에 파일이 저장
    const blob = bucket.file(gcsFileDir);

    await new Promise((resolve, reject) => {

    const blobStream = blob.createWriteStream();

    blobStream.on('finish', () => {
      console.log('gcs upload successed');
      resolve();
    });

    blobStream.on('error', (err) => {
      console.log(err);
      reject(err);
    });

    blobStream.end(img.buffer);
  });

    /* msa */
    const postUpdatingEnteredInfoOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: `/agent/${req.params.sys_regno}/entered_info_update`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const a_office_hours = req.body.office_hour_start + " to " + req.body.office_hour_end;

    const updatingEnteredInfoRequestBody = {file: filename, a_office_hours: a_office_hours, sys_regno: req.params.sys_regno};
    httpRequest(postUpdatingEnteredInfoOptions, updatingEnteredInfoRequestBody)
    .then(updatingEnteredInfoResult => {
  
      if (updatingEnteredInfoResult === null) {
        if (error === "imageError") {
          return res.render('notFound.ejs', {message: "이미지 크기가 너무 큽니다. 다른 사이즈로 시도해주세요."})
        }
      } else {
        return res.redirect(`/agent/${req.params.sys_regno}`);
      }
    })
  },

  settings: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/agentMypage/settings',
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
      console.log('Sent [settings] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/agentMypage/settings/update',
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
      console.log('Sent [updateSettings] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/agentMypage/settings/pwupdate',
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
      console.log('Sent [updatePassword] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/agentMypage/deleteAccount',
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
      console.log('Sent [deleteAccount] message to mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [deleteAccount] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  }
};