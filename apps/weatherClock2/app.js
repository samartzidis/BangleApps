const Layout = require("Layout");
const storage = require("Storage");
const locale = require("locale");

const SETTINGS_FILE = "weatherClock2.json";
const LOCATION_SETTINGS_FILE = "mylocation.json";

let s;

// Weather icons from https://icons8.com/icon/set/weather/color
function getSun() {
    return require("heatshrink").decompress(atob("mEwwhC/AH4AbhvQC6vd7ouVC4IwUCwIwUFwQwQCYgAHDZQXc9wACC6QWDDAgXN7wXF9oXPCwowDC5guGGAYXMCw4wCC5RGJJAZGTJBiNISIylQVJrLCC5owGF65fXR7AwBC5jvhC7JIILxapDFxAXOGAy9KC4owGBAQXODAgHDC54AHC8T0FAAQSOGg4qPGA4WUGAIuVC7AA/AH4AEA="));
}
function getPartSun() {
    return require("heatshrink").decompress(atob("mEwwhC/AH4AY6AWVhvdC6vd7owUFwIABFiYAFGR4Xa93u9oXTCwIYDC6HeC4fuC56MBC4ySOIwpIQXYQXHmYABRpwXECwQYKF5HjC4kwL5gQCAYYwO7wqFAAowK7wWKJBgXLJBPd6YX/AAoVMAAM/Cw0DC5yRHCx5JGFyAwGCyIwFC/4XyR4inXa64wRFwowQCw4A/AH4AkA"));
}
function getCloud() {
    return require("heatshrink").decompress(atob("mEwwhC/AH4A/AH4AtgczmYWWDCgWDmcwIKAuEGBoSGGCAWKC7BIKIxYX6CpgABn4tUSJIWPJIwuQGAwWRGAoX/C+SPEU67XXGCIuFGCAWHAH4A/AH4A/ADg="));
}
function getSnow() {
    return require("heatshrink").decompress(atob("mEwwhC/AH4AhxGAC9YUBC4QZRhAVBAIWIC6QAEI6IYEI5cIBgwWOC64NCKohHPNox3RBgqnQEo7XPHpKONR5AXYAH4ASLa4XWXILiBC6r5LDBgWWDBRrKC5hsCEacIHawvMCIwvQC5QvQFAROEfZ5ADLJ4YGCywvVI7CPGC9IA/AH4AF"));
}
function getRain() {
    return require("heatshrink").decompress(atob("mEwwhC/AH4AFgczmYWWDCgWDmcwIKAuEGBoSGGCAWKC7BIKIxYX6CpgABn4tUSJIWPJIwuQGAwWRGAoX/C+SPEU67XXGCIuFGCAWHAGeIBJEIwAVJhGIC5AJBC5QMJEJQMEC44JBC6QSCC54FHLxgNBBgYSEDgKpPMhQXneSwuUAH4A/AA4="));
}
function getStorm() {
    return require("heatshrink").decompress(atob("mEwwhC/AFEzmcwCyoYUgYXDmYuVGAY0OFwocHC6pNLCxYXYJBQXuCxhhJRpgYKCyBKFFyIXFCyJIFC/4XaO66nU3eza6k7C4IWFGBwXBCwwwO3ewC5AZMC6RaCIxZiI3e7AYYwRCQIIBC4QwPIQIpDC5owDhYREIxgAEFIouNC4orDFyBGBGAcLC6BaFhYWRLSRIFISQXcCyqhRAH4Az"));
}
// err icon - https://icons8.com/icons/set/error
function getErr() {
    return require("heatshrink").decompress(atob("mEwwkBiIA/AH4AZUAIWUiAXBWqgXXdIYuVGCgXBgICCIyYXCJCQTDC6QrEMCQSEJCQRFC6ApGJCCiDDQSpQFAYXEJBqNGJCA/EC4ZIOEwgXFJBgNEAhKlNAgxIKBgoXEJBjsLC5TsIeRycMBhRrMMBKzQEozjOBxAgHGww+IA6wfSH4hnIC47OMSJqlRIJAXCACIXaGoQARPwwuTAH4A/ABw"));
}
function getDummy() {
    return require("heatshrink").decompress(atob("gMBwMAwA"));
}

