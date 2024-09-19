//Urls APIs
const urlCoinpaprika = "https://api.coinpaprika.com/v1";

const currencyUrl = "https://api.getgeoapi.com/v2/currency";
const currencyApiKey = "7f4535450367fbc5c427f8c5c6ff94156aab4c47";

const historicalUrl = "https://api.freecurrencyapi.com/v1/historical";
const historicalApiKey = "cDmBBD7LGA57uUikc705v22ujl54XlWs9yo98GcI";

//Variables
let selectedCryptoId = "btc-bitcoin";
let selectedCryptoCode;
let selectedCoinId = "USD";
let cryptoListLimited;
let cryptoRange= [];
let dates;
let coinPrices;
let cryptoPrices;
let conversionArray= [];
let convertedArray= [];
let conversionChart;

let coinData;
let exchangeRate;
var checkbox;
var coinSwapper = document.getElementById('coinSwapper');

const $selFrom = document.querySelector("#select-box-crypto");
const $selTo = document.querySelector("#select-box-coin");
const $inpAmount = document.querySelector("#inpAmount");
const $inpDate = document.querySelector("#inpDate");
const $btnConvert = document.querySelector("#btnConvert");
const $convertChart = document.querySelector("#convertChart");

const $priceConversion = document.querySelector("#priceConversion");
const $currencyTo = document.querySelector("#currencyTo");
const $rateConversion = document.querySelector("#rateConversion");
const $dateConversion = document.querySelector("#dateConversion");




//INIT
initApp();
function initApp(){
    showLoading();
    disableFormConvert();
    preloadingValues();
    addEvents();
}

function preloadingValues(){
  showLoading();

  Promise.all([loadCryptoCoinList(), loadCoinList()])
  .then(coinLoaded => {

    handleCryptoList(coinLoaded[0])
    handleCoinList(coinLoaded[1])

    
  })
  .catch(displayError)
  .finally(() => {
    hideLoading();
    desdisableFormConvert();
  });
}

function handleCryptoList(cryptoResponse){
  //limit the array with .slice
  const cryptoListLimited= cryptoResponse.slice(0,10);
  renderHtmlCryptoList(cryptoListLimited);
}

function handleCoinList(coinResponse){
  const currenciesFull= coinResponse.currencies
  if (coinResponse.status === "success") {
    //coinsFreeCurrencies it's a filtered array of currency list of the freeCurrency api  (for creating the chart later on without error)
    const coinsFreeCurrencies = [
      "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD"
    ];

    const filteredCurrencies = Object.fromEntries(
      Object.entries(currenciesFull)
        .filter(([currenciesFull]) => coinsFreeCurrencies.includes(currenciesFull))
    );
    renderHtmlCoinList(filteredCurrencies);
  } else {
    // there's an error
    console.warn("api error", rawResponse.error);
  }
}

//Crypto LIST--------------------------------------------------------------------------   
function loadCryptoCoinList() {

  return fetch(buildUrl(`${urlCoinpaprika}/coins`))
    .then(apiToJson);
}

function loadCryptoLogo(id) {
  return fetch(buildUrl(`${urlCoinpaprika}/coins/${id}`))
    .then(apiToJson);
}

function renderHtmlCryptoList(list) {
  let selectFromHtml = "";

  Promise.all(list.map((coin) => loadCryptoLogo(coin.id)))
    .then((coinDataArray) => {
      list.forEach((coin, index) => {
        const { symbol, id } = coin;
        const isChecked = symbol === "BTC" ? "checked" : "";
        const coinData = coinDataArray[index];
        const logoUrl = coinData.logo;

        selectFromHtml += `
          <div class="option">
            <input class="s-c" type="radio" name="platform" value="${symbol}" id="${id}" data-url="${logoUrl}" ${isChecked}>
            <span class="label"><img class="logo-coin" src="${logoUrl}" alt="${symbol}">${symbol}</span>
          </div>
        `;
      });

      $selFrom.innerHTML = `
        <input type="checkbox" id="" class="options-view-button options-toggle-crypto selectpicker form-select-dropdown rounded-pill shadow-sm border-0">
        <div class="select-button brd selectpicker form-select form-select-dropdown rounded-pill shadow-sm border-0">
          <div class="selected-value">
            <span id="selected-value-crypto" data-id="btc-bitcoin">
              <img class="logo-coin" src="https://static.coinpaprika.com/coin/btc-bitcoin/logo.png" alt="BTC">
              <p>BTC</p>  
            </span>
          </div>
        </div>
        <div id="crypto-options" class="options mt-2">${selectFromHtml}</div>
      `;

      let optionsButton = document.querySelector(".options-view-button");
      let selectedCrypto = document.querySelector("#selected-value-crypto");
      selectedCryptoId = selectedCrypto.getAttribute("data-id");
      let imageSrc = selectedCrypto.querySelector("img.logo-coin").getAttribute("src");
      var checkbox = document.querySelector('.options-toggle-crypto');   
      var body = document.getElementById('body');
      body.addEventListener('click', function(event) {
        if (event.target !== checkbox) {
            checkbox.checked = false;
        }
      });   

      var radioInputs = document.querySelectorAll('input[type="radio"][name="platform"]');
      radioInputs.forEach(function (input) {
        input.addEventListener("change", function () {
          var selectedOptionCrypto = document.querySelector('#crypto-options input[type="radio"][name="platform"]:checked');
          selectedCrypto.setAttribute("data-id", selectedOptionCrypto.id);
          selectedCrypto.innerHTML = '<img class="logo-coin" src="'+selectedOptionCrypto.getAttribute('data-url')+'">'+selectedOptionCrypto.value;
          selectedCryptoId = selectedCrypto.getAttribute("data-id");
          selectedCryptoCode = selectedOptionCrypto.getAttribute('value');
          optionsButton.checked = false;
          return selectedCryptoId;
        });
      });
    });
}

