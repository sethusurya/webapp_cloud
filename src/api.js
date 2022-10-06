const accountAPI = require("./account")

const init = () => {
    accountAPI.init();
};

module.exports = {
    init,
}