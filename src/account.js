const { v4: uuid } = require("uuid");
const DEF = require("../definition")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const moment = require("moment-timezone");
const { authenticate } = require("../middleware.js");
const { accounts } = require("../queries");
// create a stdout console logger
const logger = require('simple-node-logger').createSimpleLogger();
const statsDClient = require('statsd-client')
const sdc = new statsDClient({ host: 'localhost', port: 8125 });
const awssdk = require("aws-sdk");
awssdk.config.update({region: 'us-east-1'});
const documentClient = new awssdk.DynamoDB.DocumentClient();
const crypto = require('crypto');

const getUserAccountById = (req, res) => {
    sdc.increment('GET /v1/account/accountId');
    const { user } = req;
    const { accountId } = req.params;
    logger.info('getUserAccountById', req.params.accountId)
 if (user.id == accountId) {
    accounts.findOne({ where: { id: accountId } })
            .then((res1) => {
                if(res1 && res1.dataValues) {
                    let result = res1.dataValues
                    delete result.password;
                    return res.send(result)
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error connecting to DB"
                })
            })
 } else {
    return res.sendStatus(403);
 }
};

const postUserAccountById = (req, res) => {
    sdc.increment('POST /v1/account');
    const { body } = req
        if (body && body.first_name && body.last_name && body.username && body.password) {
            accounts.findOne({ where: { username: body.username } })
            .then(async (res1) => {
                if (res1) return res.status(400).send("User already exists!");
                // no user existed, so we create new user
                const password = await bcrypt.hash(body.password, saltRounds);
                const currentTime = moment().toISOString();
                const {username} = body;
                const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
                const isValidUsername = emailRegex.test(username);
                if (!isValidUsername) return res.status(400).send("Invalid Username")
                const newUser = {
                    id: uuid(),
                    ...body,
                    password,
                    account_created: currentTime,
                    account_updated: currentTime
                }
                logger.info('Creating new user', newUser.id);
                accounts.create(newUser)
                .then((values) => {
                    if(values && values.dataValues) {
                        let result = values.dataValues
                        delete result.password;

                        let emailID = newUser.username
                        let token = crypto.randomBytes(16).toString("hex")
                        ttlExpirationTime = Math.floor(Date.now() / 1000) + 120
                
                        // Dynamo db add new token and email
                        logger.info("Adding email and token to DynamoDB")
                        logger.info('Email', emailID)
                        logger.info('ttl', ttlExpirationTime)
                
                        // body parameters for adding data
                        let bodyParams = {
                            TableName: "emailTokenTbl",
                            Item: {
                                emailid: emailID,
                                token: token,
                                ttl: ttlExpirationTime
                            }
                        }
                
                        // put data in dynamodb
                        documentClient.put(bodyParams, (err, data) => {
                            if (err) {
                                logger.info('error', err)
                                console.log("Error in adding item to DynamoDB")
                            }
                            else {
                                logger.info('data:', data)
                                console.log(`Item added: ${data}`)
                            }
                        })
                
                        // publish to SNS Topic and trigger lambda function
                        let messageParams = {
                            Message: 'USER_EMAIL_VERIFICATION',
                            TopicArn: process.env.SNS_TOPIC_ARN,
                            MessageAttributes: {
                                'emailid': {
                                    DataType: 'String',
                                    StringValue: emailID
                                },
                                'token': {
                                    DataType: 'String',
                                    StringValue: token
                                }
                            }
                        }
                
                        let publishMessagePromise = new awssdk.SNS({apiVersion: '2010-03-31'}).publish(messageParams).promise();
                
                        publishMessagePromise.then(
                            function(data) {
                                logger.info(data)
                                console.log("Successfully published to sns topic")
                                console.log("MessageID: " + data.MessageId);
                            }).catch(
                                function(err) {
                                console.error(err, err.stack);
                            })
                        
                        return res.send(result)
                    }
                    new Error("Unable to create account")
                })
                .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Error while saving to database"
                    })
                })
            })
            .catch((err1) => {
                res.status(500).send({
                    message: err1.message || "Error while querying from database"
                })
            })

        } else {
            return res.sendStatus(400)
        }
};

