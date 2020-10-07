var aeroZonesBGMap, curLocation, centerLocation;
var zoom = 13;
var opacity = 0.1;
var NM_TO_KM_FACTOR = 1.852;
var zoomAllFeatureGroupLayerPoints = [];
var zoomAllFeatureGroupLayer;
var zones = [];

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(initMapAtCurrentLocation, onError);
  } else {
    // Continue without geolocation service
    onError();
  }
}

// Loading map with no geolocation service, show all zones at once
function onError() {
  getCenterLocation();
  initAerozonesBGMap(
    {
      latitude: centerLocation.points.center[0],
      longitude: centerLocation.points.center[1],
    },
    { zoomAll: true }
  );
}

// Hardcoded position on map
function getCenterLocation() {
  centerLocation = aerozones.find(
    (aerozone) => aerozone.aerozoneName === "KAZANLAK"
  );
}

// Loading map zoomed to current location
function initMapAtCurrentLocation(position) {
  curLocation = position.coords;
  initAerozonesBGMap(
    {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },
    { zoomAll: false }
  );
}

getLocation();

function initAerozonesBGMap(curLocation, options) {
  aeroZonesBGMap = L.map("mapid");

  if (options.zoomAll) {
    zoomToAll();
  } else {
    aeroZonesBGMap.setView([curLocation.latitude, curLocation.longitude], zoom);
  }

  L.tileLayer(
    "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=aNpHWm5CgaWnr0IudewH",
    {
      attribution:
        '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      maxZoom: 25,
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

  if (!options.zoomAll) {
    var marker = L.marker([curLocation.latitude, curLocation.longitude]).addTo(
      aeroZonesBGMap
    );
    addEasyButton('<i class="fas fa-street-view"></i>', "Back to current location", resetMapLocation);
  }

  addEasyButton('<i class="fas fa-globe-europe"></i>', "Show all zones", zoomToAll);

  // draw safety zones that requiers airspace booking
  aerozones.forEach(function (zone) {
    if (zone.polygonType === "Circle") {
      var circle1 = L.circle(applyCoordinates(zone), {
        color: "red",
        fillColor: "#f03",
        weight: 0.8,
        fillOpacity: opacity,
        radius: zone.radius * NM_TO_KM_FACTOR * 1000, // Convert Nautical miles to meters,
      }).bindPopup(`<br>${zone.aerozoneName}</br>`);
      zones.push(circle1);

      // .addTo(aeroZonesBGMap);
    } else if (zone.polygonType === "Polygon") {
      var polygon = L.polygon(zone.points, {
        color: "red",
        fillColor: "#f03",
        opacity: opacity,
      }).bindPopup(zone.aerozoneName);
      zones.push(polygon);
    } else if (zone.polygonType === "ArcSector") {
      var sector = L.circle(zone.points.center, {
        color: "red",
        radius: zone.radius * NM_TO_KM_FACTOR * 1000,
        weight: 0.8,
        startAngle: zone.startAngle,
        endAngle: zone.endAngle,
      }).bindPopup(zone.aerozoneName);
      zones.push(sector);

      var polyLineAddition = L.polygon(zone.points.all, {
        color: "red",
        weight: 0.8,
        fillColor: "#f03",
      })
        .bindPopup(zone.aerozoneName);
        zones.push(polyLineAddition);
    }
  });

  var zonesLayer = L.layerGroup(zones);
  let layerSettingsOnMap = {
    "BULATSA Authorization zones": zonesLayer,
  };

  aeroZonesBGMap.addLayer(zonesLayer);
  L.control.layers(null, layerSettingsOnMap).addTo(aeroZonesBGMap);
}

function addEasyButton(btnHtml, textHint, callback){
  L.easyButton(
    btnHtml,
    function (btn, map) {
      callback.call();
    },
    textHint
  ).addTo(aeroZonesBGMap);
};

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
