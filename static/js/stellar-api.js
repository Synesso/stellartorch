const maxRecords = 200;
const PUBLIC_ADDRESS =
  "GDTUDZ7XKCLPW7D7KCF2DCYAR5MESIHSFZXL4MOBDSKZDVCFSV7ZU77T";

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

//gets the usernames linked to the source_account of every transaction containing the payment operation
async function getUsernames(bearers) {
  const operationSourceUsernames = {};
  var server = new StellarSdk.Server("https://horizon.stellar.org");
  var promises = [];

  const federationServer = await StellarSdk.FederationServer.createForDomain(
    "keybase.io"
  );
  for (let bearer of bearers) {
    promises.push(
      new Promise((resolve, reject) => {
        server
          .operations()
          .operation(bearer.operationId)
          .call()
          .then(operationResult => {
            federationServer
              .resolveAccountId(operationResult.source_account)
              .then(response => {
                if (response.stellar_address) {
                  operationSourceUsernames[bearer.operationId] =
                    "@" + response.stellar_address.split("*")[0];
                }
                resolve();
              })
              .catch(e => resolve());
          })
          .catch(e => resolve());
      })
    );
  }
  await Promise.all(promises);
  return operationSourceUsernames;
}