// Code	Description (https://open-meteo.com/en/docs)
// 0	Clear sky
// 1, 2, 3	Mainly clear, partly cloudy, and overcast
// 45, 48	Fog and depositing rime fog
// 51, 53, 55	Drizzle: Light, moderate, and dense intensity
// 56, 57	Freezing Drizzle: Light and dense intensity
// 61, 63, 65	Rain: Slight, moderate and heavy intensity
// 66, 67	Freezing Rain: Light and heavy intensity
// 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
// 77	Snow grains
// 80, 81, 82	Rain showers: Slight, moderate, and violent
// 85, 86	Snow showers slight and heavy
// 95 *	Thunderstorm: Slight or moderate
// 96, 99 *	Thunderstorm with slight and heavy hail

// Selects the weather icon based on weathercode
// Selects the weather icon based on weather code
function chooseIconByCode(code) {
    switch (code) {
        case 0:
            return getSun(); // Clear sky
        case 1: 
        case 2: 
        case 3:
            return getPartSun(); // Mainly clear, partly cloudy, overcast
        case 45: 
        case 48:
            return getFog(); // Fog and depositing rime fog
        case 51: 
        case 53: 
        case 55: 
        case 56: 
        case 57:
            return getRain(); // Drizzle or freezing drizzle
        case 61: 
        case 63: 
        case 65:
            return getRain(); // Rain
        case 66: 
        case 67:
            return getSnow(); // Freezing rain (treated as snow)
        case 71: 
        case 73: 
        case 75:
            return getSnow(); // Snowfall
        case 80: 
        case 81: 
        case 82:
            return getRain(); // Rain showers
        case 85: 
        case 86:
            return getSnow(); // Snow showers
        case 95: 
        case 96: 
        case 99:
            return getStorm(); // Thunderstorm or thunderstorm with hail
        default:
            return getCloud(); // Fallback for other weather codes
    }
}


// Timeout for weather updates (30 minutes) and UI updates (1 minute)
var timeTimeout;
var weatherTimeout;
var weatherUpdateErrors = 0;

// Schedule the next draw in one minute
function queueFetchTime() {
  
    if (timeTimeout) 
      clearTimeout(timeTimeout);
  
    timeTimeout = setTimeout(function () {
        timeTimeout = undefined;
        fetchTime();
    }, 60000 - (Date.now() % 60000));
}

// Schedule the next weather update
function queueWeatherUpdate() {
  
    if (weatherTimeout)
        clearTimeout(weatherTimeout);

    weatherTimeout = setTimeout(function () {
        fetchWeather();
    }, weatherUpdateErrors == 0 ? 1800000 : 60000); // 30 minutes = 1800000 msec, 1 minute = 60000 msec
}

/*
function dbgText(text) {
    g.clear();
    g.setFont('Vector', 10);
    var x = 0;
    var y = 10;
    var lineHeight = 12; // adjust as necessary for spacing between lines
    var maxWidth = g.getWidth(); // maximum width for wrapping
    wrapText(g, text, x, y, lineHeight, maxWidth);
}

function wrapText(g, text, x, y, lineHeight, maxWidth) {
    var line = '';
    
    for (var i = 0; i < text.length; i++) {
        var testLine = line + text[i];
        var testWidth = g.stringWidth(testLine);
        
        if (testWidth > maxWidth) {
            g.drawString(line, x, y); // Draw the current line
            line = text[i];           // Start a new line with the current character
            y += lineHeight;          // Move to the next line height
        } else {
            line = testLine;          // Keep adding characters to the current line
        }
    }
    g.drawString(line, x, y); // Draw any remaining text
}
*/

