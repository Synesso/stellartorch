async function writeCountryList(bearers, usernames) {
  const response = await fetch("/static/resources/countries.json");
  const countryList = await response.json();

  const rows = [];
  const countries = countryList.map(country => {
    let countryBearers = bearers.filter(
      bearer => bearer.country.code === country.CODE
    );
    return countryBearers.length > 0
      ? Object.assign({}, country, {
          hadTorch: true,
          usernames: getBearersUsernames(countryBearers, usernames)
        })
      : country;
  });

  $("#countryList").append(
    countries.map(
      (country, i) =>
        `<li class="country flex-left ${
          country.hadTorch ? "backgroundGreen" : ""
        }" > <img class="flag" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/${country.ISO.toLowerCase()}.svg"><div>${
          country.NAME
        }</div><div class="user-name ellipsis-text tooltip" title="${renderUsernames(
          country
        )}">${renderUsernames(country)}</div></li>`
    )
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
