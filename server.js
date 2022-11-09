const { app } = require('./app');
const port = 3000
const statsDClient = require('statsd-client')
const sdc = new statsDClient({ host: 'localhost', port: 8125 })

app.get("/healthz", (req, res) => {
  sdc.increment("GET /healthz")
  res.sendStatus(200);
});

app.listen(port, () => console.log('Web app is listening on port 3000'));