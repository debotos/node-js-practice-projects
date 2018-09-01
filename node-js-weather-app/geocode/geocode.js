const request = require('request');

var geocodeAddress = (address, callback) => {
	var encodedLocation = encodeURIComponent(address);
	request({
		url: `http://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}`,
		json: true
	}, (error, response, body) => {
		
		if (error) {
			callback('Unable to Connect. Check Internet Connection.');
		} else if (body.status === 'ZERO_RESULTS') {
			callback('Unable to find the location.');
		} else if (body.status === 'OK') {
			callback(undefined, {
				address: body.results[0].formatted_address,
				latitude: body.results[0].geometry.location.lat,
				longitude: body.results[0].geometry.location.lng
			});
		} else {
			console.log('Something went worng. Check your command.');
		}
	});
}


module.exports = {
	geocodeAddress
}