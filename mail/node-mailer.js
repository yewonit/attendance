"use strict";
const nodemailer = require("nodemailer");

const email = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "sw@neo-insp.com", // generated ethereal user
    pass: "hgjmxxvtdusgzuag", // generated ethereal password
  },
};

const send = function (data) {
  nodemailer.createTransport(email).sendMail(data, function (err, info) {
    if (err) {
      console.log("err", err);
    } else {
      console.log("info", info);
      return info.response;
    }
  });
};

const content = {
  from: "YAWONBIZ.com", // sender address
  to: "yglee2601@gmail.com", // list of receivers
  subject: "Hello ✔", // Subject line
  // text: "Hello world?", // plain text body
  html: "<h1>Hello world?</h1>", // html body
};

send(content);

// testMailServer
// hgjmxxvtdusgzuag
