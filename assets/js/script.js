/* Variables used for weather dashboard application */
const apiKey = '7bd3d1902bc235922776583ac0adc2ac';
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
