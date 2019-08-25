async function writeCountryList(bearers) {
  const response = await fetch("/static/resources/countries.json");
  const countryList = await response.json();

  const rows = [];
  const countries = countryList.map(country =>
    bearers.filter(bearer => bearer.country.code === country.CODE).length > 0
      ? Object.assign({}, country, { hadTorch: true })
      : country
  );
  $("#countryList").append(
    countries.map(
      (country, i) =>
        `<li class="country flex-left ${
          country.hadTorch ? "backgroundGreen" : ""
        }" > <img class="flag" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/${country.ISO.toLowerCase()}.svg">${
          country.NAME
        }</li>`
    )
  );

  console.log(countries);
}
