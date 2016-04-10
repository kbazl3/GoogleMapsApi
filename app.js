var map;
var geocoder = new google.maps.Geocoder();
//hit the google.maps api and initilize the map

function initialize() {
    var mapOptions = { //create a map options object
            center: new google.maps.LatLng(39.677598,-110.511475),
            zoom: 7,
            // disableDefaultUI: true,
            zoomControl: true,
            panControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            overviewMapControl: true
        };

        map = new google.maps.Map(document.getElementById('mapDiv'), mapOptions); //create a new instance of the map class, pass in the div where we want the map and also pass in mapOptions

        addButtons(map);
        addShowCoords(map);
        addElevationService()

        //******* the default area of the map on page load, also when right clicked
        var initialCenter = mapOptions.center;
        var initialZoom = mapOptions.zoom;
        addGoToInitialExtent(map, initialCenter, initialZoom);

        // ********* Custom Marker*******
        var centerMarker = new google.maps.Marker({
            icon: 'http://icons.iconarchive.com/icons/icons-land/vista-map-markers/128/Map-Marker-Push-Pin-1-Right-Pink-icon.png',
            position: new google.maps.LatLng(52.345860, -3.051817),
            map: map,
            title: "The Dojo"
        });
}
google.maps.event.addDomListener(window, "load", initialize);//grab the window, when it loads invoke initialize from addGoToInitialExtent


// **************** SHOW coordinates OF MIDDLE ******************
function addShowCoords(map) { //get the coordinates of the middle of the page to show
    google.maps.event.addListener(map, 'center_changed', function() {
        var newCenter = map.getCenter();
        var zoom = map.getZoom();
        document.getElementById('coordsDiv').innerHTML = "Center: " + newCenter.toString() + "<br>Zoom: " + zoom;
    });
}

function addGoToInitialExtent(map, initialCenter, initialZoom) {// this right click event goes automatically goes to mapOptions.center
    google.maps.event.addListener(map, 'rightclick', function() {
        map.setCenter(initialCenter);
        map.setZoom(initialZoom);
    });
}

// function addKmlLayer(map) {
//     var offasDykeLayer = new google.maps.KmlLayer('http://hikeview.co.uk/tracks/hikeview-offas-dyke.kml');
//     offasDykeLayer.setMap(map);
// }

//*************************GEOCODE FUNCTION ***************************
function geocodeAddress() {
    var address = document.getElementById('address').value; //sets the value of the input box to this address variable
    geocoder.geocode({'address': address},//call the geocode method, passing in the address
        function (results, status) { //will get back a status and/or results
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location); //take the first result and access its geometry property and then its location prop to center the map on that point
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                map.setZoom(17);
                map.panTo(marker.position);
            } else {
                alert('Geocode failed with the following error: ' + status);
            }
        });
}

// *****************DIRECTIONS FUNCTION*********************
function calcRoute() {
    var directionsService = new google.maps.DirectionsService();//creating an object of the directionsService class

    var directionsDisplay; //creating another option of the DirectionsRenderer class, which will help me put the results I get back from the Directions Service directly onto my map.
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map); //Now you can see here that the DirectionsRenderer object I've created called directionsDisplay, we're calling its setMap method to specify which map these results are going to appear on,
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));// and we're also calling the setPanel method. This allows us to show the turn-by-turn driving directions in a panel on our page.

    var start = document.getElementById('start').value; //the Start location is going to be whatever the user enters in the textbox
    var end = new google.maps.LatLng(40.227045556221036, -111.66444936714176); //and the End location is going to be the location of The Offa's Dyke Center.
    var request = { //create a DirectionsRequest object
        origin: start, //we specify the Origin property, which is our Start location
        destination: end, //the Destination property, which is our End location
        travelMode : google.maps.TravelMode.DRIVING // and then the travel mode
    };
    directionsService.route(request, function(result, status) { // we can call the Route method of the DirectionsService, and we pass in our Request object and a callback, which will deal with the results when they come back.
        if (status == google.maps.DirectionsStatus.OK) { //here we check to see if the status is OK, and if it is,
            directionsDisplay.setDirections(result); //then because we've defined a DirectionsRenderer object, all we need to do is call the Renderer's setDirections method and pass in the results that came back in the callback.
        } else {
            alert('Could not calculate directions. Try again, or buy a map!');
        }
    });
}

// ************FIND THE ELEVATION BY CLICKING ON THE MAP*************
function addElevationService() {
    //Create an ElevationService
    google.maps.event.addListener(map, 'click', getElevation);
    elevationService = new google.maps.ElevationService();
    //add a listener for the dbl click event and call getElevation on that location
}


function getElevation(event) {
    var locations = []; //the elevationService expects an array of elevations to work on
    var infowindow = new google.maps.InfoWindow();

    // Retrieve the clicked location and add it to the array
    var userClickLocation = event.latLng;
    locations.push(userClickLocation);

    //create a LocationElevationRequest object using the array's single value
    var positionalRequest = {
        'locations': locations
    };

    //send the location request
    elevationService.getElevationForLocations(positionalRequest, function(results, status) {
        if (status == google.maps.ElevationStatus.OK) {
            if (results[0]) { //retrieve the first result
                infowindow.setContent('The elevation at this point is ' + Math.round(results[0].elevation) + ' meters.'); //open window showing elevation at clicked position
                infowindow.setPosition(userClickLocation);
                infowindow.open(map);
            } else {
                alert('No Results Found');
            }
        } else {
            alert('Elevation service failed due to : ' + status);
        }
    });
}

//*****************toggle the different type of maps********************
function addButtons(map) {
    document.getElementById('btnTerrain').addEventListener('click', function() {
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    });
    document.getElementById('btnHybrid').addEventListener('click', function() {
        map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    });
    document.getElementById('btnRoadmap').addEventListener('click', function() {
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    });
    document.getElementById('btnSatellite').addEventListener('click', function() {
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    });
}
