const NUM_DAYS_MAX = 30;
let numDays = 3;
let lat, lon, weather;
const now = new Date()

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
for (i=0; i< NUM_DAYS_MAX+1; i++){
    dailyDataArray[i] = new DailyData();
    dailyDataArray[i].day = new Date(now - ((86400*i) * 1000));
    dailyDataArray[i].year = dailyDataArray[i].day.getFullYear();
    dailyDataArray[i].month = dailyDataArray[i].day.getMonth() + 1;
    dailyDataArray[i].date = dailyDataArray[i].day.getDate();
    dailyDataArray[i].hour = dailyDataArray[i].day.getHours();
    dailyDataArray[i].minute = dailyDataArray[i].day.getMinutes();
}
console.log(`Daily Data Array: ${dailyDataArray}`);
console.log(`Today: ${now}`);


const createWeatherLi = (weather) => {
    const li = document.createElement('li');
    li.textContent = `${weather}`;
    return li;
};

const appendWeatherToDOM = (weather) => {
    const p = document.getElementById('summary');
    p.appendChild(createWeatherLi(weather));
};

const fetchWeather = async () => {
    console.log('fetchWeather starting');
    //Send location, requested number of days to report, and date-time info to server
    const data = {lat, lon, numDays, dailyDataArray};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    };
    //Await the server's response
    console.log(`sending lat data of ${lat} and lon data of ${lon} to server`);
    let response = await fetch('/api', options);
    response = await response.json();
    console.log(response);
    //Request weather data from server
    const api_url = `weather`;
    try{
        const response = await fetch(api_url);
        //Await the server's response
        const json = await response.json();
        weather = json;
        console.log(weather);
        //Calculate total rainfall and diplay it
        const rainTotal = calculateRainfall();
        appendWeatherToDOM(Math.round((rainTotal + Number.EPSILON) * 100) / 100);
    } catch (error) {
        console.error(error);
      }
    console.log('fetchWeather finished');
}

const calculateRainfall = () => {
    let rainTotalMeters = 0;
    for (i=0; i<weather.features.length; i++){
        rainTotalMeters += weather.features[i].properties.precipitationLastHour.value;
    }
    const rainTotalInches = (rainTotalMeters * 1000) / 25.4;
    const averageRainTotalInches = (rainTotalInches / weather.features.length) * 24 * numDays;
    console.log(`Rain total (inches): ${rainTotalInches}`);
    console.log(`Average rain total (inches): ${averageRainTotalInches}`);
    return averageRainTotalInches
}

function geolocate() {
    return new Promise((resolve, reject) => {  
        console.log('geolocate starting');
        //Check for geolocation capability
        if ('geolocation' in navigator) {
            console.log('geolocation available');
            //Send latitude and longitude to server
            navigator.geolocation.getCurrentPosition(position => {
                console.log(position.coords);
                lat = position.coords.latitude;
                lon = position.coords.longitude;
                document.getElementById('latitude').textContent = lat.toFixed(2);
                document.getElementById('longitude').textContent = lon.toFixed(2);
                console.log('Callback finished');
                resolve();
            });
            console.log('geolocate finished');                 
        } else {
            console.log('geolocation not available');
            reject();
            console.log('geolocate finished');
        }
    });       
}

geolocate().then(fetchWeather);



