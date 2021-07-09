var CoordinatesFormatter = (function () {
  var formatLatLngCoordinates = function (latlng) {
    var DMS =`${getCoordGrades(latlng[0])}°${getCoordMinutesAndSeconds(latlng[0])}, ${getCoordGrades(latlng[1])}°${getCoordMinutesAndSeconds(latlng[1])}`;
    return DMS;
  }

  function getCoordGrades(coord) {
    return coord.toString().split(".")[0];
  }

  function getCoordMinutesAndSeconds(coord) {
    var minutes = (coord % 1);
    var minutesInDMS = (minutes * 60);
    var seconds = minutesInDMS % 1;

    minutesInDMS = minutesInDMS.toString().split(".")[0];
    var minutesToPresent = minutesInDMS.length === 2 ? minutesInDMS : `0${minutesInDMS}`;

    var secondsInDMS = (seconds * 60).toString().split(".")[0];
    var secondsToPresent = secondsInDMS.length === 2 ? secondsInDMS : `0${secondsInDMS}`;

    var converted = `${minutesToPresent}'${secondsToPresent}"`;
    return converted;
  }

  // TODO: Not needed
  function getCoordSeconds(coord) {
    return coord.toString().split(".")[1].substr(2, 2);
  }
  return {formatLatLngCoordinates};
})();
