
import './chart.js/dist/Chart.js';

const NUM_DAYS_MAX = 30;
let numDays = 7;
let maxDailyRain = 0;
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
    let address = await fetch('/api', options);
    address = await address.json();
    console.log(address);
    document.getElementById('city').textContent = address.address.city;
    document.getElementById('state').textContent = address.address.state;
    //Request weather data from server
    const api_url = `weather`;
    try{
        const response = await fetch(api_url);
        //Await the server's response
        weather = await response.json();
        console.log(`Weather Data:`);
        console.log(weather);
        station = weather.features[0].properties.station;
        document.getElementById('station').textContent = station;
        //Calculate total rainfall and display it
        const rainTotal = calculateRainfall();
        document.getElementById('total').textContent = `${Math.round((rainTotal + Number.EPSILON) * 100) / 100}"`;
        //appendWeatherToDOM(`Total: ${Math.round((rainTotal + Number.EPSILON) * 100) / 100}`);
        //for(i=0; i< numDays; i++){
        //    appendWeatherToDOM(`${dailyDataArray[i].month}/${dailyDataArray[i].date}: ${Math.round((dailyDataArray[i].rain + Number.EPSILON) * 100) / 100}`);
        //}
        console.log(`Daily Data:`);
        console.log(dailyDataArray);
    } catch (error) {
        console.error(error);
      }
    console.log('fetchWeather finished');
}

const calculateRainfall = () => {
    let dayNum = 0;
    let dailyRainTotalInches = 0;
    for (i=0; i<weather.features.length; i++){
        //Do some formatting of the data
        let timestamp = weather.features[i].properties.timestamp.split('-');
        let date = timestamp[2].split('T');
        date[0] = parseInt(date[0], 10);
        //Sum all reported rain measurements for each day
        if (date[0] == dailyDataArray[dayNum].date.toString(10)){
            dailyDataArray[dayNum].rain += weather.features[i].properties.precipitationLastHour.value;
            dailyDataArray[dayNum].numRecords++;
        }
        else {
            dayNum++;
        }
    }
    //Calculate an average rainfall rate for each day and use this to calculate an estimated daily total
    for (i=0; i<numDays; i++){
        if (dailyDataArray[i].numRecords == 0){
            dailyDataArray[i].rain = 0; 
        }
        else if (i==0){
            dailyDataArray[0].rain  = (dailyDataArray[0].rain / dailyDataArray[0].numRecords) * dailyDataArray[0].hour;
            dailyDataArray[0].rain = (dailyDataArray[0].rain * 1000) / 25.4;
            if (dailyDataArray[0].rain > maxDailyRain){
                maxDailyRain = dailyDataArray[0].rain;
            }
        }
        else{
            dailyDataArray[i].rain  = (dailyDataArray[i].rain / dailyDataArray[i].numRecords) * 24;
            dailyDataArray[i].rain = (dailyDataArray[i].rain * 1000) / 25.4;
            if (dailyDataArray[i].rain > maxDailyRain){
                maxDailyRain = dailyDataArray[i].rain;
            }
        }
        dailyRainTotalInches += dailyDataArray[i].rain;
    }
    return dailyRainTotalInches
}

function geolocate() {
    return new Promise((resolve, reject) => {  
        console.log('geolocate starting');
        //Check for geolocation capability
        if ('geolocation' in navigator) {
            console.log('geolocation available');
            navigator.geolocation.getCurrentPosition(position => {
                console.log(position.coords);
                lat = position.coords.latitude;
                lon = position.coords.longitude;
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
function createChart() {
    Chart.defaults.global.defaultFontSize = 28;
    let chartLabels = [];
    let chartData = [];
    let chartDataBg = [];
    for(i=0; i<numDays; i++){
        chartLabels[i] = dailyDataArray[numDays-i-1].date;
        chartData[i] = Math.round((dailyDataArray[numDays-i-1].rain + Number.EPSILON) * 100) / 100;
        chartDataBg[i] = 'rgba(24, 106, 168, 0.8)';
    }
    console.log(chartData);
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Inches',
                data: chartData,
                backgroundColor: chartDataBg
                // backgroundColor: [
                //     'rgba(255, 99, 132, 0.2)',
                //     'rgba(54, 162, 235, 0.2)',
                //     'rgba(255, 206, 86, 0.2)',
                //     'rgba(75, 192, 192, 0.2)',
                //     'rgba(153, 102, 255, 0.2)',
                //     'rgba(255, 159, 64, 0.2)'
                // ],
                //borderColor: 'rgba(255, 99, 132, 1)',
                //     'rgba(255, 99, 132, 1)',
                //     'rgba(54, 162, 235, 1)',
                //     'rgba(255, 206, 86, 1)',
                //     'rgba(75, 192, 192, 1)',
                //     'rgba(153, 102, 255, 1)',
                //     'rgba(255, 159, 64, 1)'
                // ],
                //borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            //devicePixelRatio: 4,
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Inches'
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }]
            }
        }
    });
}

function showPage() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("main").style.display = "block";
}

geolocate()
.then(fetchWeather)
.then(createChart);
setTimeout(showPage, 2000);
//setTimeout(function(){window.location='page2.html';},0);