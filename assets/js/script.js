require('dotenv').config();
/* Variables used for weather dashboard application */
const apiKey = process.env.OPEN_WEATHER_API_KEY;
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentConditionsList = document.getElementById('current-conditions-list');
const fiveDayForecastList = document.getElementById('five-day-forecast-list');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history-button');
const historyData = JSON.parse(localStorage.getItem('searchHistory')) || [];

/* Search form with variable for City */
searchForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const city = cityInput.value;
  searchCity(city);
});

/* Function for Searching of City */
function searchCity(city) {
  const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  /* Fetching for Api URL for Geocoding */
  fetch(geocodingApiUrl)
    .then(response => response.json())
    .then(data => {
      /* If statement for data.length and variables */
      if (data.length > 0) {
        const cityName = data[0].name;
        const latitude = data[0].lat;
        const longitude = data[0].lon;
        const currentConditionsUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`;
        const fiveDayForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        /* Responses when performing fetch for current conditions and five day forecast */
        const currentConditionsPromise = fetch(currentConditionsUrl).then(response => response.json());
        const fiveDayForecastPromise = fetch(fiveDayForecastUrl).then(response => response.json());

        return Promise.all([currentConditionsPromise, fiveDayForecastPromise, cityName]);
      } else {
        throw new Error('City not found');
      }
    })

    /* Console loggging for Current Conditions + Five Day Forecast */
    .then(([currentConditionsData, fiveDayForecastData, cityName]) => {
      console.log('Current Conditions Data:', currentConditionsData);
      console.log('Five-Day Forecast Data:', fiveDayForecastData);
    /* Error conditions */
      if (!currentConditionsData || !currentConditionsData.main || !currentConditionsData.main.temp || !currentConditionsData.weather || !currentConditionsData.weather[0]) {
        throw new Error('Invalid current conditions data');
      }
      /* Variables needed for displaying data */
      const temperature = currentConditionsData.main.temp;
      const weatherDescription = currentConditionsData.weather[0].description;
      const iconCode = currentConditionsData.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
      const windSpeed = currentConditionsData.wind.speed;
      const humidity = currentConditionsData.main.humidity;
      /* Current Conditions List */
      currentConditionsList.innerHTML = '';

      const currentConditionsItem = document.createElement('li');
      currentConditionsItem.innerHTML = `<strong>City:</strong> ${cityName}<br>
                                          <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                                          <img src="${iconUrl}" alt="${weatherDescription}" />
                                          <strong>Temperature:</strong> ${temperature}°C, ${weatherDescription}<br>
                                          <strong>Wind Speed:</strong> ${windSpeed} m/s<br>
                                          <strong>Humidity:</strong> ${humidity}%`;

      currentConditionsList.appendChild(currentConditionsItem);

      const forecastList = fiveDayForecastData.list || []; // Assign forecastList correctly
      /* Five Days Forecast List */
      fiveDayForecastList.innerHTML = ''; // Clear previous forecast content

      let currentDate = new Date().setHours(0, 0, 0, 0); // Get current date without time
      let uniqueDates = new Set(); // Set to store unique forecast dates
      let dayCount = 0; // Counter for the number of forecasted days

      for (const day of forecastList) {
        const date = new Date(day.dt * 1000);
        const forecastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).setHours(0, 0, 0, 0);

        // Skip the current day and past days
        if (forecastDate <= currentDate) {
            continue;
          }
  
          // Skip duplicate dates
          if (uniqueDates.has(forecastDate)) {
            continue;
          }
  
          uniqueDates.add(forecastDate);
          // Variables needed for data to display
          const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
          const temperature = day.main.temp;
          const weatherDescription = day.weather[0].description;
          const iconCode = day.weather[0].icon;
          const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
          const windSpeed = day.wind.speed;
          const humidity = day.main.humidity;
  
          const forecastItem = document.createElement('li');
          forecastItem.classList.add('day-box');
          forecastItem.innerHTML = `<img src="${iconUrl}" alt="${weatherDescription}" />
                                    <strong>${formattedDate}</strong><br>
                                    <span>${weatherDescription}</span><br>
                                    <strong>Temperature:</strong> ${temperature}°C<br>
                                    <strong>Wind Speed:</strong> ${windSpeed} m/s<br>
                                    <strong>Humidity:</strong> ${humidity}%`;
  
          fiveDayForecastList.appendChild(forecastItem);
  
          dayCount++;
  
          // Stop iterating once you reach 5 days
          if (dayCount >= 5) {
            break;
          }
        }

      // Save search history
      historyData.unshift(city);
      localStorage.setItem('searchHistory', JSON.stringify(historyData));
      updateSearchHistory();

      // Clear input field
      cityInput.value = '';
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}
// Clear History event listener
clearHistoryButton.addEventListener('click', function() {
  historyData.length = 0;
  localStorage.removeItem('searchHistory');
  updateSearchHistory();
});
// Function for updating Search history
function updateSearchHistory() {
  historyList.innerHTML = '';
  historyData.forEach(city => {
    const historyItem = document.createElement('li');
    historyItem.textContent = city;
    historyItem.addEventListener('click', () => {
      searchCity(city);
    });
    historyList.appendChild(historyItem);
  });
}

updateSearchHistory();