
 // Dark Mode
const themeToggle=document.getElementById("theme-toggle");
const themeIcon=document.getElementById("theme-icon");
function applyTheme(theme){
    document.body.classList.toggle("dark-mode",theme==="dark");
    themeIcon.className=theme==="dark"?"fa-solid fa-sun":"fa-solid fa-moon";
    themeToggle.setAttribute("aria-label",theme==="dark"?"Switch to light mode":"Switch to dark mode");
    localStorage.setItem("weather-theme",theme);
}
applyTheme(localStorage.getItem("weather-theme")||"light");
themeToggle.addEventListener("click",()=>applyTheme(document.body.classList.contains("dark-mode")?"light":"dark"));
// DOM Elements
const searchForm=document.querySelector(".search-form");
const cityInput=document.getElementById("city-input");
const cityName=document.getElementById("city-name");
const temperature=document.getElementById("temperature");
const weatherCondition=document.getElementById("weather-condition");
const humidity=document.getElementById("humidity");
const windSpeed=document.getElementById("wind-speed");
const weatherIcon=document.getElementById("weather-icon");
const loadingSection=document.getElementById("loading");
const errorSection=document.getElementById("error");
const weatherSection=document.querySelector(".weather-section");
const weatherImage=document.getElementById("weather-image");
const forecastSection=document.getElementById("forecast-section");
const forecastGrid=document.getElementById("forecast-grid");
const currentLocationBtn=document.getElementById("current-location-btn");
const clearSearch=document.getElementById("clear-search");
const recentSection = document.getElementById("recent-section");
const recentList = document.getElementById("recent-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// Error Message
function showError(title,message){
    errorSection.querySelector("h3").textContent=title;
    errorSection.querySelector("p").textContent=message;
    errorSection.style.display="block";
}
// Weather Description
function getWeatherDescription(code){
    if(code===0)return "Clear Sky";
    if(code===1)return "Mainly Clear";
    if(code===2)return "Partly Cloudy";
    if(code===3)return "Overcast";
    if([45,48].includes(code))return "Foggy";
    if([51,53,55,56,57].includes(code))return "Drizzle";
    if([61,63,65,66,67,80,81,82].includes(code))return "Rainy";
    if([71,73,75,77,85,86].includes(code))return "Snowy";
    if([95,96,99].includes(code))return "Thunderstorm";
    return "Weather Unavailable";
}
// Weather Icon
function getWeatherIcon(code){
    if(code===0)return "fa-solid fa-sun";
    if([1,2].includes(code))return "fa-solid fa-cloud-sun";
    if(code===3)return "fa-solid fa-cloud";
    if([45,48].includes(code))return "fa-solid fa-smog";
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return "fa-solid fa-cloud-rain";
    if([71,73,75,77,85,86].includes(code))return "fa-solid fa-snowflake";
    if([95,96,99].includes(code))return "fa-solid fa-cloud-bolt";
    return "fa-solid fa-cloud";
}
// Weather Image
function getWeatherImage(code){
    if(code===0)return "images/clear-sky.png";
    if(code===1)return "images/clear-sky.png";
    if(code===2)return "images/partly-cloudy.png";
    if(code===3)return "images/cloudy.png";
    if([45,48].includes(code))return "images/mist.png";
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return "images/rainy.png";
    if([71,73,75,77,85,86].includes(code))return "images/snow.png";
    if([95,96,99].includes(code))return "images/thunderstorm.png";
    return "images/cloudy.png";
}
// Render 5-Day Forecast
function renderForecast(daily){
    if(!daily||!daily.time||!daily.weather_code){
        throw new Error("Forecast data is unavailable.");
    }
    forecastGrid.innerHTML="";
    daily.time.forEach((date,index)=>{
        const code=daily.weather_code[index];
        const formattedDate=new Date(date+"T00:00:00").toLocaleDateString("en-IN",{
            weekday:"short",
            day:"numeric",
            month:"short"
        });
        const card=document.createElement("div");
        card.className="forecast-card";
        const dateElement=document.createElement("p");
        dateElement.className="forecast-date";
        dateElement.textContent=formattedDate;
        const image=document.createElement("img");
        image.className="forecast-icon";
        image.src=getWeatherImage(code);
        image.alt=getWeatherDescription(code);
        const temperatureElement=document.createElement("p");
        temperatureElement.className="forecast-temperature";
        temperatureElement.textContent=`${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°C`;
        const conditionElement=document.createElement("p");
        conditionElement.className="forecast-condition";
        conditionElement.textContent=getWeatherDescription(code);
        card.append(dateElement,image,temperatureElement,conditionElement);
        forecastGrid.appendChild(card);
    });
    forecastSection.style.display="block";
}
// Fetch 5-Day Forecast
async function fetchForecast(latitude,longitude){
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const response=await fetch(url);
    if(!response.ok)throw new Error("Unable to fetch 5-day forecast.");
    const data=await response.json();
    renderForecast(data.daily);
}

const RECENT_SEARCHES_KEY = "weather-recent-searches";
function getRecentSearches() {
    try {
        const saved = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
        return Array.isArray(saved) ? saved.filter(item => typeof item === "string") : [];
    } catch (error) {
        return [];
    }
}
function saveRecentSearch(city) {
    const searches = getRecentSearches().filter(item => item.toLowerCase() !== city.toLowerCase());
    searches.unshift(city);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 5)));
    renderRecentSearches();
}
function renderRecentSearches() {
    const searches = getRecentSearches();
    recentList.innerHTML = "";
    recentSection.style.display = searches.length ? "block" : "none";
    searches.forEach(city => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "recent-city-btn";
        button.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i>';
        const label = document.createElement("span");
        label.textContent = city;
        button.appendChild(label);
        button.addEventListener("click", () => {
            cityInput.value = city;
            clearSearch.classList.add("visible");
            fetchWeather(city);
        });
        recentList.appendChild(button);
    });
}
clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    renderRecentSearches();
});
renderRecentSearches();

