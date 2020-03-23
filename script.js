const createLi = (user) => {
    const li = document.createElement('li');
    // add user details to `li`
    li.textContent = `${user.id}: ${user.first_name} ${user.last_name}`;
    return li;
};

const createWeatherLi = (weather) => {
    const li = document.createElement('li');
    // add user details to `li`
    li.textContent = `${weather.minutely.summary}`;
    return li;
};

const appendToDOM = (users) => {
    const ul = document.querySelector('ul');
    //iterate over all users
    users.map(user => {
        ul.appendChild(createLi(user));
    });
};

const appendWeatherToDOM = (weather) => {
    const p = document.querySelector('p');
    p.appendChild(createWeatherLi(weather));
};

const fetchUsers = () => {
    axios.get('https://reqres.in/api/users')
        .then(response => {
            const users = response.data.data;
            console.log(`GET list users`, users);
            // append to DOM
            appendToDOM(users);
        })
        .catch(error => console.error(error));
};

const fetchWeather = () => {
    axios.get('https://api.darksky.net/forecast/84bf8dba2301b12fb20120c993d6b0d6/42.3601,-71.0589')
        .then(response => {
            const weather = response.data;
            console.log(`GET weather`, weather);
            // append to DOM
            appendWeatherToDOM(weather);
        })
        .catch(error => console.error(error));
};

const createUser = (user) => {
    axios.post('https://reqres.in/api/users', user)
        .then(response => {
            const addedUser = response.data;
            console.log(`POST: user is added`, addedUser);
            // append to DOM
            appendToDOM([addedUser]);
        })
        .catch(error => console.error(error));
};

const form = document.querySelector('form');

const formEvent = form.addEventListener('submit', event => {
    event.preventDefault();

    const first_name = document.querySelector('#first_name').value;
    const last_name = document.querySelector('#last_name').value;

    const user = { first_name, last_name };
    createUser(user);
});

fetchUsers();
fetchWeather();
