const yargs = require('yargs');

const geocode = require('./geocode/geocode');
const weather = require('./weather/weather');

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


geocode.geocodeAddress(argv.address, (errorMessage, results) => {
	if (errorMessage) {
		console.log(errorMessage);
	} else {
		console.log(`Address: ${results.address}\n Latitude: ${results.latitude}\n Longitude: ${results.longitude}\n`);
		weather.getWeather(results.latitude, results.longitude, (errorMessage, results) => {
			if (errorMessage) {
				console.log(errorMessage);
			} else {
				console.log(`Summary: ${results.summary}\n Temperature: ${results.temperature}\n Apparent Temperature: ${results.apparentTemperature}`);
			}
		});

	}
});

