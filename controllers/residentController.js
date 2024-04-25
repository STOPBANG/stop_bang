const residentModel = require("../models/residentModel");
const tags = require("../public/assets/tag.js");
const jwt = require("jsonwebtoken");
const http = require('http');

module.exports = {
  myReview: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/myReview',
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
          return res.render("resident/myReview", JSON.parse(data));
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [myReview] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [myReview] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },
  openReview: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/openreview',
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
          return res.render("resident/openReview", JSON.parse(data));
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [openreview] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [openreview] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },
  bookmark: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/bookmark',
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
          return res.render("resident/bookmark", JSON.parse(data));
        });
      }
    );
    forwardRequest.on('close', () => {
      console.log('Sent [bookmark] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [bookmark] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },
  deleteBookmark: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: `/bookmark/${req.params.id}/delete`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    )
    forwardRequest.on('close', () => {
      console.log('Sent [deleteBookmark] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [deleteBookmark] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  },
  settings: (req, res, next) => {
    /* msa */
    const getOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/settings',
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
      console.log('Sent [settings] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [settings] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },
  updateSettings: (req, res, next) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/settings/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth': res.locals.auth
      }
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    )
    forwardRequest.on('close', () => {
      console.log('Sent [updateSettings] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updateSettings] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  },
  updatePassword: (req, res, next) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/settings/pwupdate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth': res.locals.auth
      }
    }
    const forwardRequest = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    )
    forwardRequest.on('close', () => {
      console.log('Sent [updatePassword] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [updatePassword] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  },
  deleteAccount: async (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_resident_mypage',
      port: process.env.MS_PORT,
      path: '/deleteAccount',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    req.body.username = res.locals.auth;
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
      console.log('Sent [deleteAccount] message to resident_mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [deleteAccount] message');
      console.log(err && err.stack || err);
    });
    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  }
};
