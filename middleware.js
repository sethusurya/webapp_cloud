const auth = require('basic-auth');
const { pool } = require("./queries");
const bcrypt = require('bcrypt');

const authenticate = async (req, res, next) => {
    const user = await auth(req);
    if (user && user.name && user.pass) {
        const { name: username, pass: password} = user;
        // check the user from db and compare if the password has from bcrypt is same
        pool.query('SELECT * from accounts where username=$1',[username],(async (error, results) => {
            if (error) {
              return res.sendStatus(401);
            }
            if(results.rowCount == 1){
                const myUser = results.rows[0]
                if(await bcrypt.compare(password,myUser.password)) {
                    delete myUser.password;
                    req.user = myUser; // forwarding user object within request
                    next();
                } else {
                    return res.sendStatus(401);
                }
            } else {
                return res.sendStatus(401);
            }
        }))
    } else {
        return res.sendStatus(401);
    }
};

module.exports = {
    authenticate,
};