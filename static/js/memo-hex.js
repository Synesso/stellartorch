//Thanks to @sui77 for the implementation: https://gist.github.com/sui77/853de79d4d496fc2e50dda15fac464af

function packTorch(entryId, operationId, lat, long) {
  let sEntryId = parseInt(entryId).toString(16);
  let sOperationId = new BigNumber(operationId).toString(16);

  // map coords to positive int range
  let sLat = Math.round((90 + lat) * 1e7).toString(16);
  let sLong = Math.round((180 + long) * 1e7).toString(16);
  let hex =
    padZero(sEntryId, 5) +
    padZero(sOperationId, 16) +
    padZero(sLat, 8) +
    padZero(sLong, 8);

  // fill with zeros cause MEMO_HASH expects 64 chars
  while (hex.length < 64) {
    hex += "0";
  }

  return hex;
}

function unpackTorch(s) {
  let entryId = parseInt("0x" + s.substr(0, 5));
  let operationId = new BigNumber("0x" + s.substr(5, 16)).toString();
  let lat = (parseInt("0x" + s.substr(21, 8)) / 1e7 - 90).toFixed(7);
  let long = (parseInt("0x" + s.substr(29, 8)) / 1e7 - 180).toFixed(7);
  return {
    entryId: entryId,
    operationId: operationId,
    lat: lat,
    long: long
  };
}

function padZero(s, len) {
  while (s.length < len) s = "0" + s;
  return s;
}
