import {GM_KEY,W_KEY} from './variables.js'

// const GM_KEY = 'AIzaSyBuTKkWjSTUp4fthdPhjcR59Uq3Igfls5Y'
// const W_KEY = '116eaa04c090215dcee81c9a5aeb676c'

console.log("HELLO WORLD")

/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Google Map API



let map;
let marker;
let geocoder;
let responseDiv;
let response;
let myLat = document.getElementById('lat');
let myLng = document.getElementById('lng');

const successCallback = (position) => {
  myLat = position.coords.latitude
  myLng = position.coords.longitude
};

const errorCallback = (error) => {
  console.log(error);
  return false;
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback)

const initMap = (latitude,longitude) => {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    // center: { lat: -34.397, lng: 150.644 },
    center: { lat: parseFloat(myLat), lng: parseFloat(myLng) },
    mapTypeControl: false,
  });

  // getLocation()

  geocoder = new google.maps.Geocoder();

  const inputText = document.createElement("input");

  inputText.type = "text";
  inputText.placeholder = "Enter a location";

  const submitButton = document.createElement("input");

  submitButton.type = "button";
  submitButton.value = "Get Weather";
  submitButton.classList.add("button", "button-primary");

  

  const clearButton = document.createElement("input");

  clearButton.type = "button";
  clearButton.value = "Clear";
  clearButton.classList.add("button", "button-secondary");

  const instructionsElement = document.createElement("p");

  instructionsElement.id = "instructions";
  instructionsElement.innerHTML =
    "<strong>Instructions</strong>: Enter an address in the textbox or click on the map to find the weather for the location.";
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputText);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitButton);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearButton);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(
    instructionsElement
  );
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(responseDiv);
  marker = new google.maps.Marker({
    map,
  });
  map.addListener("click", async (e) => {
    const results = await geocode({ location: e.latLng })
    inputText.value = results.lat.toString() + ' ' + results.lng.toString()
  });
  
  const getCoord = async () => {
    let coordinates = await geocode({ address: inputText.value });
    return coordinates;
  };

  const getWeather = async (latitude,longitude) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${W_KEY}&units=imperial`;
  
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };

  const visibility = (distance) => {
    return (distance/1000).toFixed(2);
  };

  const windDirection = (degrees) => {
    if (degrees >= 348.75 || degrees < 11.25){
      return 'N'
    }
    else if (degrees >= 11.25 || degrees < 33.75) {
      return 'NNE'
    }
    else if (degrees >= 33.75 || degrees < 56.25) {
      return 'NE'
    }
    else if (degrees >= 56.25 || degrees < 78.75) {
      return 'ENE'
    }
    else if (degrees >= 78.75 || degrees < 101.25) {
      return 'E'
    }
    else if (degrees >= 101.25 || degrees < 123.75) {
      return 'ESE'
    }
    else if (degrees >= 123.75 || degrees < 146.25) {
      return 'SE'
    }
    else if (degrees >= 146.25 || degrees < 168.75) {
      return 'SSE'
    }
    else if (degrees >= 168.75 || degrees < 191.25) {
      return 'S'
    }
    else if (degrees >= 191.25 || degrees < 213.75) {
      return 'SSW'
    }
    else if (degrees >= 213.75 || degrees < 236.25) {
      return 'SW'
    }
    else if (degrees >= 236.25 || degrees < 258.75) {
      return 'WSW'
    }
    else if (degrees >= 258.75 || degrees < 281.25) {
      return 'W'
    }
    else if (degrees >= 281.25 || degrees < 303.75) {
      return 'WNW'
    }
    else if (degrees >= 303.75 || degrees < 326.25) {
      return 'NW'
    }
    else {
      return 'NNW'
    }
  };

  let modalWrap = null;
  const showWeatherModal = (location) => {

    if(modalWrap !== null) {
      modalWrap.remove();
    }

    modalWrap = document.createElement('div');
    modalWrap.innerHTML = `
      <div id="weatherModal" class="modal modal-dialog-scrollable fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Current Weather in ${location.name}, ${location.sys.country}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Current Temp: ${location.main.temp} °F</p>
              <p>Feels Like: ${location.main.feels_like} °F</p>
              <p>Humidity: ${location.main.humidity}%</p>
              <p>Visibility: ${visibility(location.visibility)}km</p>
              <p>Wind Speed: ${location.wind.speed}mph</p>
              <p>Wind Direction: ${windDirection(location.wind.deg)}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.append(modalWrap);

    const weatherModal = new bootstrap.Modal(document.getElementById('weatherModal'))
    weatherModal.show();
  }

  submitButton.addEventListener("click", async () => {
    const coords = await getCoord()
    const weather = await getWeather(coords.lat,coords.lng)
    showWeatherModal(weather)
  });

  clearButton.addEventListener("click", () => {
    clear();
  });
  clear();
}

const clear = () => {
  marker.setMap(null);
}

const geocode = async (request) => {
  clear();
  const result = await geocoder.geocode(request)
    .catch((e) => {
      alert("Geocode was not successful for the following reason: " + e);
    });

  const { results } = result;

  map.setCenter(results[0].geometry.location);
  marker.setPosition(results[0].geometry.location);
  marker.setMap(map);
  let stringResult = JSON.stringify(result, null, 2);
  let jsonResult = JSON.parse(stringResult)
  return jsonResult.results[0].geometry.location;
}

(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GM_KEY}&callback=initMap&v=weekly`
  script.defer = true
  document.body.append(script)
})()

window.initMap = initMap;