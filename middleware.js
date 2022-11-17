const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { accounts } = require("./queries");

const authenticate = async (req, res, next) => {
    const user = await auth(req);
    if (user && user.name && user.pass) {
        const { name: username, pass: password} = user;
        accounts.findOne({ where: { username: username }})
        .then(async (result) => {
            if (!result) return res.sendStatus(401);
            let myUser = result.dataValues;
            if (!myUser.verified) return res.status(400).send("User not verified")
            if (await bcrypt.compare(password, myUser.password)) {
                delete myUser.password;
                req.user = myUser; // forwarding user object within request
                next();
            } else {
                return res.sendStatus(401);
            }
        })
        .catch((err) => {
            return res.status(500).send({
                message: err.message || "Error connecting to DB"
            })
        })
    } else {
        return res.sendStatus(401);
    }
};

module.exports = {
    authenticate,
};