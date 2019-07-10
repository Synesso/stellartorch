//"use strict";

/* global stellarTorchHomeOptions */

// Requires:
// Leaflet: http://leafletjs.com/
// Leaflet.curve: https://github.com/elfalem/Leaflet.curve
// Calcul of bezier curve, thx to https://medium.com/@ryancatalani/creating-consistently-curved-lines-on-leaflet-b59bc03fa9dc

(function (stellarTorchHome, $, undefined) {

  var DURATION_BASE = 2000;
  var radiusInMeters = 6371000;
  
  function updateDistance(distanceInKm) {
    $('#distance-span').text(distanceInKm)
  }

  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };
 
  function calculateDistance(lat1, lon1, lat2, lon2) {
    var phi1 = Math.radians(lat1);//.toRadians();
    var phi2 = Math.radians(lat2);//.toRadians();
    var deltaPhi = Math.radians(lat2-lat1);//.toRadians();
    var delta = Math.radians(lon2-lon1);//.toRadians();

    var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta/2) * Math.sin(delta/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = radiusInMeters * c;
    return d;
  }


  function initializePointsValues(data_lat_long) {
    var pointsData = []
    for (var index_dll in data_lat_long) {
      if (index_dll < data_lat_long.length - 1) {

        var latlng1 = data_lat_long[Number(index_dll)];
        var latlng2 = data_lat_long[Number(index_dll) + 1];

        var offsetX = latlng2[1] - latlng1[1];
        var offsetY = latlng2[0] - latlng1[0];

        var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
        var theta = Math.atan2(offsetY, offsetX);

        var thetaOffset = (3.14 / 10);

        var r2 = (r / 2) / (Math.cos(thetaOffset));
        var theta2 = theta + thetaOffset;

        var midpointX = (r2 * Math.cos(theta2)) + latlng1[1];
        var midpointY = (r2 * Math.sin(theta2)) + latlng1[0];

        var midpointLatLng = [midpointY, midpointX];

        var distance = calculateDistance(latlng1[0], latlng1[1], latlng2[0], latlng2[1])

        var point = {
          'start': latlng1,
          'mid': midpointLatLng,
          'end': latlng2,
          'dist': distance
        }
        pointsData.push(point);
      }
    }
    return pointsData
  }

  function arrayPlusDelay(array, delegate, delay) {
    var i = 0
    
     // seed first call and store interval (to clear later)
    var interval = setInterval(function() {
        // each loop, call passed in function
        delegate(array[i]);
        
          // increment, and if we're past array, clear interval
        if (i++ >= array.length - 1)
            clearInterval(interval);
    }, delay)
   
   return interval
  }


  function setup(options) {

    var map = L.map('mapid', {
      'center': [40, 0],
      'zoom': 2,
      'worldCopyJump': false,
      'minZoom': 2,
      // 'maxZoom': 20,
      'maxBounds': [
        [-90, -180],
        [90, 180]
      ],
      'layers': [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          'attribution': 'Map data &copy; OpenStreetMap contributors'
        })
      ]
    });

    $.getJSON(window.location.href + '/static/resources/world.geo.json', function (geojson) { // load file
      L.geoJson(geojson, { // initialize layer with data
        style: function (feature) { // Style option
          return {
            'weight': 1,
            'color': 'white',
            'fillColor': 'rgba(230,0,230,1)'
          }
        }
      }).addTo(map); // Add layer to map
    });

    var pointsData = initializePointsValues(options.latlngs)
    var distance = options.distance ? options.distance : 0;
    updateDistance(Math.round(distance/1000))

    var result = arrayPlusDelay(pointsData, function(p) {
      var pathOptions = {
        // color: 'rgba(230,0,230,1)',
        color: 'rgba(0,0,153,0.8)',
        weight: 2
      }

      // for (var p of pointsData) {
      var offsetX = p['end'][1] - p['start'][1];
      var offsetY = p['end'][0] - p['start'][0];

      var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));

      if (typeof document.getElementById('mapid').animate === "function") {
        // var duration = Math.sqrt(Math.log(r)) * DURATION_BASE;
        // Scales the animation duration so that it's related to the line length
        // (but such that the longest and shortest lines' durations are not too different).
        // You may want to use a different scaling factor.
        pathOptions.animate = {
          duration: DURATION_BASE,
          // iterations: Infinity,
          easing: 'ease-in-out',
          direction: 'alternate'
        }
      }
      var curvedPath = L.curve(
        [
          'M', p['start'],
          'Q', p['mid'], p['end']
        ], pathOptions);

      curvedPath.addTo(map);

      distance = distance + Number(p['dist'])
      var distanceInKm = Math.round(distance/1000)
      updateDistance(distanceInKm)
      
    }, DURATION_BASE)
  }

  // Initialize
  $(function () {
    setup(stellarTorchHomeOptions)
  });

}(window.stellarTorchHome = window.stellarTorchHome || {}, jQuery));
