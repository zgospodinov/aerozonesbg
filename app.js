if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(initAppMap);
} else {
  alert("Your current browser doesn't support geolocation");
}
var aeroZonesBGMap, curLocation;
var zoom = 13;
var opacity = 0.1;
var NM_TO_KM_FACTOR = 1.852;
var zoomAllFeatureGroupLayerPoints = [];
var zoomAllFeatureGroupLayer;

function initAppMap(position) {
  curLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  aeroZonesBGMap = L.map("mapid").setView(
    [curLocation.latitude, curLocation.longitude],
    zoom
  );

  L.tileLayer(
    "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=aNpHWm5CgaWnr0IudewH",
    {
      attribution:
        '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: "your.mapbox.access.token",
    }
  ).addTo(aeroZonesBGMap);
  L.control
    .scale({
      metric: true,
      imperial: false,
    })
    .addTo(aeroZonesBGMap);
  var marker = L.marker([curLocation.latitude, curLocation.longitude]).addTo(
    aeroZonesBGMap
  );

  L.easyButton(
    '<i class="fas fa-street-view"></i>',
    function (btn, map) {
      resetMapLocation();
    },
    "Back to current location"
  ).addTo(aeroZonesBGMap);

  L.easyButton(
    '<i class="fas fa-globe-europe"></i>',
    function (btn, map) {
      zoomToAll();
    },
    "Show all zones"
  ).addTo(aeroZonesBGMap);

  // draw safety zones that requiers airspace booking
  aerozones.forEach(function (zone) {
    if (zone.polygonType === "Circle") {
      var circle1 = L.circle(applyCoordinates(zone), {
        color: "red",
        fillColor: "#f03",
        weight: 0.8,
        fillOpacity: opacity,
        radius: zone.radius * NM_TO_KM_FACTOR * 1000, // Convert Nautical miles to meters,
      })
        .bindPopup(`<br>${zone.aerozoneName}</br>`)
        .addTo(aeroZonesBGMap);
    } else if (zone.polygonType === "Polygon") {
      var polygon = L.polygon(zone.points, {
        color: "red",
        fillColor: "#f03",
        opacity: opacity,
      })
        .bindPopup(zone.aerozoneName)
        .addTo(aeroZonesBGMap);
    } else if (zone.polygonType === "ArcSector") {
      var sector = L.circle(zone.points.center, {
        color: "red",
        radius: zone.radius * NM_TO_KM_FACTOR * 1000,
        weight: 0.8,
        startAngle: zone.startAngle,
        endAngle: zone.endAngle,
      })
        .bindPopup(zone.aerozoneName)
        .addTo(aeroZonesBGMap);

      var polyLineAddition = L.polygon(zone.points.all, {
        color: "red",
        weight: 0.8,
        fillColor: "#f03",
      })
        .bindPopup(zone.aerozoneName)
        .addTo(aeroZonesBGMap);
    }
  });
}

function zoomToAll() {
  aerozones.forEach(function (point) {
    if (point.aerozoneName === "KAZANLAK") {
      aeroZonesBGMap.setView(point.points.center);
      aeroZonesBGMap.setZoom(7);
    }
  });
}

function resetMapLocation() {
  aeroZonesBGMap.setView(applyCoordinates(curLocation));
  aeroZonesBGMap.setZoom(zoom);
}

function applyCoordinates(pos) {
  return [pos.latitude, pos.longitude];
}
