require('dotenv').config();
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const fetch = require('node-fetch');
const app = express();
let lat, lon, numDays;

console.log("Env vars");
console.log(process.env);

const hostname = 'localhost';
//const httpPort = process.env.PORT || 80;
const httpsPort = process.env.PORT || 3000;

const httpsOptions = {
  cert: fs.readFileSync('./ssl/raincheck_info.crt'),
  ca: fs.readFileSync('./ssl/raincheck_info.ca-bundle'),
  key: process.env.SSL_KEY
};

const httpsServer = https.createServer(httpsOptions, app);
//const httpServer = http.createServer(app);

//  app.use((req, res, next) => {
//    if(req.protocol === 'http') {
//      res.redirect(301, `https://${req.headers.host}${req.url}`);
//    }
//    next();
//  });

class DailyData {
    constructor() {
      this.day = 0;
      this.year = 0;
      this.month = 0;
      this.date = 0;
      this.hour = 0;
      this.minute = 0;
      this.rain = 0;
      this.numRecords = 0;
    }
}
dailyDataArray = [];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.json());

app.get('/weather', async (req, res) => {
  try{
    console.log(`Lat is ${lat}`);
    console.log(`Lon is ${lon}`);
    //Ensure that hours and minutes contain 2 digits, padding with a leading zero if necessary
    padTime();
    //const api_url = `https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/${lat},${lon},${yesterday}`;
    const start_timestamp = `${dailyDataArray[numDays].year}-${dailyDataArray[numDays].month}-${dailyDataArray[numDays].date}T${dailyDataArray[numDays].hour}%3A${dailyDataArray[numDays].minute}`;
    const end_timestamp = `${dailyDataArray[0].year}-${dailyDataArray[0].month}-${dailyDataArray[0].date}T${dailyDataArray[0].hour}%3A${dailyDataArray[0].minute}`;
    const station_url = `https://api.weather.gov/points/${lat}%2C${lon}/stations`;
    const station_data  = await fetch(station_url);
    const station_data_json = await station_data.json();
    const station_id = station_data_json.features[0].properties.stationIdentifier;
    console.log(`Station ID: ${station_id}`);
    const weather_url = `https://api.weather.gov/stations/${station_id}/observations?start=${start_timestamp}%3A00-00%3A00&end=${end_timestamp}%3A00-00%3A00`;
    let response  = await fetch(weather_url);
    let json = await response.json();
    res.json(json);
  } catch (error) {
      console.error(error);
    }
});

app.post('/api', async (request, response) => {
  console.log('Request received...');
  console.log(request.body);
  lat = request.body.lat;
  lon = request.body.lon;
  numDays = request.body.numDays;
  for (i=0; i<numDays+1; i++){
    dailyDataArray[i] = request.body.dailyDataArray[i]
  }
  const reverseGeocode_url = `https://us1.locationiq.com/v1/reverse.php?key=9c476fdba7c017&lat=${lat}&lon=${lon}&format=json`;
  let response2 = await fetch(reverseGeocode_url);
  let json2 = await response2.json();
  response.json(json2);
  // response.json({
  //   status: 'success',
  //   latitude: lat,
  //   longitude: lon,
  //   numDays: numDays,
  //   dailyDataArray: dailyDataArray
  // });
});

// This function formats time data properly for API request
function padTime() {
  for (i=0; i<numDays+1; i++){
    dailyDataArray[i].hour = dailyDataArray[i].hour.toString(10).padStart(2, '0');
    dailyDataArray[i].minute = dailyDataArray[i].minute.toString(10).padStart(2, '0');
    //console.log(`Padded hours: ${dailyDataArray[i].hour}`);
    //console.log(`Padded minutes: ${dailyDataArray[i].minute}`);
  }
}

const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(express.static('public'));

//httpServer.listen(httpPort, hostname, () => console.log(`Listening on ${httpPort}`));
httpsServer.listen(httpsPort, hostname, () => console.log(`Listening on ${httpsPort}`));
