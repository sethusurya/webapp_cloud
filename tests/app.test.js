const supertest = require('supertest');
const express = require('express');
const app = express();
const api = supertest(app)

app.get("/healthz", (req, res) => {
    res.sendStatus(200);
  });

test('HTTP Status code is 200, OK', async () => { 
    await api
    .get('/healthz')
    .expect(200)
})
