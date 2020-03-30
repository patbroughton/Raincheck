//test
const express = require('express');
const fetch = require('node-fetch');
const app = express();
let lat, lon, numDays;

class DailyData {
    constructor() {
      this.day = 0;
      this.year = 0;
      this.month = 0;
      this.date = 0;
      this.hour = 0;
      this.minute = 0;
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
    //const api_url = `https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/${lat},${lon},${yesterday}`;
    // TODO: Don't forget to handle time zone
    const start_timestamp = `${dailyDataArray[numDays].year}-${dailyDataArray[numDays].month}-${dailyDataArray[numDays].date}T${dailyDataArray[numDays].hour}%3A${dailyDataArray[numDays].minute}`;
    const end_timestamp = `${dailyDataArray[0].year}-${dailyDataArray[0].month}-${dailyDataArray[0].date}T${dailyDataArray[0].hour}%3A${dailyDataArray[0].minute}`;
    const station_url = `https://api.weather.gov/points/${lat}%2C${lon}/stations`;
    const station_data  = await fetch(station_url);
    const station_data_json = await station_data.json();
    const station_id = station_data_json.features[0].properties.stationIdentifier;
    console.log(`Station ID: ${station_id}`);
    const weather_url = `https://api.weather.gov/stations/${station_id}/observations?start=${start_timestamp}%3A00-00%3A00&end=${end_timestamp}%3A00-00%3A00`;
    const response  = await fetch(weather_url);
    const json = await response.json();
    res.json(json);
  } catch (error) {
      console.error(error);
    }
});

app.post('/api', (request, response) => {
  console.log('Request received...');
  console.log(request.body);
  lat = request.body.lat;
  lon = request.body.lon;
  numDays = request.body.numDays;
  for (i=0; i<numDays+1; i++){
    dailyDataArray[i] = request.body.dailyDataArray[i]
  }
  response.json({
    status: 'success',
    latitude: lat,
    longitude: lon,
    numDays: numDays,
    dailyDataArray: dailyDataArray
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(express.static('public'));
