const http = require('http');
const {httpRequest} = require("../utils/httpRequest.js");

module.exports = {
  myReview: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/myReview',
      method: 'GET',
      headers: {
        ...
        req.headers,
        auth: res.locals.auth,
        id: res.locals.id
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
      console.log('Sent [myReview] message to mypage microservice.');
    });
    forwardRequest.on('error', (err) => {
      console.log('Failed to send [myReview] message');
      console.log(err && err.stack || err);
    });
    req.pipe(forwardRequest);
  },
  openReview: async (req, res) => {
    /* msa */
    const getOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/openreview',
      method: 'GET',
      headers: {
        ...
        req.headers,
        auth: res.locals.auth,
        id: res.locals.id
      }
    };
    const response = await httpRequest(getOptions);
    return res.render("resident/openReview", response.body);
  },
  bookmark: (req, res) => {
    /* msa */
    const getOptions = {
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/bookmark',
      method: 'GET',
      headers: {
        ...
        req.headers,
        auth: res.locals.auth,
        id: res.locals.id
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
      console.log('Sent [bookmark] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: `/resident/bookmark/${req.params.id}/delete`,
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
      console.log('Sent [deleteBookmark] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/settings',
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
      console.log('Sent [settings] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/settings/update',
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
      console.log('Sent [updateSettings] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/settings/pwupdate',
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
      console.log('Sent [updatePassword] message to mypage microservice.');
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
      host: 'mypage-ms',
      port: process.env.MS_PORT,
      path: '/resident/deleteAccount',
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
