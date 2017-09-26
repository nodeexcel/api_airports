import fs from "file-system";
import _ from 'lodash';
import radians from 'degrees-radians';

var geodist = require('geodist')

var dataFilePath = 'alaska_airports_II.json'

function getDistance(latlon){
    var lat1 = latlon.lat1;
    var lat2 = latlon.lat2;
    var lon1 = latlon.lon1;
    var lon2 = latlon.lon2;
    var dist = geodist({lat: lat1, lon: lon1}, {lat: lat2, lon: lon2});
    return dist;
}

module.exports = {
    get_distance: (req, res, next) => {
        let response;
        fs.readFile(dataFilePath, (err, data) => {
            if (err) next(err);
            else{
                var reqAirportOne = req.query.airport_one;
                var reqAirportTwo = req.query.airport_two;
                var allAirports = JSON.parse(data);
                var selectedAirportOne = false;
                var selectedAirportTwo = false;
                _.forEach( allAirports, function(airport){
                    var aLocation = airport.LocationID.replace("'", "");
                    if(aLocation == reqAirportOne){
                        selectedAirportOne = airport;
                    }
                    if(aLocation == reqAirportTwo){
                        selectedAirportTwo = airport;
                    }
                })
                if( selectedAirportOne == false || selectedAirportTwo == false ){
                    response = {
                        status: 0,
                        message: "airport not found",
                    };
                }else{
                    var latLon = {
                        "lat1" : selectedAirportOne.Lat,
                        "lon1" : selectedAirportOne.Lon,
                        "lat2" : selectedAirportTwo.Lat,
                        "lon2" : selectedAirportTwo.Lon
                    }
                    var distance = getDistance( latLon );
                    response = {
                        status: 1,
                        message: "",
                        data: {
                            distance: distance,
                        }
                    }
                }
            }
            res.json(response);
        });
    },
    airport_list: (req, res, next) => {
        fs.readFile(dataFilePath, (err, data) => {
            if (err) next(err);
            res.json({
                status: 1,
                message: "",
                data: JSON.parse(data)
            });
        });
    },
    nearest_airport: (req, res, next) => {
        let response;
        fs.readFile(dataFilePath, (err, data) => {
            if (err) next(err);
            else {
                var reqAirport = req.query.airport;
                var allAirports = JSON.parse(data);
                var selectedAirport = false;
                _.forEach( allAirports, function(airport){
                    var aLocation = airport.LocationID.replace("'", "");
                    if(aLocation == reqAirport){
                        selectedAirport = airport;
                    }
                })
                if(selectedAirport == false){
                    response = {
                        status: 0,
                        message: "airport not found",
                        data: {
                            current: {},
                            near :  []
                        }
                    };
                }else{
                    var latLon = {
                        "lat1" : selectedAirport.Lat,
                        "lon1" : selectedAirport.Lon,
                        "lat2" : '',
                        "lon2" : ''
                    }
                    var airportWithDistance = [];
                    _.forEach( allAirports, function(airport){
                        var aLocation = airport.LocationID.replace("'", "");
                        if(aLocation != reqAirport){
                            latLon.lat2 = airport.Lat
                            latLon.lon2 = airport.Lon
                            var distance = getDistance( latLon );
                            airport.distance = distance*1;
                            airportWithDistance.push(airport);
                        }
                    })
                    _.map(_.sortBy(airportWithDistance, 'distance'), 'value');
                    response = {
                        status: 1,
                        message: "",
                        data: {
                            current: selectedAirport,
                            near :  airportWithDistance.slice(0, 3)
                        }
                    }
                }
            }
            res.json(response)
        })
    }

}