const updateUserAccountById = (req, res) => {
sdc.increment('PUT /v1/account/accountId');
 const { user } = req;
 const {accountId} = req.params;
 if (user.id != accountId) return res.sendStatus(403)
 if (req.body) {
    accounts.findOne({ where: { id: accountId }})
    .then(async (res1) => {

        let newUser = {}
        if (res1 && res1.dataValues) {
            newUser = res1.dataValues;
            if (req.body.username || req.body.id || req.body.account_created || req.body.account_updated) return res.sendStatus(400); // rejecting update
            if (req.body.password || req.body.first_name || req.body.last_name) {
                if (req.body.password) {
                    newUser.password = await bcrypt.hash(req.body.password, saltRounds);
                }
                if (req.body.first_name) newUser.first_name = req.body.first_name;
                if (req.body.last_name) newUser.last_name = req.body.last_name;
                newUser.account_updated = moment().toISOString();
                logger.info('updating user', newUser.id)
                accounts.update({
                    password: newUser.password,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    account_updated: newUser.account_updated
                }, {
                    where: { id: accountId }
                })
                .then((result) => {
                    return res.sendStatus(204);
                })
                .catch((error) => {
                    return res.status(500).send({
                        message: error.message || "Error while updating in database"
                    })
                })
            } else {
                return res.sendStatus(400);
            }
        }
      })
      .catch((err1) => {
        res.status(500).send({
            message: err1.message || "Error while querying from database"
        })
      })
 } else {
    return res.sendStatus(400);
 }
};

const verifyUser = (req, res) => {
    const { email, token} = req.params
    if (!email || !token) return res.status(400).send({
        message: "Data for user verification is incomplete"
    })
    // check if user exists
    accounts.findOne({ where : { username: email}})
    .then((response) => {
        if (response) {
            let existingUser = response;
            if (response.verified) return res.status(400).send({ message: "User already verified"})

            // get token for the user from dynamodb with ttl
            let getEmailParams = {
                TableName: 'emailTokenTbl',
                Key: {
                    emailid: email,
                }
            }

            documentClient.get(getEmailParams).promise()
            .then(function(data) {
                if (Object.keys(data).length === 1 && Math.floor(Date.now() / 1000) < data.Item.ttl && token === data.Item.token) {
                    // change user verifies status to true
                    logger.info(`Verified token is ${data.Item.token}`)
                    logger.info('data is: ', data)
                    // call the modifyUser service
                    
                    accounts.update({
                        verified : true,
                        verified_on: Date.now(),
                        account_updated: Date.now()
                    }, {
                        where: { username: email }
                    })
                    .then((result) => {
                        return res.sendStatus(204);
                    })
                    .catch((error) => {
                        return res.status(500).send({
                            message: error.message || "Error while updating in database"
                        })
                    })

                } else {
                    return setErrorResponse(`Token has expired, User cannot be verified`, res, 400)
                }
            })
            .catch(function(err) {
                return setErrorResponse(`Data for given emailid cannot be found`, res, 400)
            });
        } else {
            new Error("No User found")
        }
    })
    .catch((error) => {
        res.status(400).send({
            message: error && error.message ? error.message :"Unable to find user, please recheck the url"
        })
    })
    // check if user is already verified
    // check for token in dynamodb if user exists and not verified
    // if everything is correct make verification status change for the user
};

const init = () => {
    const app = DEF.COM.EXPRESS_APP;
    if (!app) {
        console.error("Express app is not available");
        return;
    }
    app.get("/v1/account/:accountId", authenticate, getUserAccountById);
    app.post("/v1/account", postUserAccountById);
    app.put("/v1/account/:accountId", authenticate, updateUserAccountById);
    app.get("/v1/verifyUserEmail", verifyUser);
};

module.exports = {
    init,
}