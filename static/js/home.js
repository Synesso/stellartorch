//"use strict";

/* global stellarTorchHomeOptions */

// Requires:
// Leaflet: http://leafletjs.com/
// Leaflet.curve: https://github.com/elfalem/Leaflet.curve
// Calcul of bezier curve, thx to https://medium.com/@ryancatalani/creating-consistently-curved-lines-on-leaflet-b59bc03fa9dc
(function(stellarTorchHome, $, undefined) {
  var DURATION_BASE = 1000;
  var radiusInMeters = 6371000;
  var xlmUsd = 0.1;

  function updateStats(distanceInKm, bearers) {
    $("#stat_kms").text(distanceInKm.toLocaleString());
    $("#stat_bearers").text(bearers.toLocaleString());
    $("#stat_fees").text(
      "$" + parseFloat((bearers * 0.00001 * xlmUsd).toPrecision(7))
    );
  }

  Math.radians = function(degrees) {
    return (degrees * Math.PI) / 180;
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    var phi1 = Math.radians(lat1); //.toRadians();
    var phi2 = Math.radians(lat2); //.toRadians();
    var deltaPhi = Math.radians(lat2 - lat1); //.toRadians();
    var delta = Math.radians(lon2 - lon1); //.toRadians();

    var a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(delta / 2) *
        Math.sin(delta / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = radiusInMeters * c;
    return d;
  }

  function initializePointsValues(data_lat_long) {
    var pointsData = [];
    for (var index_dll in data_lat_long) {
      if (index_dll < data_lat_long.length - 1) {
        var latlng1 = data_lat_long[Number(index_dll)];
        var latlng2 = data_lat_long[Number(index_dll) + 1];

        var offsetX = latlng2[1] - latlng1[1];
        var offsetY = latlng2[0] - latlng1[0];

        var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
        var theta = Math.atan2(offsetY, offsetX);

        var thetaOffset = 3.14 / 10;

        var r2 = r / 2 / Math.cos(thetaOffset);
        var theta2 = theta + thetaOffset;

        var midpointX = r2 * Math.cos(theta2) + latlng1[1];
        var midpointY = r2 * Math.sin(theta2) + latlng1[0];

        var midpointLatLng = [midpointY, midpointX];

        var distance = calculateDistance(
          latlng1[0],
          latlng1[1],
          latlng2[0],
          latlng2[1]
        );

        var point = {
          start: latlng1,
          mid: midpointLatLng,
          end: latlng2,
          dist: distance
        };
        pointsData.push(point);
      }
    }
    return pointsData;
  }

  function arrayPlusDelay(array, delegate, delay) {
    var i = 0;

    // seed first call and store interval (to clear later)
    var interval = setInterval(function() {
      // each loop, call passed in function
      delegate(array[i]);

      // increment, and if we're past array, clear interval
      if (i++ >= array.length - 1) clearInterval(interval);
    }, delay);

    return interval;
  }

  function setup(options) {
    var map = L.map("map", {
      center: [40, 0],
      zoom: 2,
      zoomControl: false,
      worldCopyJump: false,
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]]
    });

    var gl = L.mapboxGL({
      attribution:
        '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
      accessToken: "not-needed",
      style:
        "https://api.maptiler.com/maps/e65c22c9-cb86-4bff-90d4-6ed1813678d5/style.json?key=QxrALtzKlQScUQ6911oV"
    }).addTo(map);

    // Keep the map hidden until it has fully loaded. (I am not sure how to overwrite default grey of mapbox-gl loading area).
    $("#map").css({ visibility: "hidden" });
    gl._glMap.on("load", function() {
      $("#map")
        .css({ visibility: "visible", opacity: 0 })
        .animate({ opacity: 1.0, visibility: "visible" }, 200);
    });

    var pointsData = initializePointsValues(options.latlngs);
    var distance = options.distance ? options.distance : 0;
    var bearers = 0;
    updateStats(Math.round(distance / 1000), bearers);

    var result = arrayPlusDelay(
      pointsData,
      function(p) {
        var pathOptions = {
          color: "rgb(255,165,0)",
          weight: 2
        };

        // for (var p of pointsData) {
        var offsetX = p["end"][1] - p["start"][1];
        var offsetY = p["end"][0] - p["start"][0];

        var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));

        if (typeof document.getElementById("map").animate === "function") {
          // var duration = Math.sqrt(Math.log(r)) * DURATION_BASE;
          // Scales the animation duration so that it's related to the line length
          // (but such that the longest and shortest lines' durations are not too different).
          // You may want to use a different scaling factor.
          pathOptions.animate = {
            duration: DURATION_BASE,
            // iterations: Infinity,
            easing: "ease-in-out",
            direction: "alternate"
          };
        }
        var curvedPath = L.curve(
          ["M", p["start"], "Q", p["mid"], p["end"]],
          pathOptions
        );

        curvedPath.addTo(map);

        distance = distance + Number(p["dist"]);
        bearers = bearers + 1;
        var distanceInKm = Math.round(distance / 1000);
        updateStats(distanceInKm, bearers);
      },
      DURATION_BASE
    );
  }

  // Initialize
  getBearers(bearers => {
    const data = {
      latlngs: bearers.map(b => [parseFloat(b.lat), parseFloat(b.long)]),
      distance: 0
    };
    const usernames = getUsernames(bearers).then(usernames =>
      writeCountryList(bearers, usernames)
    );

    $(function() {
      setup(data);
    });
  });
})((window.stellarTorchHome = window.stellarTorchHome || {}), jQuery);
