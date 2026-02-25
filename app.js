/**
 * PART 3: WeatherApp Constructor Function
 * Used to organize code into an Object-Oriented structure.
 */
function WeatherApp() {
    // PART 1: Initial API Data
    this.apiKey = CONFIG.API_KEY;
    this.currentUrl = 'https://api.openweathermap.org/data/2.5/weather';
    // PART 3: Forecast Endpoint
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // PART 3: DOM References (stored once for performance)
    this.cityInput = document.getElementById('city-input');
    this.searchBtn = document.getElementById('search-btn');
    this.displayArea = document.getElementById('weather-display');

    // PART 4: Recent Search DOM References
    this.recentPills = document.getElementById('recent-pills');
    this.recentContainer = document.getElementById('recent-searches-container');
    this.clearBtn = document.getElementById('clear-history');

    // PART 4: Initialize recentSearches from LocalStorage
    this.recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    // Boot the app
    this.init();
}

/**
 * PART 3 & 4: Init Method
 */
WeatherApp.prototype.init = function() {
    // PART 2: Click Event (Refactored in P3 with .bind to keep 'this' context)
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    
    // PART 2 BONUS: Enter key support
    this.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSearch();
    });

    // PART 4: Clear History Event
    this.clearBtn.addEventListener('click', this.clearHistory.bind(this));

    // PART 4: UI Initialization
    this.displayRecentSearches();
    this.loadLastCity();
};

/**
 * PART 4: LocalStorage & Persistence Logic (NEW)
 */
WeatherApp.prototype.saveRecentSearch = function(city) {
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    
    // Remove duplicates and add to front
    this.recentSearches = this.recentSearches.filter(c => c !== formattedCity);
    this.recentSearches.unshift(formattedCity);
    
    // Limit to 5 cities
    if (this.recentSearches.length > 5) this.recentSearches.pop();

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    localStorage.setItem('lastCity', formattedCity);
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function() {
    if (this.recentSearches.length === 0) {
        this.recentContainer.style.display = 'none';
        return;
    }
    this.recentContainer.style.display = 'block';
    this.recentPills.innerHTML = '';
    
    this.recentSearches.forEach(city => {
        const pill = document.createElement('button');
        pill.className = 'city-pill';
        pill.textContent = city;
        pill.onclick = () => this.getWeatherData(city); // Quick search on click
        this.recentPills.appendChild(pill);
    });
};

WeatherApp.prototype.loadLastCity = function() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) this.getWeatherData(lastCity);
    else this.showWelcome();
};

WeatherApp.prototype.clearHistory = function() {
    localStorage.clear();
    this.recentSearches = [];
    this.displayRecentSearches();
    this.showWelcome();
};

/**
 * PART 2 & 3: API Logic (Refactored to Async/Await & Promise.all)
 */
WeatherApp.prototype.getWeatherData = async function(city) {
    this.showLoading();
    
    try {
        // PART 3: Fetching Current AND Forecast simultaneously
        const [current, forecast] = await Promise.all([
            axios.get(`${this.currentUrl}?q=${city}&appid=${this.apiKey}&units=metric`),
            axios.get(`${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`)
        ]);

        this.displayArea.innerHTML = ''; // Clear display
        this.displayCurrentWeather(current.data); // Render P1/P2 logic
        this.displayForecast(forecast.data);    // Render P3 logic
        this.saveRecentSearch(city);            // Trigger P4 logic

    } catch (error) {
        this.showError("City not found. Please try again.");
    }
};

/**
 * PART 1 & 2: Display Logic (Converted to Prototype in P3)
 */
WeatherApp.prototype.displayCurrentWeather = function(data) {
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    this.displayArea.innerHTML += `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img src="${icon}" class="weather-icon">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
        <hr><h3 style="margin: 20px 0;">5-Day Forecast</h3>
    `;
};

/**
 * PART 3: Forecast Logic
 */
WeatherApp.prototype.displayForecast = function(data) {
    const grid = document.createElement('div');
    grid.className = 'forecast-grid';
    
    // Filter to get one snapshot per day (at 12:00 PM)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        grid.innerHTML += `
            <div class="forecast-card">
                <p><strong>${date}</strong></p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.main.temp)}°C</p>
            </div>
        `;
    });
    this.displayArea.appendChild(grid);
};

/**
 * PART 2: UI States
 */
WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();
    if (city) this.getWeatherData(city);
    this.cityInput.value = '';
};

WeatherApp.prototype.showWelcome = function() {
    this.displayArea.innerHTML = `<p>Search for a city to see weather updates!</p>`;
};

WeatherApp.prototype.showLoading = function() {
    this.displayArea.innerHTML = `<div class="spinner"></div><p>Searching...</p>`;
};

WeatherApp.prototype.showError = function(msg) {
    this.displayArea.innerHTML = `<div class="error-message">⚠️ ${msg}</div>`;
};

// INITIALIZE THE APP
const app = new WeatherApp();