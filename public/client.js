
const now = new Date()  
const secondsSinceEpoch = Math.round(now.getTime() / 1000) 

const createWeatherLi = (weather) => {
    const li = document.createElement('li');
    // add user details to `li`
    //li.textContent = `${weather.data[0].precipIntensity}`;
    //li.textContent = `${weather.features[0].properties.temperature.value}`;
    li.textContent = `${weather}`;
    return li;
};

const appendWeatherToDOM = (weather) => {
    const p = document.getElementById('summary');
    p.appendChild(createWeatherLi(weather));
};

const fetchWeather = async () => {
    let weather;
    const api_url = `weather`;
    try{
        const response = await fetch(api_url);
        const json = await response.json();
        //weather = json.daily;
        weather = json;
        console.log(weather);
        // append to DOM
        var rainTotalMeters = 0;
        for (i=0; i<weather.features.length; i++){
            appendWeatherToDOM(weather.features[i].properties.precipitationLastHour.value);
            rainTotalMeters += weather.features[i].properties.precipitationLastHour.value;
        }
        const rainTotalInches = (rainTotalMeters * 1000) / 25.4;
        const averageRainTotalInches = (rainTotalInches / weather.features.length) * 96;
        console.log(`Rain total (inches): ${rainTotalInches}`);
        console.log(`Average rain total (inches): ${averageRainTotalInches}`);
        
    } catch (error) {
        console.error(error);
      }
};

function geolocate(resolve, reject) {  
    if ('geolocation' in navigator) {
        console.log('geolocation available');
        navigator.geolocation.getCurrentPosition(position => {
            console.log(position.coords);
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            document.getElementById('latitude').textContent = lat.toFixed(2);
            document.getElementById('longitude').textContent = lon.toFixed(2);
            const data = {lat, lon, secondsSinceEpoch};
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            };
            fetch('/api', options)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                fetchWeather();
            });
        });                  
    } else {
        console.log('geolocation not available');
    }       
}
geolocate();


