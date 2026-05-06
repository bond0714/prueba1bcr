// API configuration
const API_KEY = 'a6a79f6f2c8c2e7f8e9f0f1a2b3c4d5e'; // Free tier API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');

// Event listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

// Initialize with default city
window.addEventListener('load', () => {
    fetchWeather('Madrid');
});

// Search weather function
function searchWeather() {
    const city = cityInput.value.trim();
    if (city === '') {
        showError('Por favor ingresa una ciudad');
        return;
    }
    fetchWeather(city);
    cityInput.value = '';
}

// Fetch weather data
async function fetchWeather(city) {
    try {
        hideError();
        weatherContainer.style.opacity = '0';

        // Fetch current weather
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
        );

        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                showError('Ciudad no encontrada. Por favor intenta con otro nombre.');
            } else {
                showError('Error al obtener datos del clima. Intenta más tarde.');
            }
            return;
        }

        const weatherData = await weatherResponse.json();

        // Fetch forecast data
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
        );
        const forecastData = await forecastResponse.json();

        // Update UI
        updateCurrentWeather(weatherData);
        updateForecast(forecastData);
        weatherContainer.style.opacity = '1';
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Verifica tu conexión a internet.');
    }
}

// Update current weather display
function updateCurrentWeather(data) {
    const { name, sys, main, weather, wind, clouds, visibility } = data;

    // City and date
    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('currentDate').textContent = getFormattedDate();

    // Temperature and weather
    document.getElementById('temperature').textContent = Math.round(main.temp);
    document.getElementById('description').textContent = weather[0].description;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

    // Details
    document.getElementById('windSpeed').textContent = (wind.speed * 3.6).toFixed(1) + ' km/h';
    document.getElementById('humidity').textContent = main.humidity + ' %';
    document.getElementById('feelsLike').textContent = Math.round(main.feels_like) + ' °C';
    document.getElementById('pressure').textContent = main.pressure + ' hPa';
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1) + ' km';
    document.getElementById('uvIndex').textContent = 'Datos disponibles';
}

// Update forecast display
function updateForecast(data) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get forecast for every 24 hours (8 * 3 = 24 hours, API returns data every 3 hours)
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = item;
        }
    });

    // Display first 5 days
    Object.values(dailyForecasts).slice(0, 5).forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });
        const tempMax = Math.round(item.main.temp_max);
        const tempMin = Math.round(item.main.temp_min);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="date">${day}</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="clima" class="forecast-icon">
            <div class="temp-range">
                <div class="temp-max">${tempMax}°C</div>
                <div class="temp-min">${tempMin}°C</div>
            </div>
            <div class="description">${description}</div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

// Helper functions
function getFormattedDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('es-ES', options);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}