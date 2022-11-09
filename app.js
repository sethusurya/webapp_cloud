const express = require("express")
const DEF = require("./definition")
const API = require("./src/api")
const bodyParser = require('body-parser');
const cors = require("cors");
const AWS = require("aws-sdk");
require('dotenv').config()
const logger = require('simple-node-logger').createSimpleLogger();

const app = express()
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }))
  app.use(cors());

DEF.COM.EXPRESS_APP = app;

API.init();
logger.info('Starting application')

module.exports = {
    app,
};