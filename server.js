const { app } = require('./app');
const port = 3000

app.get("/healthz", (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => console.log('Web app is listening on port 3000'));