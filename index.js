function openSPX() {
    const appPackage = "com.shopee.spx.driver.brazil";
    const fallback = encodeURIComponent("https://play.google.com/store/apps/details?id=" + appPackage);
    window.location.href = `intent://#Intent;scheme=spx;package=${appPackage};S.browser_fallback_url=${fallback};end`;
}

function pad(n) {
    return String(n).padStart(2, "0");
}

function setToday() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const iso = `${yyyy}-${mm}-${dd}`;

    if (!localStorage.getItem("savedDate")) {
        localStorage.setItem("savedDate", iso);
    }

    const savedDate = localStorage.getItem("savedDate");

    // Formata de AAAA-MM-DD
    const [year, month, day] = savedDate.split("-");

    const formattedDate = `${day}/${month}/${year}`; // 04/08/2026
    const shortDate = `${day}/${month}`;             // 04/08

    document.getElementById("todayTitle").textContent = shortDate;
    document.getElementById("todayTimestamp").textContent = formattedDate;
    document.getElementById("shiftDate").textContent = formattedDate;

    document.getElementById("noticeDate").textContent = shortDate;
}

const timeInputs = Array.from(document.querySelectorAll(".timeEditable"));

// CARREGA HORÁRIO SALVO
const savedTime = localStorage.getItem("savedTime");

if (savedTime) {
    timeInputs.forEach((input) => {
        input.value = savedTime;
    });
}

function normalizeTime(value) {
    const onlyNumbers = value.replace(/[^0-9]/g, "").slice(0, 4);

    if (onlyNumbers.length <= 2) return onlyNumbers;

    return onlyNumbers.slice(0, 2) + ":" + onlyNumbers.slice(2);
}

function syncAllTimes(value) {
    const time = normalizeTime(value);
    const digits = time.replace(/[^0-9]/g, "");

    if (digits.length !== 4) return;

    // Atualiza todos os campos
    timeInputs.forEach((input) => {
        input.value = time;
    });

    // Salva no localStorage
    localStorage.setItem("savedTime", time);
}

function lockTime(input) {
    const typed = normalizeTime(input.value);
    const digits = typed.replace(/[^0-9]/g, "");
    const saved = localStorage.getItem("savedTime") || "13:50";

    if (digits.length === 4) {
        syncAllTimes(typed);
    } else {
        timeInputs.forEach((item) => {
            item.value = saved;
        });
    }

    input.readOnly = true;
    input.classList.remove("editing");
    input.blur();
}

timeInputs.forEach((input) => {

    input.addEventListener("dblclick", () => {
        input.readOnly = false;
        input.classList.add("editing");
        input.focus();
        input.select();
    });

    input.addEventListener("input", () => {
        input.value = normalizeTime(input.value);

        const digits = input.value.replace(/[^0-9]/g, "");

        if (digits.length === 4) {
            syncAllTimes(input.value);
        }
    });

    input.addEventListener("blur", () => lockTime(input));

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === "Escape") {
            lockTime(input);
        }
    });
});

// REGIÃO
const regionInput = document.getElementById("regionValue");

// CARREGA REGIÃO SALVA
const savedRegion = localStorage.getItem("savedRegion");

if (savedRegion) {
    regionInput.value = savedRegion;
}

regionInput.addEventListener("dblclick", () => {
    regionInput.readOnly = false;
    regionInput.classList.add("editing");
    regionInput.focus();
    regionInput.select();
});

function formatRegion(value) {
    // Remove o hífen existente e coloca tudo em maiúsculo
    value = value.toUpperCase().replace("-", "");

    // Ex.: S4 -> S-4 | a12 -> A-12
    return value.replace(/^([A-Z]+)(\d+)$/, "$1-$2");
}

function finishRegionEdit() {
    regionInput.value = formatRegion(regionInput.value);
    regionInput.readOnly = true;
    regionInput.classList.remove("editing");
}

regionInput.addEventListener("blur", finishRegionEdit);

regionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        finishRegionEdit();
    }
});

function lockRegion() {
    regionInput.readOnly = true;
    regionInput.classList.remove("editing");

    localStorage.setItem("savedRegion", regionInput.value);

    regionInput.blur();
}

regionInput.addEventListener("input", () => {
    localStorage.setItem("savedRegion", regionInput.value);
});

regionInput.addEventListener("blur", lockRegion);

regionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "Escape") {
        lockRegion();
    }
});

setToday();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js");
    });
}

const todayTime = document.getElementById("todayTime");
const savedTodayTime = localStorage.getItem("savedTodayTime");

if (savedTodayTime) {
    todayTime.textContent = savedTodayTime;
}

todayTime.addEventListener("dblclick", () => {
    todayTime.contentEditable = "true";
    todayTime.classList.add("editing");
    todayTime.focus();

    // Seleciona todo o texto
    const range = document.createRange();
    range.selectNodeContents(todayTime);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
});

function finishTimeEdit() {
    let value = todayTime.textContent.replace(/\D/g, "");

    if (value.length === 4) {
        value = `${value.slice(0, 2)}:${value.slice(2)}`;
    }

    todayTime.textContent = value;

    // Salva no localStorage
    localStorage.setItem("savedTodayTime", value);

    todayTime.contentEditable = "false";
    todayTime.classList.remove("editing");
}

todayTime.addEventListener("blur", finishTimeEdit);

todayTime.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // evita quebra de linha
        finishTimeEdit();
    }
});

const hubText = document.getElementById("hubText");
const hubSelect = document.getElementById("hubSelect");

hubText.addEventListener("dblclick", () => {
    hubText.style.display = "none";
    hubSelect.style.display = "inline-block";
    hubSelect.value = hubText.textContent;
    hubSelect.focus();
});

function finishHubEdit() {
    hubText.textContent = hubSelect.value;
    hubSelect.style.display = "none";
    hubText.style.display = "inline";
}

hubSelect.addEventListener("change", finishHubEdit);
hubSelect.addEventListener("blur", finishHubEdit);