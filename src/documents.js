const { v4: uuid } = require("uuid");
const DEF = require("../definition")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const moment = require("moment-timezone");
const { authenticate } = require("../middleware.js");
const { accounts } = require("../queries"); //model for postgres


const uploadDocument = (req, res) => {
    console.log()
};

const init = () => {
    const app = DEF.COM.EXPRESS_APP;
    if (!app) {
        console.error("Express app is not available");
        return;
    }
    app.post("/v1/documents", authenticate, uploadDocument);
};

module.exports = {
    init,
}