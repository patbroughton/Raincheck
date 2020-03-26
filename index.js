const express = require('express');
const fetch = require('node-fetch');
const app = express();
var lat, lon;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/weather', async (req, res) => {
  try{
    console.log(`Lat is ${lat}`);
    console.log(`Lon is ${lon}`);
    const api_url = `https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/${lat},${lon}`;
    const response  = await fetch(api_url);
    const json = await response.json();
    res.json(json);
  } catch (error) {
      console.error(error);
    }
});

app.use(express.json());

app.post('/api', (request, response) => {
  console.log('Request received...');
  console.log(request.body);
  lat = request.body.lat;
  lon = request.body.lon;
  response.json({
    status: 'success',
    latitude: lat,
    longitude: lon
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(express.static('public'));
