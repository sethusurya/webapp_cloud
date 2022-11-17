const { app } = require('./app');
const port = 3000
const statsDClient = require('statsd-client')
const sdc = new statsDClient({ host: 'localhost', port: 8125 })
// require('dotenv').config()
// const sgMail = require('@sendgrid/mail')

app.get("/healthz", (req, res) => {
  sdc.increment("GET /healthz")

  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // const msg = {
  //   to: 'sethusuryateja@gmail.com', // Change to your recipient
  //   from: 'no-reply@sethusurya.com', // Change to your verified sender
  //   subject: 'Sending with SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // }
  // sgMail
  //   .send(msg)
  //   .then(() => {
  //     console.log('Email sent')
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //   })

  res.sendStatus(200);
});

app.listen(port, () => console.log('Web app is listening on port 3000'));