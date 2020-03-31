
import './chart.js/dist/Chart.js';

const NUM_DAYS_MAX = 30;
let numDays = 3;
let station, lat, lon, weather;
const now = new Date()
const timezoneOffset = now.getTimezoneOffset();
let i=0;

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
let dailyDataArray = [];
for (i=0; i< NUM_DAYS_MAX+1; i++){
    dailyDataArray[i] = new DailyData();
    dailyDataArray[i].day = new Date(now - ((86400*i) * 1000));
    dailyDataArray[i].year = dailyDataArray[i].day.getFullYear();
    dailyDataArray[i].month = dailyDataArray[i].day.getMonth() + 1;
    dailyDataArray[i].date = dailyDataArray[i].day.getDate();
    //dailyDataArray[i].hour = dailyDataArray[i].day.getHours() + (timezoneOffset / 60);
    dailyDataArray[i].hour = dailyDataArray[i].day.getHours();
    dailyDataArray[i].minute = dailyDataArray[i].day.getMinutes();
}
console.log(`Daily Data Array: ${dailyDataArray}`);
console.log(`Today: ${now}`);
console.log(`Time Zone Offset: ${timezoneOffset}`);


const createWeatherLi = (weather) => {
    const li = document.createElement('li');
    li.textContent = `${weather}"`;
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
        console.log(`Weather Data:`);
        console.log(weather);
        station = weather.features[0].properties.station;
        document.getElementById('station').textContent = station;
        //Calculate total rainfall and display it
        const rainTotal = calculateRainfall();
        appendWeatherToDOM(`Total: ${Math.round((rainTotal + Number.EPSILON) * 100) / 100}`);
        appendWeatherToDOM(`${dailyDataArray[0].month}/${dailyDataArray[0].date}: ${Math.round((dailyDataArray[0].rain + Number.EPSILON) * 100) / 100}`);
        appendWeatherToDOM(`${dailyDataArray[1].month}/${dailyDataArray[1].date}: ${Math.round((dailyDataArray[1].rain + Number.EPSILON) * 100) / 100}`);
        appendWeatherToDOM(`${dailyDataArray[2].month}/${dailyDataArray[2].date}: ${Math.round((dailyDataArray[2].rain + Number.EPSILON) * 100) / 100}`);
        console.log(`Daily Data:`);
        console.log(dailyDataArray);
    } catch (error) {
        console.error(error);
      }
    console.log('fetchWeather finished');
}

const calculateRainfall = () => {
    let rainTotalMeters = 0;
    let dayNum = 0;
    let dailyRainTotalInches = 0;
    for (i=0; i<weather.features.length; i++){
        let timestamp = weather.features[i].properties.timestamp.split('-');
        let date = timestamp[2].split('T');
        //Method 1: Sum all reported rain measurements for each day
        if (date[0] == dailyDataArray[dayNum].date.toString(10)){
            dailyDataArray[dayNum].rain += weather.features[i].properties.precipitationLastHour.value;
            dailyDataArray[dayNum].numRecords++;
        }
        else {
            dayNum++;
        }
        //Method 2: Sum all reported measurements, not separating them by day
        rainTotalMeters += weather.features[i].properties.precipitationLastHour.value;
    }
    //Method 1: Calculate an average rainfall rate for each day and use this to calculate an estimated daily total
    for (i=0; i<numDays; i++){
        if (dailyDataArray[i].numRecords == 0){
            dailyDataArray[i].rain = 0; 
        }
        else{
            dailyDataArray[i].rain  = (dailyDataArray[i].rain / dailyDataArray[i].numRecords) * 24;
            dailyDataArray[i].rain = (dailyDataArray[i].rain * 1000) / 25.4;
        }
        dailyRainTotalInches += dailyDataArray[i].rain;
    }
    //Method 2:Calculate an average rainfall rate for the time period and use this to calculate an estimated total 
    const rainTotalInches = (rainTotalMeters * 1000) / 25.4;
    const averageRainTotalInches = (rainTotalInches / weather.features.length) * 24 * numDays;
    console.log(`Rain total (inches): ${rainTotalInches}`);
    console.log(`Daily Rain total (inches): ${dailyRainTotalInches}`);
    console.log(`Average rain total (inches): ${averageRainTotalInches}`);
    return dailyRainTotalInches
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

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

geolocate().then(fetchWeather);



