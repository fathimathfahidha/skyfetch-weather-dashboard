/* =========================
   PART 1 CODE (Original)
========================= */

// Step 1: Add your API key
const apiKey = "7d55fcc79bcb1ed8b22df1d0e3ae92b7";

// Step 2: Choose a city
const city = "London";

// Step 3: Create API URL
const url =
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

// Step 4: Fetch weather data
axios.get(url)
.then(function(response) {

    const data = response.data;

    document.getElementById("city").textContent = data.name;

    document.getElementById("temperature").textContent =
        "Temperature: " + data.main.temp + "°C";

    document.getElementById("description").textContent =
        data.weather[0].description;

    const iconCode = data.weather[0].icon;

    document.getElementById("icon").src =
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

})
.catch(function(error) {
    console.log("Error:", error);
});


/* =========================
   PART 2 CODE (Async/Await)
========================= */

const API_KEY = "7d55fcc79bcb1ed8b22df1d0e3ae92b7";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDisplay = document.getElementById("weather-display");

weatherDisplay.innerHTML = `
    <div class="weather-card">
        <h2>🌍 Welcome to SkyFetch</h2>
        <p>Enter a city name to get started!</p>
    </div>
`;

async function getWeather(city) {

    showLoading();

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);

    } catch (error) {
        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            showError("City not found. Please check spelling.");
        } else {
            showError("Something went wrong. Try again later.");
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
    }
}

function displayWeather(data) {
    const weatherHTML = `
        <div class="weather-card">
            <h2>${data.name}</h2>
            <p>🌡 Temperature: ${data.main.temp}°C</p>
            <p>☁ ${data.weather[0].description}</p>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
        </div>
    `;
    weatherDisplay.innerHTML = weatherHTML;
    cityInput.focus();
}

function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <h2>❌ Error</h2>
            <p>${message}</p>
        </div>
    `;
}

function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
}

searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("City name too short.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
});

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});