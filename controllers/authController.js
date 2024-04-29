const authModel = require("../models/authModel");
const residentModel = require("../models/residentModel");
const agentModel = require("../models/agentModel");
const jwt = require("jsonwebtoken");
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
        host: 'stop_bang_register',
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
    try {
      /* msa */
      const postOptions = {
        host: 'stop_bang_register',
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
          return res.send(response.body);
        })
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  },

  registerResident: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_register',
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
      res.redirect("/");
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
      host: 'stop_bang_register',
      port: process.env.MS_PORT,
      path: `/register/agent`,
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
      res.redirect("/");
    });
    request.on('error', (err) => {
      console.log('Failed to send message');
      console.log(err && err.stack || err);
    });
    request.write(JSON.stringify(requestBody));
    request.end();
  },

  getAgentPhoneNumber: async (req, res) => {
    const ra_regno = req.query.raRegno;
    console.log(`${ra_regno}`)

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

  registerAgentView: (req, res) => {
    res.render("users/agent/register");
  },

  login: (req, res) => {
    /* msa */
    const postOptions = {
      host: 'stop_bang_login_logout',
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
      host: 'stop_bang_login_logout',
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