//Coin LIST-------------------------------------------------    
function loadCoinList() {
  const params = {
    api_key: currencyApiKey,
  };

  return fetch(buildUrl(`${currencyUrl}/list`, params))
    .then(apiToJson)
}
function loadCoinFlags(key) {
  return fetch(buildUrl(`https://restcountries.com/v3.1/currency/${key}?fields=flags`))
  .then(apiToJson);
}
function renderHtmlCoinList(coinList) {
  let selectToHtml = "";

  const keys = Object.keys(coinList);
  Promise.all(keys.map((key) => loadCoinFlags(key)))
    .then((coinFlag) => {
      keys.forEach((key, index) => {
        const isChecked = key == "USD" ? "checked" : "";
        coinData = coinFlag[index];
        var flagUrl;
        if(key=="EUR"){
          flagUrl= "https://flagcdn.com/w320/eu.png";
        } else{
          flagUrl = coinData[0].flags.png;
        }

        selectToHtml += `
          <div class="option">
            <input class="s-c" type="radio" name="platform" value="${key}" id="${key}" data-url="${flagUrl}" ${isChecked}>
            <span class="label"><img class="logo-coin" src="${flagUrl}" alt="${key}">${key}</span>
          </div>
        `;
      });

      $selTo.innerHTML = `
        <input type="checkbox" id="" class="options-view-button options-toggle-coin selectpicker form-select-dropdown rounded-pill shadow-sm border-0">
        <div class="select-button brd selectpicker form-select form-select-dropdown rounded-pill shadow-sm border-0">
          <div class="selected-value">
            <span id="selected-value-coin" data-id="USD">
              <img class="logo-coin" src="https://flagcdn.com/us.svg" alt="USD">
              <p>USD</p>  
            </span>
          </div>
        </div>
        <div id="coin-options" class="options mt-2">${selectToHtml}</div>
      `;

      let optionsButton = document.querySelectorAll(".options-view-button");
      let selectedCoin = document.querySelector("#selected-value-coin");
      selectedCoinId = selectedCoin.getAttribute("data-id");
      let imageSrc = selectedCoin.querySelector("img.logo-coin").getAttribute("src");
      var checkbox = document.querySelector('.options-toggle-coin');   
      var body = document.getElementById('body');
      body.addEventListener('click', function(event) {
        if (event.target !== checkbox) {
            checkbox.checked = false;
        }
      });   

      var radioInputs = document.querySelectorAll('input[type="radio"][name="platform"]');
      radioInputs.forEach(function (input) {
        input.addEventListener("change", function () {
          var selectedOptionCoin = document.querySelector('#coin-options input[type="radio"][name="platform"]:checked');
          selectedCoin.setAttribute("data-id", selectedOptionCoin.id);
          selectedCoin.innerHTML = '<img class="logo-coin" src="'+selectedOptionCoin.getAttribute('data-url')+'">'+selectedOptionCoin.value;
          selectedCoinId = selectedCoin.getAttribute("data-id");
          optionsButton.checked = false;
          return selectedCoinId;
        });
      });
    });
}

//CONVERTOR---------------------------------------------------------------

function addEvents() {
  
  document
    .querySelector("#formConvert")
    .addEventListener("submit", handleFormConvertSubmit);
}

