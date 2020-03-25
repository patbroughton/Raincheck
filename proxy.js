const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/weather', async (req, res) => {
 
  const api_url = 'https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/42.3601,-71.0589';
  const response  = await fetch(api_url);
  const json = await response.json();
  res.json(json);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(express.static('public'));