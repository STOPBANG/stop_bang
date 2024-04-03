const authModel = require("../models/authModel");
// const passwordSchema = require("../models/passwordValidator");
const passwordValidator = require("password-validator");
const passwordSchema = new passwordValidator();
const residentModel = require("../models/residentModel");
const agentModel = require("../models/agentModel");
const jwt = require("jsonwebtoken");
const http = require('http');

function checkUsernameExists(username, responseToClient) {
  residentModel.getUserByUsername(username, (user) => {
    if (user[0].length !== 0) return responseToClient(true);

    agentModel.getAgentByUsername(username, (user) => {
      responseToClient(user[0].length !== 0);
    });
  });
}

function checkPasswordCorrect(password) {
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[!@#$%^&*]/;

  return (
    uppercaseRegex.test(password) &&
    lowercaseRegex.test(password) &&
    numberRegex.test(password) &&
    specialCharRegex.test(password)
  );
}

module.exports = {
  registerView: (req, res) => {
    res.render("users/register");
  },

  registerResident: (req, res) => {
    // Check if required fields are missing
    const body = req.body;

    if (!checkPasswordCorrect(body.password))
      return res.render('notFound.ejs', {message: "비밀번호 제약을 확인해주세요"});

    checkUsernameExists(body.username, (usernameExists) => {
      if (usernameExists) {
        return res.render('notFound.ejs', {message: "이미 사용중인 아이디입니다."});
      }

      // Save new user information to the database
      authModel.registerResident(req.body, (userId) => {
        // Error during registration
        if (!userId) {
          return res.render('notFound.ejs', {message: "회원가입 실패"});
        } else {
          const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY);
          // Store user's userId in the cookie upon successful registration
          res
            .cookie("authToken", token, {
              maxAge: 86400_000,
              httpOnly: true,
            });
          res.cookie("userType", 1, {
            maxAge: 86400_000,
            httpOnly: true,
          })
          .redirect("/");
        }
      });
    });
  },

  registerResidentView: (req, res) => {
    res.render("users/resident/register");
  },

  registerAgent: (req, res) => {
    // Check if required fields are missing
    const body = req.body;


    if (!checkPasswordCorrect(body.password))
      return res.render('notFound.ejs', {message: "비밀번호 제약을 확인해주세요"});

    checkUsernameExists(body.username, (usernameExists) => {
      if (usernameExists) {
        return res.render('notFound.ejs', {message: "이미 사용중인 아이디입니다."});
      }

      // Save new agent information to the database
      authModel.registerAgent(req.body, (userId) => {
        if (!userId) {
          return res.render('notFound.ejs', {message: "회원가입 실패"});
        } else {
          const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY);
          // Store agent's userId in the cookie upon successful registration
          res
            .cookie("authToken", token, {
              maxAge: 86400_000,
              httpOnly: true,
            });
          res.cookie("userType", 0, {
            maxAge: 86400_000,
            httpOnly: true,
          })
          .redirect("/");
        }
      });
    });
  },

  registerAgentView: (req, res) => {
    res.render("users/agent/register");
  },

  login: (req, res) => {
    /* msa */
    const postOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    const requestBody = req.body;
    const request = http.request(
      `http://stop_bang_login_logout:${process.env.LOG_PORT}/login`,
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
    const request = http.request(
      'http://stop_bang_login_logout:3000/logout',
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
    request.end();
  },
};