function handleFormConvertSubmit(e) {
  e.preventDefault();

  const data = getDataFormConvert();

  const validData = validateData(data);
  if (validData) {
    lastSearch = data;

    showLoading();
    hideUserError();
    fullConversion(data);
  }
}

function fullConversion(data){
  Promise.all([cryptocoinHistorical(data), coinHistorical(data)])
  .then((conversionArray) => {

    handleCryptoHistorical(conversionArray[0],data)
    handleCoinHistorical(conversionArray[1],data)
    
    const convertedArray = coinConversion(cryptoPrices,coinPrices)

    renderHtmlConvertedCoins(convertedArray, data);
    createChart(convertedArray, dates);
  })
  .catch(displayError)
  .finally(() => {
    hideLoading();
  });
}


function handleCryptoHistorical(cryptoHistoricalResponse,data){
  const cryptoRange= cryptoHistoricalResponse
  getCryptoPrices(cryptoRange);
}

function handleCoinHistorical(coinHistoricalResponse,data){        
  if(coinHistoricalResponse.errors === undefined){
    getDatesNPrices(coinHistoricalResponse.data, data);
  } else {
    displayErrorCoinHistorical(coinHistoricalResponse.errors);
  }
}

function getDataFormConvert() {
  return {
    from: selectedCryptoId,
    to: selectedCoinId,
    amount: $inpAmount.value,
    date: $inpDate.value,
  };
}

