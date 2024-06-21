"use strict";
const latitude = 37.0965;
const longitude = -113.5684;

const pointsUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

fetch(pointsUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const currentConditionsUrl = data.properties.observationStations;
    return fetch(currentConditionsUrl);
  })
  .then(response => response.json())
  .then(data => {
    const latestStationUrl = data.features[0].id;
    return fetch(`${latestStationUrl}/observations/latest`);
  })
  .then(response => response.json())
  .then(currentWeather => {
    const properties = currentWeather.properties;
    const temperature = properties.temperature.value * 9/5 + 32;
    const condition = properties.textDescription;
    const windSpeed = properties.windSpeed.value;
    const location = 'St. George, UT'; 

    document.getElementById('location').textContent = location;
    document.getElementById('temperature').textContent = `Temperature: ${temperature.toFixed(2)} °F`;
    document.getElementById('condition').textContent = `Condition: ${condition}`;
    document.getElementById('wind').textContent = `Wind: ${windSpeed.toFixed(2)} m/s`;
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

const zoneId = 'UTZ123';
const alertsUrl = `https://api.weather.gov/alerts/active/zone/${zoneId}`;

fetch(alertsUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(alertsData => {
    if (alertsData.features.length === 0) {
      document.getElementById('alerts').textContent = 'No current alerts in area';
    } else {
      const alerts = alertsData.features.map(alert => alert.properties.headline).join(', ');
      document.getElementById('alerts').textContent = `Alerts: ${alerts}`;
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

const wfo = 'SLC';
const x = 20;
const y = 19;
const forecastHourlyUrl = `https://api.weather.gov/gridpoints/${wfo}/${x},${y}/forecast/hourly`;

fetch(forecastHourlyUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(forecastData => {
    const periods = forecastData.properties.periods;
    const chartData = periods.map(period => ({
      Time: period.startTime,
      Temperature: period.temperature
    }));

    new Chart(
      document.getElementById('acquisitions'),
      {
        type: 'bar',
        data: {
          labels: chartData.map(data => data.Time),
          datasets: [
            {
              label: 'Temperature',
              data: chartData.map(data => data.Temperature)
            }
          ]
        }
      }
    );
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
