if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(initAppMap);
} else {
  alert("Your current browser doesn't support geolocation");
}
var aeroZonesBGMap, curLocation;

function initAppMap(position) {
  curLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  var zoom = 13;

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

  var marker = L.marker([curLocation.latitude, curLocation.longitude]).addTo(
    aeroZonesBGMap
  );
}

function resetMapLocation() {
  aeroZonesBGMap.setView(applyCoordinates(curLocation));
}

function applyCoordinates(pos) {
  return [pos.latitude, pos.longitude];
}
