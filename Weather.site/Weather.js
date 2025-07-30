window.onload = function () {
  // Elements
  const searchBox     = document.querySelector(".search input");
  const searchBtn     = document.querySelector(".search button");
  const suggestionBox = document.querySelector(".suggestions");
  const cityEl        = document.querySelector(".city");
  const tempEl        = document.querySelector(".temp");
  const windEl        = document.querySelector(".wind");
  const humidityEl    = document.querySelector(".humidity");
  const iconEl        = document.querySelector(".weather-icon");
  const updateEl      = document.querySelector(".text-white\\/70");

  // Debounce helper
  function debounce(fn, delay) {
    let timeout;
    return (...args) => { 
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // 1️⃣ Geocode city using Nominatim, with robust country_code and city fallback
  async function fetchCoords(query) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({
      q: query,
      format: "json",
      limit: 5,
      addressdetails: 1  // ensure we get address object
    });
    const res = await fetch(url);
    const list = await res.json();
    return list.map(c => {
      // Optional chaining guards
      const addr = c.address || {};
      // Country code uppercase if available, else fallback to last display_name segment
      const country = addr.country_code
        ? addr.country_code.toUpperCase()
        : c.display_name.split(",").pop().trim();
      // City/town/village or fallback to first display_name segment
      const city =
        addr.city ||
        addr.town  ||
        addr.village ||
        addr.hamlet ||
        c.display_name.split(",")[0].trim();
      return {
        display: `${city}, ${country}`,
        lat: c.lat,
        lon: c.lon
      };
    });
  }

  // 2️⃣ Get weather from Open-Meteo
  async function fetchWeather(lat, lon) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current_weather: "true",
      hourly: "relative_humidity_2m",
      timezone: "auto"
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    return res.json();
  }

  // Icon mapping
  const codeToIcon = {
    0: "clear.png", 1: "partly-cloudy.png", 2: "cloudy.png", 3: "overcast.png",
    45: "fog.png", 48: "fog.png",
    51: "drizzle.png", 53: "drizzle.png", 55: "drizzle.png",
    61: "rain.png", 63: "rain.png", 65: "rain.png",
    71: "snow.png", 73: "snow.png", 75: "snow.png",
    80: "shower.png", 81: "shower.png", 82: "shower.png",
    95: "thunderstorm.png", 96: "thunderstorm.png", 99: "thunderstorm.png"
  };

  // 3️⃣ Update DOM
  function updateUI(data, location) {
    const cw = data.current_weather;
    // City & time
    cityEl.textContent      = location;
    updateEl.textContent    = `Updated ${new Date(cw.time).toLocaleTimeString()}`;
    // Temp
    tempEl.textContent      = `${cw.temperature.toFixed(1)}°C`;
    // Wind
    windEl.textContent      = `${cw.windspeed.toFixed(1)} km/h`;
    // Humidity (first hourly point)
    humidityEl.textContent  = `${data.hourly.relative_humidity_2m[0]}%`;
    // Icon
    const file = codeToIcon[cw.weathercode] || "unknown.png";
    iconEl.src = `./images/${file}`;
  }

  // 4️⃣ Orchestrator
  async function checkWeather(query) {
    if (!query) return;
    try {
      // Geocode
      const places = await fetchCoords(query);
      if (places.length === 0) throw new Error("Location not found");
      // Use first suggestion
      const { lat, lon, display } = places[0];
      // Fetch weather
      const weather = await fetchWeather(lat, lon);
      // Update UI
      updateUI(weather, display);
    } catch (err) {
      alert(err.message);
    }
  }

  // 5️⃣ Autocomplete logic
  searchBox.addEventListener("input", debounce(async () => {
    const q = searchBox.value.trim();
    if (!q) return suggestionBox.classList.add("hidden");
    const places = await fetchCoords(q);
    if (places.length === 0) return suggestionBox.classList.add("hidden");
    suggestionBox.innerHTML = places
      .map(p => `<li class="px-4 py-2 cursor-pointer hover:bg-white/20">${p.display}</li>`)
      .join("");
    suggestionBox.classList.remove("hidden");
    suggestionBox.querySelectorAll("li").forEach(li =>
      li.addEventListener("click", () => {
        searchBox.value = li.textContent;
        suggestionBox.classList.add("hidden");
        checkWeather(li.textContent);
      })
    );
  }, 200));

  // Hide suggestions on outside click
  document.addEventListener("click", e => {
    if (!e.target.closest(".search")) suggestionBox.classList.add("hidden");
  });

  // Trigger search
  searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
  searchBox.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      checkWeather(searchBox.value);
      suggestionBox.classList.add("hidden");
    }
  });

  // Initial load
  checkWeather("Bangalore");
};
