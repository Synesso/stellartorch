const maxRecords = 200;
const PUBLIC_ADDRESS = "GAL24WP4UK4S4WUM3PYS4SJAAETS73S6N2JTGKIGGGREDTLGZVJQNESS";

function fetchPage(nextHref, saved, callback) {
  fetch(nextHref)
    .then(r => r.json())
    .then(data => {
      const records = data._embedded.records;
      for (let record of records) {
        if (record.source_account === PUBLIC_ADDRESS && record.memo)
          saved.push(
            unpackTorch(
              window
                .atob(record.memo)
                .split("")
                .map(char => ("0" + char.charCodeAt(0).toString(16)).slice(-2))
                .join("")
                .toUpperCase()
            )
          );
      }
      if (records.length === maxRecords) {
        return fetchPage(data._links.next.href, saved, callback);
      }
      return callback(saved);
    });
}

//Export
function getBearers(callback) {
  fetchPage(
    "https://horizon.stellar.org/accounts/" +
      PUBLIC_ADDRESS +
      "/transactions?limit=" +
      maxRecords +
      "&order=asc",
    [],
    callback
  );
}
