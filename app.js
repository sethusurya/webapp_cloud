const express = require("express")
const DEF = require("./definition")
const API = require("./src/api")
const bodyParser = require('body-parser');
const cors = require("cors");
const AWS = require("aws-sdk");
require('dotenv').config()

// AWS.config.update({
//   accessKeyId: process.env.S3ACCESS_KEY_ID,
//   secretAccessKey: process.env.S3SECRET_KEY,
// });

const app = express()
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }))
  app.use(cors());

DEF.COM.EXPRESS_APP = app;

API.init();

module.exports = {
    app,
};