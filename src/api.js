const accountAPI = require("./account")
const documentsAPI = require("./documents")

const init = () => {
    accountAPI.init();
    documentsAPI.init();
};

module.exports = {
    init,
}