// Find City, State or Country
async function findLocation(city){
    const query=city.trim();
    if(!query)throw new Error("Please enter a location.");
    let state=null;
    try{
        const response=await fetch("https://api.openadmindata.org/api/v1/in/state.json");
        if(response.ok){
            const data=await response.json();
            const states=data.data?.state||data.entities||[];
            state=states.find(item=>(item.name_en||"").toLowerCase()===query.toLowerCase());
        }
    }catch(error){
        console.warn("State dataset unavailable; trying global search.");
    }
    if(state){
        return{
            name:`${state.name_en}, India`,
            country:"India",
            latitude:Number(state.lat),
            longitude:Number(state.lon)
        };
    }
    const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en`;
    const response=await fetch(url);
    if(!response.ok)throw new Error("Unable to search this location.");
    const data=await response.json();
    if(!data.results?.length)throw new Error("Location not found. Please check the spelling.");
    const parts=query.split(",").map(part=>part.trim().toLowerCase());
    const location=data.results.find(item=>
        item.name.toLowerCase()===parts[0]&&
        (!parts[1]||[item.admin1,item.country].some(value=>value&&value.toLowerCase()===parts[1]))
    )||data.results[0];
    return{
        name:[location.name,location.admin1,location.country].filter((value,index,array)=>value&&array.indexOf(value)===index).join(", "),
        country:location.country,
        latitude:location.latitude,
        longitude:location.longitude
    };
}
// Update Weather Card
function updateWeatherCard(location,current){
    cityName.textContent=location.name;
    temperature.textContent=Math.round(current.temperature_2m);
    weatherCondition.textContent=getWeatherDescription(current.weather_code);
    humidity.textContent=`${current.relative_humidity_2m}%`;
    windSpeed.textContent=`${current.wind_speed_10m} km/h`;
    weatherIcon.innerHTML=`<i class="${getWeatherIcon(current.weather_code)}"></i>`;
    weatherImage.src=getWeatherImage(current.weather_code);
    weatherImage.alt=getWeatherDescription(current.weather_code);
    weatherSection.style.display="block";
}
// Fetch Weather Using Coordinates
async function fetchWeatherByCoordinates(latitude,longitude){
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const response=await fetch(url);
    if(!response.ok)throw new Error("Unable to fetch local weather data.");
    const data=await response.json();
    if(!data.current)throw new Error("Weather data is unavailable.");
    updateWeatherCard({name:"Your Current Location"},data.current);
    try{
        await fetchForecast(latitude,longitude);
    }catch(error){
        console.error("Forecast error:",error);
        forecastSection.style.display="none";
    }
}
// Fetch Weather for Searched Location
async function fetchWeather(city){
    loadingSection.style.display="block";
    errorSection.style.display="none";
    weatherSection.style.display="none";
    forecastSection.style.display="none";
    try{
        const location=await findLocation(city);
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
        const response=await fetch(url);
        if(!response.ok)throw new Error("Unable to fetch weather data. Please try again.");
        const data=await response.json();
        if(!data.current)throw new Error("Weather data is unavailable for this location.");
        updateWeatherCard(location,data.current);
        saveRecentSearch(city);
        try{
            await fetchForecast(location.latitude,location.longitude);
        }catch(error){
            console.error("Forecast error:",error);
            forecastSection.style.display="none";
        }
    }catch(error){
        console.error("Weather API error:",error);
        showError("Unable to get weather",error.message||"Something went wrong. Please try again.");
    }finally{
        loadingSection.style.display="none";
    }
}
// Current Location
function getCurrentLocation(){
    if(!navigator.geolocation){
        showError("Location Not Supported","Your browser does not support location access.");
        return;
    }
    errorSection.style.display="none";
    loadingSection.style.display="block";
    currentLocationBtn.disabled=true;
    currentLocationBtn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Detecting Location...';
    navigator.geolocation.getCurrentPosition(
        async position=>{
            const latitude=position.coords.latitude;
            const longitude=position.coords.longitude;
            try{
                weatherSection.style.display="none";
                forecastSection.style.display="none";
                await fetchWeatherByCoordinates(latitude,longitude);
            }catch(error){
                console.error("Current location error:",error);
                showError("Weather Unavailable",error.message||"Unable to fetch local weather.");
            }finally{
                loadingSection.style.display="none";
                currentLocationBtn.disabled=false;
                currentLocationBtn.innerHTML='<i class="fa-solid fa-location-crosshairs"></i> Use My Location';
            }
        },
        error=>{
            let message="Unable to detect your location. Please try again.";
            if(error.code===error.PERMISSION_DENIED){
                message="Location permission denied. Please allow location access in your browser settings.";
            }else if(error.code===error.POSITION_UNAVAILABLE){
                message="Your current location is unavailable.";
            }else if(error.code===error.TIMEOUT){
                message="Location request timed out. Please try again.";
            }
            loadingSection.style.display="none";
            showError("Location Error",message);
            currentLocationBtn.disabled=false;
            currentLocationBtn.innerHTML='<i class="fa-solid fa-location-crosshairs"></i> Use My Location';
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}
currentLocationBtn.addEventListener("click",getCurrentLocation);
// Search Form
searchForm.addEventListener("submit",event=>{
    event.preventDefault();
    const city=cityInput.value.trim();
    if(!city){
        showError("City name required","Please enter a city or state name to search.");
        cityInput.focus();
        return;
    }
    fetchWeather(city);
});
// Clear Search Button
cityInput.addEventListener("input",()=>{
    clearSearch.classList.toggle("visible",cityInput.value.length>0);
});
clearSearch.addEventListener("click",()=>{
    cityInput.value="";
    clearSearch.classList.remove("visible");
    cityInput.focus();
});