// Function to fetch weather data from Open-Meteo API
function fetchWeather() {

    // Fetch location settings
    let locationSettings = require('Storage').readJSON(LOCATION_SETTINGS_FILE, 1) || { lat: 0, lon: 0, location: "" };
    if (locationSettings.lat == 0 || locationSettings.lon == 0) {
        console.log("No GPS");

        weatherLastUpdateSuccess = false;

        cLayout.wind.label = cLayout.temp.label = "No GPS";
        cLayout.wIcon.src = getErr;

        //cLayout.clear();
        //cLayout.render();

        // Queue the next weather update
        queueWeatherUpdate();
    }

    let uri = `https://api.open-meteo.com/v1/forecast?latitude=${locationSettings.lat}&longitude=${locationSettings.lon}&current_weather=true`;
    Bangle.http(uri, {
        timeout: 10000,
        headers: { Accept: "*/*" }
    })
    .then(data => {

        console.log("Got weather data: ", data);

        weatherUpdateErrors = 0;

        //let text = JSON.stringify(data);    
        let weatherData = JSON.parse(data.resp);

        let temp = locale.temp(weatherData.current_weather.temperature);
        let wind = locale.speed(weatherData.current_weather.windspeed);
        let weatherCode = weatherData.current_weather.weathercode;

        // Update layout with fetched weather data
        cLayout.temp.label = temp;
        cLayout.wind.label = wind;
        cLayout.wIcon.src = s.icon ? chooseIconByCode(weatherCode) : getDummy;

        // Queue the next weather update in 30 minutes
        queueWeatherUpdate();

    })
    .catch(err => {

        console.log("Error fetching weather: ", err);

        weatherUpdateErrors++;
        console.log("weatherUpdateErrors: ", weatherUpdateErrors);
      
        if (weatherUpdateErrors >= 10) {
          
          cLayout.temp.label = "Error";
          cLayout.wind.label = "Error";
          cLayout.wIcon.src = getErr;
          
          //cLayout.clear();
          //cLayout.render();
        }

        // Queue the next weather update
        queueWeatherUpdate();
    });

    cLayout.render();
}

function fetchTime() {
  
    var date = new Date();
  
    cLayout.time.label = locale.time(date, 1);
    cLayout.dow.label = s.day ? locale.dow(date, 1).toUpperCase() + " " : "";
    cLayout.date.label = s.date ? locale.date(date, 1).toUpperCase() : "";
    
    cLayout.clear();
    cLayout.render();

    // Queue in one minute
    queueFetchTime();
}

// Load settings from file
s = storage.readJSON(SETTINGS_FILE, 1) || {};
s.src = s.src === undefined ? false : s.src;
s.icon = s.icon === undefined ? true : s.icon;
s.day = s.day === undefined ? true : s.day;
s.date = s.date === undefined ? true : s.date;
s.wind = s.wind === undefined ? true : s.wind;

let srcIcons = s.src ? wDrawIcon(800) : getSun;
let srcWeather = s.icon ? srcIcons : getDummy;

let fontTemp = s.wind ? "10%" : "20%";
let fontWind = s.wind ? "10%" : "0%";

let labelDay = s.day ? "THU" : "";
let labelDate = s.date ? "01/01/1970" : "";

var cLayout = new Layout({
    type: "v", c: [
        { type: "txt", font: "35%", halign: 1, fillx: 1, pad: 0, label: "00:00", id: "time" },
        {
            type: "v", fillx: 1, c: [ // Changed "h" to "v" to stack day and date vertically
                { type: "txt", font: "20%", label: labelDay, id: "dow", halign: 1 },   // Day on one line
                { type: "txt", font: "15%", label: labelDate, id: "date", halign: 1 }  // Date on the next line
            ]
        },
        {
            type: "h", valign: 1, fillx: 1, c: [
                { type: "img", filly: 1, pad: 8, id: "wIcon", src: srcWeather },
                {
                    type: "v", fillx: 1, c: [
                        {
                            type: "h", c: [
                                { type: "txt", font: fontTemp, id: "temp", label: "- °C" },
                            ]
                        },
                        {
                            type: "h", c: [
                                { type: "txt", font: fontWind, id: "wind", label: "- km/h" },
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

// Initial render and fetch
g.clear();
Bangle.setUI("clock");  // Show launcher when middle button pressed
Bangle.loadWidgets();
Bangle.drawWidgets();

cLayout.render();

fetchWeather();
fetchTime();

















