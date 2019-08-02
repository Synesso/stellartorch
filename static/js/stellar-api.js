const maxRecords = 200;
const PUBLIC_ADDRESS = "GCMCL5IBQWJTIQRAPPYGCQ4CHICL76ZKIZDKATKA2PNTOWCMNII4M2N7";

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
