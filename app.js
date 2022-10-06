const express = require("express")
const DEF = require("./definition")
const API = require("./src/api")
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )

DEF.COM.EXPRESS_APP = app;

API.init();

module.exports = {
    app,
};