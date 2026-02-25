function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-container");

    this.init();
}

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            this.handleSearch();
        }
    });

    this.showWelcome();
};

WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="weather-card">
            <h2>🌍 Welcome to SkyFetch</h2>
            <p>Search for a city to see weather and 5-day forecast.</p>
        </div>
    `;
};

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();
    this.searchBtn.disabled = true;

    const currentUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const forecastUrl =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] =
            await Promise.all([
                axios.get(currentUrl),
                axios.get(forecastUrl)
            ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData.data);

    } catch (error) {
        if (error.response && error.response.status === 404) {
            this.showError("City not found.");
        } else {
            this.showError("Something went wrong.");
        }
    } finally {
        this.searchBtn.disabled = false;
    }
};

WeatherApp.prototype.displayWeather = function (data) {

    const iconUrl =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-card">
            <h2>${data.name}</h2>
            <img src="${iconUrl}">
            <p>🌡 Temperature: ${Math.round(data.main.temp)}°C</p>
            <p>☁ ${data.weather[0].description}</p>
        </div>
    `;
};

WeatherApp.prototype.processForecastData = function (data) {
    return data.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);
};

WeatherApp.prototype.displayForecast = function (data) {

    const days = this.processForecastData(data);

    const forecastHTML = days.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <p>${Math.round(day.main.temp)}°C</p>
            </div>
        `;
    }).join("");

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
};

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
};

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h2>❌ Error</h2>
            <p>${message}</p>
        </div>
    `;
};

const app = new WeatherApp("7d55fcc79bcb1ed8b22df1d0e3ae92b7");