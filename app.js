document.getElementById("loadBtn").addEventListener("click", getCommits);

function getCommits() {

    const city = document.getElementById("cityInput").value.trim();
    if(city === ""){
        alert("Wpisz nazwę miasta!");
        return;
    }

    const btn = document.getElementById("loadBtn");
    btn.disabled = true;
    btn.innerText = "Pobieram...";


    const current = new XMLHttpRequest();
    current.open(
        "GET",
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=pl&units=metric&appid=f5df316f76b17fe6e39391d1bc2822ac`,
        true
    );

    current.onload = function() {
        const data = JSON.parse(this.response);
        console.log("XMLHttpRequest:", data);
        renderCurrent(data);
    };

    current.send();

    fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=pl&units=metric&appid=f5df316f76b17fe6e39391d1bc2822ac`
    )
    .then(res => {
        return res.json();
    })
    .then(data => {
        console.log("Fetch:", data);
        renderDaily(data.list);

        btn.disabled = false;
        btn.innerText = "Pogoda";
    });
}

function renderCurrent(w){

    const box = document.getElementById("current");

    box.innerHTML = `
        <div class="current-left">
            <img src="https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png">
            <div>
                <div class="temp">${Math.round(w.main.temp)}°</div>
                <div class="feel">Odczuwalna: ${Math.round(w.main.feels_like)}°</div>
            </div>
        </div>

        <div class="current-details">
            <div><b>Wiatr:</b> ${w.wind.speed} m/s</div>
            <div><b>Wilgotność:</b> ${w.main.humidity}%</div>
            <div><b>Ciśnienie:</b> ${w.main.pressure} hPa</div>
        </div>

        <div class="current-desc">
            ${w.weather[0].description}
        </div>
    `;
}


function renderDaily(list){

    const wrap = document.getElementById("days");
    wrap.innerHTML = "";

    const map = {};
    list.forEach(x=>{
        const date = x.dt_txt.split(" ")[0];
        if(!map[date]) map[date] = [];
        map[date].push(x);
    });

    const days = Object.keys(map).slice(0,7);

    days.forEach(date => {

        const entries = map[date];

        const noon = entries.find(x=>x.dt_txt.includes("12:00:00")) || entries[0];

        const min = Math.round(Math.min(...entries.map(x=>x.main.temp_min)));
        const max = Math.round(Math.max(...entries.map(x=>x.main.temp_max)));

        const pop = Math.round((noon.pop ?? 0)*100);
        const desc = noon.weather[0].description;

        const row = document.createElement("div");
        row.className = "day-row";

        row.innerHTML = `
            <div>
                <div class="day-header">${formatDay(date)}</div>
                <div class="day-date">${date}</div>
            </div>

            <div class="day-center">
                <img src="https://openweathermap.org/img/wn/${noon.weather[0].icon}.png">
                <div>
                    <span class="temp-max">${max}°</span> /
                    <span class="temp-min">${min}°</span>
                </div>
            </div>

            <div class="day-right">
                <div class="desc-main">${desc}</div>
                <div class="precip">${pop}%</div>
            </div>
        `;

        wrap.appendChild(row);
    });
}

function formatDay(date){
    return new Date(date).toLocaleDateString("pl-PL", { weekday:"short" });
}
