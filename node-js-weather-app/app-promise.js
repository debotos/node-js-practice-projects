const yargs = require('yargs');
const axios = require('axios');

const argv = yargs
	.options({
		address: {
			demand: true,
			alias: 'a',
			describe: 'Address to fetch weather for',
			string: true

		}
	})
	.help()
	.argv;


var encodedLocation = encodeURIComponent(argv.address);
var geocodeURL =  `http://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}`;

axios.get(geocodeURL).then((response) => {

	if (response.data.status === 'ZERO_RESULTS') {
		throw new Error('Unable to find that address.');
	}
	var lat = response.data.results[0].geometry.location.lat;
	var lng = response.data.results[0].geometry.location.lng;
	const API_KEY = 'a270f9b083dfc1c38e31881c83d305a9';
	var weatherURL = `https://api.darksky.net/forecast/${API_KEY}/${lat},${lng}`;
	console.log(response.data.results[0].formatted_address);
	return axios.get(weatherURL);
}).then((response) => {
	var temperature = response.data.currently.temperature;
	var apparentTemperature = response.data.currently.apparentTemperature;
	var summary = response.data.currently.summary;
	console.log(`Summary: ${summary}\n Temperature: ${temperature}\n Apparent Temperature: ${apparentTemperature}`);
}).catch((e) => {
	if (e.code === 'ENOTFOUND') {
		console.log('Unable to connect to API server.');
	} else {
		console.log(e.message);
	}
})