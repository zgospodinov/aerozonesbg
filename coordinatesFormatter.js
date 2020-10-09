var CoordinatesFormatter = (function () {
  var formatLatLngCoordinates = function (latlng) {
    console.log(`${latlng[0]}, ${latlng[1]}`);
    console.log(
      `${getCoordGrades(latlng[0])}°${getCoordMinutes(
        latlng[0]
      )}'${getCoordSeconds(latlng[0])}", ${getCoordGrades(
        latlng[1]
      )}°${getCoordMinutes(latlng[1])}'${getCoordSeconds(latlng[1])}"`
    );
  }

  function getCoordGrades(coord) {
    return coord.toString().split(".")[0];
  }

  function getCoordMinutes(coord) {
    return coord.toString().split(".")[1].substr(0, 2);
  }

  function getCoordSeconds(coord) {
    return coord.toString().split(".")[1].substr(2, 2);
  }

  function getGeomanShape(el) {
    return el.target.pm._shape;
  }

  return {formatLatLngCoordinates};
})();
