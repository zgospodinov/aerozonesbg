if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(initAppMap);
} else {
  alert("Your current browser doesn't support geolocation");
}

function initAppMap(position) {
    var currentLocation = position;
    var zoom = 10;
    // console.log(currentLocation);

    // var aeroZonesBGMap = L.map("mapid").setView([51.505, -0.09], 13);
    var aeroZonesBGMap = L.map("mapid").setView([currentLocation.coords.latitude,currentLocation.coords.longitude], zoom);

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

      var marker = L.marker([
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
      ]).addTo(aeroZonesBGMap);
}
