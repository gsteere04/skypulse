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
const x = 19;
const y = 20;
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
    const chartData = periods.slice(0, 24).map(period => ({
      Time: new Date(period.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      Temperature: period.temperature
    }));

    new Chart(
      document.getElementById('24HourForecast'),
      {
        type: 'bar',
        options: {
          aspectRatio: 1.5,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time',
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              title: {
                display: true,
                text: 'Temperature (°F)'
              },
              suggestedMin: 0,
              suggestedMax: 120
            }
          },
          plugins: {
            title: {
              display: true,
              text: '24-Hour Temperature Forecast'
            }
          }
        },
        data: {
          labels: chartData.map(data => data.Time),
          datasets: [
            {
              label: 'Temperature',
              data: chartData.map(data => data.Temperature),
              borderColor: 'rgba(75,192,192,0.2)',
              tension: 0.1
            }
          ]
        }
      }
    );
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.questionBtn').addEventListener('click', function () {
    showMessageBox('question');
  });
  document.querySelector('.feedbackBtn').addEventListener('click', function () {
    showMessageBox('feedback');
  });
  document.querySelector('.bugReportBtn').addEventListener('click', function () {
    showMessageBox('bugreport');
  });

  function showMessageBox(type) {
    document.querySelectorAll('.message-box').forEach(box => {
      box.style.display = 'none';
    });
    document.getElementById(type).style.display = 'block';
  }
});
