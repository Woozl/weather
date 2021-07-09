const KEY = "DEMO"

let query = "Raleigh"

let geo_url = (query) => `https://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=${KEY}`
let data_url = (lat, lon) => `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${KEY}`

let kToF = (k) => ((k-273.15)*(9/5)+32)
let msToMph = (ms) => ms*2.237

async function getWeatherData() {
	let response = await fetch(geo_url(query))
	if(!response.ok) throw new Error(`Issue resolving HTTP request. Status: ${response.status}`)
	let geo = await response.json()

	response = await fetch(data_url(geo[0].lat, geo[0].lon))
	if(!response.ok) throw new Error(`Issue resolving HTTP request. Status: ${response.status}`)
	let weatherData = await response.json()
	
	console.log(data_url(geo[0].lat, geo[0].lon))
	console.log(weatherData)
	
	render(weatherData)
}

function render(weatherData) {
	const root = document.getElementById("root")
		
	var tempData = []
	weatherData.hourly.forEach(({dt, temp}) => tempData.push( {x: (new Date(dt * 1000).toLocaleString()), y: kToF(temp)} ))
	var humidityData = []
	weatherData.hourly.forEach(({dt, humidity}) => humidityData.push( {x: (new Date(dt * 1000).toLocaleString()), y: humidity} ))
	
	var timeFormat = 'DD/MM/YYYY'
	
	var config = {
        type:    'line',
        data:    {
            datasets: [
                {
                    label: "Hourly Temperature",
                    data: tempData,
                    fill: false,
                    borderColor: 'red'
                },
				{
                    label: "Hourly Humidity",
                    data: humidityData,
                    fill: false,
                    borderColor: 'blue'
                }
            ]
        },
        options: {
            responsive: true,
            title:      {
                display: true,
                text:    "Temperature"
            },
            scales:     {
                xAxes: [{
                    type:       "time",
                    time:       {
                        displayFormats: timeFormat,
                        tooltipFormat: 'll'
                    },
                    scaleLabel: {
                        display:     true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display:     true,
                        labelString: 'value'
                    }
                }]
            }
        }
    };
	
	var myChart = new Chart(
		document.getElementById('myChart'),
		config
	);
	
	Object.entries(weatherData.current).forEach(entry => {
		let [key, value] = entry
		if(key === "dt" || key === "sunrise" || key === "sunset") value = (new Date(value * 1000)).toLocaleString()
		if(key === "temp" || key === "feels_like") value = kToF(value).toFixed(2)
		if(key === "wind_speed") value = msToMph(value)
		let elem = document.createElement("p")
		elem.innerHTML = `${key}: ${value}`
		root.appendChild(elem)
	})
}

getWeatherData()