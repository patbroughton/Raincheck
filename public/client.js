
const createWeatherLi = (weather) => {
    const li = document.createElement('li');
    // add user details to `li`
    li.textContent = `${weather.summary}`;
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
        weather = json.currently;
        console.log(weather);
        // append to DOM
        appendWeatherToDOM(weather);
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
            const data = {lat, lon};
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


