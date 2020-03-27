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
    //const api_url = `https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/${lat},${lon},${yesterday}`;
    // TODO: Don't forget to handle time zone
    const numDays = 9;
    const api_url = `https://api.weather.gov/stations/kbkl/observations?start=${year[numDays]}-${month[numDays]}-${date[numDays]}T${hour[numDays]}%3A${minute[numDays]}%3A00-05%3A00&end=${year[0]}-${month[0]}-${date[0]}T${hour[0]}%3A${minute[0]}%3A00-05%3A00`;
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
  year = request.body.year;
  month = request.body.month;
  date = request.body.date;
  hour = request.body.hour;
  minute = request.body.minute;
  response.json({
    status: 'success',
    latitude: lat,
    longitude: lon,
    year: year,
    month: month,
    date: date,
    hour: hour,
    minute: minute
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(express.static('public'));
