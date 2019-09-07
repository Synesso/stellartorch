const unknowUser = "@???";
async function writeCountryList(bearers, usernames) {
  const response = await fetch("/static/resources/countries.json");
  const countryList = await response.json();

  const rows = [];
  const countriesByCode = {};
  for (country of countryList) {
    countriesByCode[country.CODE] = { name: country.NAME, usernames: [] };
  }

  for (let i = 1; i < bearers.length; i++) {
    try {
      const currentBearer = bearers[i];
      const lastBearer = bearers[i - 1];
      countriesByCode[currentBearer.country.code].usernames.push(
        usernames[lastBearer.operationId]
          ? usernames[lastBearer.operationId]
          : unknowUser
      );
    } catch (e) {
      console.log(e);
    }
  }

  $("#countriesLoader").remove();
  $("#countryList").append(
    countryList.map((country, i) => {
      const countryInfo = countriesByCode[country.CODE];
      const hadTorch = countryInfo.usernames.length > 0;

      return `<li class="country flex-left ${
        hadTorch ? "backgroundGreen" : ""
      }" > <img class="flag" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/${country.ISO.toLowerCase()}.svg"><div>${
        country.NAME
      }</div><div class="user-name ellipsis-text tooltip" title="${renderUsernames(
        countryInfo
      )}">${renderUsernames(countryInfo)}</div></li>`;
    })
  );
}

function getBearersUsernames(countryBearers, usernames) {
  const users = [];
  for (let bearer of countryBearers) {
    const username = usernames[bearer.operationId];
    if (username !== undefined && users.indexOf(username) === -1)
      users.push(username);
  }
  return users.length > 0 ? users : null;
}

function renderUsernames(country) {
  return country.usernames
    ? country.usernames.map(username => " " + username)
    : "";
}
