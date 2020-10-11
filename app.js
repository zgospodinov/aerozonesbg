var aeroZonesBGMap, curLocation, centerLocation;
var zoom = 13;
var opacity = 0.1;
var NM_TO_KM_FACTOR = 1.852;
var zoomAllFeatureGroupLayerPoints = [];
var zoomAllFeatureGroupLayer;
var zones = [];
var permitZones = [];

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

  // add leaflet-geoman controls with some options to the map
  initGeomanTools(aeroZonesBGMap);

  if (options.zoomAll) {
    AerozonesBGUtils.zoomToAll();
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
    AerozonesBGUtils.addEasyButton(
      '<i class="fas fa-street-view"></i>',
      "Back to current location",
      AerozonesBGUtils.resetMapLocation
    );
  }

  AerozonesBGUtils.addEasyButton(
    '<i class="fas fa-globe-europe"></i>',
    "Show all zones",
    AerozonesBGUtils.zoomToAll
  );

  // draw safety zones that requiers airspace booking
  aerozones.forEach(function (zone) {
    if (zone.polygonType === "Circle") {
      var circle1 = L.circle(AerozonesBGUtils.applyCoordinates(zone), {
        color: "red",
        pmIgnore: true,
        fillColor: "#f03",
        weight: 0.8,
        fillOpacity: opacity,
        radius: zone.radius * NM_TO_KM_FACTOR * 1000, // Convert Nautical miles to meters,
      }).bindPopup(`<br>${zone.aerozoneName}</br>`);
      zones.push(circle1);
    } else if (zone.polygonType === "Polygon") {
      var polygon = L.polygon(zone.points, {
        color: "red",
        pmIgnore: true,
        fillColor: "#f03",
        opacity: opacity,
      }).bindPopup(zone.aerozoneName);
      zones.push(polygon);
    } else if (zone.polygonType === "ArcSector") {
      var sector = L.circle(zone.points.center, {
        color: "red",
        pmIgnore: true,
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
        pmIgnore: true,
      }).bindPopup(zone.aerozoneName);
      zones.push(polyLineAddition);
    }
  });

  // Adding layers menu
  var zonesLayer = L.layerGroup(zones);
  let layerSettingsOnMap = {
    "BULATSA Authorization zones": zonesLayer,
  };

  aeroZonesBGMap.addLayer(zonesLayer);
  L.control.layers(null, layerSettingsOnMap).addTo(aeroZonesBGMap);
}

function initGeomanTools(map) {
  map.pm.addControls({
    position: "topleft",
    drawCircleMarker: false,
    drawPolyline: false,
    drawMarker: false,
  });

  map.pm.setGlobalOptions({
    tooltips: true,
    snappable: true,
    snapDistance: 25,
  });

  // Register Events
  map.on("pm:create", (e) => {
    // Get the newly drawn by the user permition zone
    var permitZone = e.layer;
    permitZones.push({id: permitZone._leaflet_id, source: permitZone});

    permitZone.on("contextmenu", function (c) {
      // Add/show context menu      
      var pop = L.popup()
        .setLatLng([c.latlng.lat, c.latlng.lng])
        .setContent(
          `
          <span id="\`${c.target._leaflet_id}\`" class="pop-context-menu" onclick="copyCoordinatesToClipboard(event)">Copy coordinates</span>
          <br>
          <hr style="margin-top:2px;margin-bottom:2px;">
          <span id="\`${c.target._leaflet_id}\`" class="pop-context-menu" onclick="exportToDocument(event)">Export to document</span>
          `
        )
        .bindPopup(permitZone)        
        .addTo(map);
    });
  });

  map.on("pm:remove", (e) =>{
    permitZones = permitZones.filter(zone => {
      return zone.id !== e.layer._leaflet_id;
    });
  });
}

function copyCoordinatesToClipboard(el) {
  let coordinates;
  let elID = el.target.id.replace("`", "").replace("`", "");
  var zoneToRequestPermition = permitZones.find(zone => {
    return zone.id === Number(elID);
  });
 
  if (zoneToRequestPermition.source.pm._shape === "Circle") {
    let formatedCenterCoords = CoordinatesFormatter.formatLatLngCoordinates([
      zoneToRequestPermition.source._latlng.lat,
      zoneToRequestPermition.source._latlng.lng,
    ]);
    var radius = zoneToRequestPermition.source._mRadius;
    coordinates = `${formatedCenterCoords}, \n${Math.round(radius)}m`;
  } else if (
    zoneToRequestPermition.source.pm._shape === "Rectangle" ||
    zoneToRequestPermition.source.pm._shape === "Polygon"
  ) {
    var corners = zoneToRequestPermition.source._latlngs[0]; // Assumming that there is no internal cutout area in polygons
    corners.forEach((corner) => {
      var coornerCoords = CoordinatesFormatter.formatLatLngCoordinates([corner.lat, corner.lng]);
      if(!coordinates){
        coordinates = `${coornerCoords}`;
      }else{
        coordinates += `\n${coornerCoords}`;
      }
    });
  }

  var copyText = document.createElement("textarea");
  copyText.value = coordinates;
  copyText.setAttribute('readonly', '');
  copyText.style.position = 'absolute';
  copyText.style.left = '-9999px';
  document.body.appendChild(copyText);
  copyText.select();

  document.execCommand("copy");
  document.body.removeChild(copyText);
};

function exportToDocument(c) {
  alert("Not implemented yet");
};
