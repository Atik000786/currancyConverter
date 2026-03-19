// countryList is already in code.js - good

const BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const fromCurr = document.querySelector(".from select");
const toCurr   = document.querySelector(".to select");
const msg      = document.querySelector(".msg");
const btn      = document.querySelector("form button");
const amountInput = document.querySelector(".amount input");

// Populate dropdowns
for (let select of dropdowns) {
    for (let currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;

        if (select.name === "from" && currCode === "USD") newOption.selected = true;
        if (select.name === "to"   && currCode === "INR") newOption.selected = true;

        select.appendChild(newOption);
    }

    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
        getExchangeRate();
    });
}

function updateFlag(element) {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    if (!countryCode) return;

    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    if (img) img.src = newSrc;
}

async function getExchangeRate() {
    let amtVal = amountInput.value.trim();

    if (!amtVal || isNaN(amtVal) || Number(amtVal) <= 0) {
        amtVal = 0;
        amountInput.value = "";
    }

    const from = fromCurr.value.toLowerCase();
    const to   = toCurr.value.toLowerCase();

    if (!from || !to || from === to) {
        msg.innerText = from === to ? "Cannot convert same currency" : "Select both currencies";
        return;
    }

    // Important: fetch ONLY the FROM currency file
    const URL = `${BASE_URL}/${from}.json`;

    try {
        msg.innerText = "Fetching latest rate...";

        const response = await fetch(URL);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Currency '${from.toUpperCase()}' not supported`);
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Now get the rate: data[from][to]
        const rate = data[from]?.[to];

        if (typeof rate !== "number") {
            throw new Error(`Rate ${from.toUpperCase()} → ${to.toUpperCase()} not available`);
        }

        const finalAmount = (Number(amtVal) * rate).toFixed(2);

        msg.innerText = ` ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
    } catch (err) {
        console.error("Fetch error:", err);
        msg.innerText = `Error: ${err.message}. Try again or different currency.`;
    }
}

// Events
btn.addEventListener("click", (evt) => {
    evt.preventDefault();
    getExchangeRate();
});

amountInput.addEventListener("input", getExchangeRate);

// Initial run
updateFlag(fromCurr);
updateFlag(toCurr);
getExchangeRate();