function renderHtmlConvertedCoins(convertedArray, data) {
  const amountFrom = data.amount;
  // const currencyFrom = data.from;
  let price = convertedArray[convertedArray.length-1];
  let conversionPrice = parseFloat(price)*amountFrom;
  price = formatPrice(price);
  conversionPrice = formatPrice(conversionPrice);

  function formatPrice(value){
    let formattedValue;
    if (value < 1) {
      formattedValue = value.toLocaleString('de-DE', { minimumFractionDigits: 7, maximumFractionDigits: 7 });
    } else {
      formattedValue = value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    return formattedValue;
  }
  let currencyTo = selectedCoinId;
  if (coinSwapper.checked){
    currencyTo = selectedCryptoCode;
  }else{
    currencyTo = selectedCoinId;
  }
  const date = data.date;
  var difference = convertedArray[convertedArray.length-1] - convertedArray[convertedArray.length-2];
  var percentage = Math.abs((difference / convertedArray[convertedArray.length-2]) * 100).toFixed(2);

  document.querySelector("#dataConvert").innerHTML = `
  <div class="col-5">
    <p class="small-subtitle">conversion</p>
    <h1 class="d-inline">${conversionPrice}</h1>
    <span>${currencyTo}</span>
  </div>
  <div class="col-4">
    <div id="coinRate" class="text-end">
    <p class="small-subtitle">coin rate</p>
    <h4>${price}</h4>
    <p><i class="bi bi-arrow-up-short" id="arrowRate"></i>${percentage}%</p>
    </div>
    </div>
    </div>`;
    // <span>${date}</span>
    
  

  const coinRate= document.querySelector("#coinRate");
  const arrowRate= document.querySelector("#arrowRate");
  if (percentage<1){
    coinRate.classList.add("text-danger");
    arrowRate.classList.add("rotate-arrow");
    exchangeRate = "#dc3545";
  }else{
    coinRate.classList.add("text-success");
    exchangeRate = "#198754";
    
  }
}

function cryptocoinHistorical(data) {
  // ?start=2023-01-01&interval=1d&end=2023-02-15
  const params = {
    start: modifyDate(data.date, -6),
    interval: "1d",
    end: correctDate(data.date),
  };
const base_currency_id= data.from

  return fetch(buildUrl(`${urlCoinpaprika}/tickers/${base_currency_id}/historical`, params))
    .then(apiToJson)
}

function coinHistorical(data) {
  const params = {
    apikey: historicalApiKey,
    date_from: modifyDate(data.date, -6),
    date_to: data.date,
    base_currency: "USD",
    currencies: selectedCoinId,
  };
  function updateParams() {
    if (coinSwapper.checked) {
      const temp = params.base_currency;
      params.base_currency = params.currencies;
      params.currencies = temp;
    }
  }
  updateParams();
  
  return  fetch(buildUrl(historicalUrl, params))
    .then(apiToJson)
}

function displayErrorCoinHistorical(){

}

function getDatesNPrices(coinHistorical, data){
  dates= [];
  coinPrices= [];
  for( let date in coinHistorical){
    dates.push(date);
    if(coinSwapper.checked){
      coinPrices.push(coinHistorical[date]["USD"])
    }else {
      coinPrices.push(coinHistorical[date][selectedCoinId])
    }
  }
  return dates, coinPrices;
}

function getCryptoPrices(cryptoArray){
  cryptoPrices = [];
  for( let key in cryptoArray){
    cryptoPrices.push(cryptoArray[key].price)
  }
  if (coinSwapper.checked){
    cryptoPrices = cryptoPrices.map(num => 1 / num)
  }
  return cryptoPrices;
}

function coinConversion(cryptoPrices, coinPrices) {
  const convertedArray = cryptoPrices.map((num, idx) => num * coinPrices[idx]);
  
  const formattedArray = convertedArray.map((value) => {
    if (value < 1) {
      return Number(value.toFixed(7));
    } else {
      return Number(value.toFixed(2));
    }
  });
  return formattedArray;
}


function modifyDate(dateStart, dateRange) {
  // YYYY-MM-DD
  const dateObj = new Date(dateStart);
  dateObj.setDate(dateObj.getDate() + dateRange);
  return dateObj.toISOString().split("T")[0];
}

function correctDate(date){
  const correctDate = new Date(date);
  correctDate.setDate(correctDate.getDate() + 1);
  return correctDate.toISOString().split("T")[0];
}

    
function apiToJson(rawResponse) {
  if(rawResponse.ok){
    //api validation
    return rawResponse.json();
  } else {
    // there's an error
    console.warn("api error", rawResponse.error);
  }
}
    
function showError(error) {
  //console.warn("error", error);
  showUserError("An error occurred during the query");
}
    
function buildUrl(url, params) {
  const urlObj = new URL(url);
        
  if (params !== undefined) {
    urlObj.search = new URLSearchParams(params).toString();
  }
  return urlObj;
}

function validateData(data) {

  if (data.amount === "" || data.amount === undefined) {
    displayUserError("Field amount cannot be empty");
    return false;
  }

  if (data.date === "" || data.date === undefined) {
    displayUserError("Field date cannot be empty");
    return false;
  }
  return true;
}

function displayError(error) {
  console.warn("error", error);
  displayUserError("An error occurred during the query");
}

function displayUserError(messaje) {
  document.querySelector("#errorUsuario").classList.remove("d-none");
  document.querySelector("#errorUsuario").innerHTML = messaje;
}

function hideUserError() {
  document.querySelector("#errorUsuario").classList.add("d-none");
}

function showLoading() {
  document.querySelector("#loading").classList.remove("d-none");
}

function hideLoading() {
  document.querySelector("#loading").classList.add("d-none");
}

function disableFormConvert() {
  $selFrom.setAttribute("disabled", true);
  $selTo.setAttribute("disabled", true);
  $btnConvert.setAttribute("disabled", true);
}

function desdisableFormConvert() {
  $selFrom.removeAttribute("disabled");
  $selTo.removeAttribute("disabled");
  $btnConvert.removeAttribute("disabled");
}

function coinSwapperToggle() {
  if (coinSwapper.checked) {  
    $selFrom.classList.toggle("order-0");
    $selFrom.classList.toggle("order-2")
    $selTo.classList.toggle("order-2")
    $selTo.classList.toggle("order-0")
  } else {
    $selFrom.classList.toggle("order-0")
    $selFrom.classList.toggle("order-2")
    $selTo.classList.toggle("order-2")
    $selTo.classList.toggle("order-0")    
  }
}

function createChart(convertedArray, dates){
  if(conversionChart !== undefined){
    conversionChart.destroy();
  }
  dates = dates.map((date) => {
    const dateArr = date.split("-").reverse();
    return `${dateArr[0]}-${dateArr[1]}`;
  });

  let delayed;

  conversionChart = new Chart($convertChart, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
        borderColor: exchangeRate,
        data: convertedArray,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointStyle: "circle",
        pointBorderWidth: 2,
        pointBorderColor: "#212121",
        pointBackgroundColor: "#fff",
      },
    ]
    },
    options: {
      grid: {
        display: false,
      },
        radious: 20,
        hitRadious: 30,
        plugins: {
          legend: {
            display: false
          },
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: false,
            grace: "10%",
            grid: {
              display: false,
              // borderColor: 'rgba(250, 250, 250, 1)',
            }
          },
          x:{
            grid: {
              display: false,
              // borderColor: 'rgba(250, 250, 250, 1)',
            }
          }
        },
      animation: {
        duration: 700,
        easing: 'easeOutSine'
    }
    }
  });

}