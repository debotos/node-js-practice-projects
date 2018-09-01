const request = require('request');

var getWeather = (lat, lng, callback) => {

	const API_KEY = 'a270f9b083dfc1c38e31881c83d305a9';

	request({
		url: `https://api.darksky.net/forecast/${API_KEY}/${lat},${lng}`,
		json: true
	}, (error, response, body) => {

		if (!error && response.statusCode === 200) {

			callback(undefined, {
				temperature: body.currently.temperature,
				apparentTemperature: body.currently.apparentTemperature,
				summary: body.currently.summary
			});

		} else {
			callback('Unable to connect to the Server.');
		}

	});
};


module.exports.getWeather = getWeather;