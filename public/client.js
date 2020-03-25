
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

fetchWeather();


