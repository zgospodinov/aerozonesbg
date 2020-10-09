var AerozonesBGUtils = (function () {
  var addEasyButton = function (btnHtml, textHint, onClickCallBack) {
    L.easyButton(
      btnHtml,
      function (btn, map) {
        onClickCallBack.call();
      },
      textHint
    ).addTo(aeroZonesBGMap);
  };

  var zoomToAll = function () {
    aerozones.forEach(function (point) {
      if (point.aerozoneName === "KAZANLAK") {
        aeroZonesBGMap.setView(point.points.center);
        aeroZonesBGMap.setZoom(7);
      }
    });
  };

  var resetMapLocation = function () {
    aeroZonesBGMap.setView(applyCoordinates(curLocation));
    aeroZonesBGMap.setZoom(zoom);
  };

  var applyCoordinates = function (pos) {
    return [pos.latitude, pos.longitude];
  };
  return {
    addEasyButton,
    zoomToAll,
    resetMapLocation,
    applyCoordinates
  };
})();
