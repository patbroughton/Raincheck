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
    console.log(`Seconds since epoch = ${secondsSinceEpoch}`)
    const yesterday = secondsSinceEpoch - (60 * 60 * 24);
    console.log(`Seconds 24 hours ago: ${yesterday}`);
    //const api_url = `https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/${lat},${lon},${yesterday}`;
    const api_url = 'https://api.weather.gov/stations/kbkl/observations?start=2020-03-17T00%3A00%3A00-05%3A00&end=2020-03-21T00%3A00%3A00-05%3A00';
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
  secondsSinceEpoch = request.body.secondsSinceEpoch;
  response.json({
    status: 'success',
    latitude: lat,
    longitude: lon
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(express.static('public'));
