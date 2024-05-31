const http = require('http');
const {httpRequest} = require('../utils/httpRequest');

module.exports = {
  registerView: (req, res) => {
    res.render("users/register");
  },

  certification: async (req, res) => {
    try {
      /* msa */
      const postOptions = {
        host: 'register-ms',
        port: process.env.MS_PORT,
        path: `/certification`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };
  
      const requestBody = req.body;
      httpRequest(postOptions, requestBody)
        .then(response => {
          return res.send(response.body);
        })
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  },

  certificationCheck: async (req, res) => {
    /* msa */
    const postOptions = {
      host: 'register-ms',
      port: process.env.MS_PORT,
      path: `/certification-check`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const requestBody = req.body;
    httpRequest(postOptions, requestBody)
        .then(response => {
          const result = response.body.result;
          console.log("result code : ", result);
          if (result === "404") {
            return res.status(404).send("사용자가 입력한 코드와 일치하는 데이터를 찾지 못했습니다.")
          }
          return res.send();
        })
  },

  registerResident: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'register-ms',
      port: process.env.MS_PORT,
      path: `/register/resident`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const requestBody = req.body;
    const request = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    );
    request.on('close', () => {
      console.log('Sent message to microservice.');
    });
    request.on('error', (err) => {
      console.log('Failed to send message');
      console.log(err && err.stack || err);
    });
    request.write(JSON.stringify(requestBody));
    request.end();
  },

  registerResidentView: (req, res) => {
    res.render("users/resident/register");
  },

  registerAgent: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'register-ms',
      port: process.env.MS_PORT,
      path: `/register/agent`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const forwardRequest = http.request(
        postOptions,
        forwardResponse => {
          console.log("authController 복귀");
          res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
          forwardResponse.pipe(res);
        }
    );

    forwardRequest.on('close', () => {
      console.log('Sent [registerAgent] message to register microservice.');
    });

    forwardRequest.on('error', (err) => {
      console.log('Failed to send [registerAgent] message');
      console.log(err && err.stack || err);
    });

    forwardRequest.write(JSON.stringify(req.body));
    forwardRequest.end();
  },

  getAgentPhoneNumber: async (req, res) => {
    const sys_regno = req.query.sysRegno;
    console.log(`${sys_regno}`)

    /* msa */
    const getOptions = {
      host: 'register-ms',
      port: process.env.MS_PORT,
      path: `/phoneNumber/${sys_regno}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const result = await httpRequest(getOptions);

    return res.json(result.body);
  },

  registerAgentView: (req, res) => {
    res.render("users/agent/register");
  },

  login: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'login-logout-ms',
      port: process.env.MS_PORT,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    const requestBody = req.body;
    const request = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    );
    request.on('close', () => {
      console.log('Sent [login] message to login-logout microservice.');
    });
    request.on('error', (err) => {
      console.log('Failed to send [login] message');
      console.log(err && err.stack || err);
    });
    request.write(JSON.stringify(requestBody));
    request.end();
  },

  loginView: (req, res) => {
    res.render("users/login");
  },

  logout: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'login-logout-ms',
      port: process.env.MS_PORT,
      path: '/logout',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    const request = http.request(
      postOptions,
      forwardResponse => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    );
    request.on('close', () => {
      console.log('Sent [logout] message to login-logout microservice.');
    });
    request.on('error', (err) => {
      console.log('Failed to send [logout] message');
      console.log(err && err.stack || err);
    });
    req.pipe(request);
    request.end();
  },
};