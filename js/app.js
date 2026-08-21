/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MAIN APPLICATION ENGINE
   js/app.js
========================================================= */


/* =====================================
   DATE FORMATTING
===================================== */

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =====================================
   OPTION EXPIRATION SELECTOR
===================================== */

function setExpiration(type) {

    const expirationInput =
        document.getElementById(
            "expiration"
        );


    if (!expirationInput) {

        console.error(
            "Expiration input not found."
        );

        return;

    }


    const today =
        new Date();


    let selectedDate =
        new Date(today);


    /*
       ⚡ 0DTE

       Today
    */

    if (type === "0dte") {

        selectedDate =
            new Date(today);

    }


    /*
       🔥 NEXT EXPIRATION

       Next Friday.
       If today is Friday,
       choose next week's Friday.
    */

    else if (type === "next") {

        const day =
            today.getDay();


        let daysUntilFriday =
            (5 - day + 7) % 7;


        if (daysUntilFriday === 0) {

            daysUntilFriday = 7;

        }


        selectedDate =
            new Date(today);


        selectedDate.setDate(

            today.getDate() +
            daysUntilFriday

        );

    }


    /*
       📅 THIS FRIDAY

       Your HTML currently uses:

       setExpiration('friday')

       So we support BOTH
       "friday" and "thisFriday".
    */

    else if (

        type === "friday" ||
        type === "thisFriday"

    ) {

        const day =
            today.getDay();


        const daysUntilFriday =
            (5 - day + 7) % 7;


        selectedDate =
            new Date(today);


        selectedDate.setDate(

            today.getDate() +
            daysUntilFriday

        );

    }


    /*
       📆 NEXT FRIDAY
    */

    else if (type === "nextFriday") {

        const day =
            today.getDay();


        let daysUntilFriday =
            (5 - day + 7) % 7;


        if (daysUntilFriday === 0) {

            daysUntilFriday = 7;

        }


        selectedDate =
            new Date(today);


        selectedDate.setDate(

            today.getDate() +
            daysUntilFriday +
            7

        );

    }


    /*
       🗓 CUSTOM

       Focus the native date picker.
    */

    else if (type === "custom") {

        expirationInput.focus();

        if (typeof expirationInput.showPicker === "function") {

            expirationInput.showPicker();

        }

        return;

    }


    /*
       PUT DATE INTO INPUT
    */

    expirationInput.value =
        formatDateForInput(
            selectedDate
        );


    console.log(

        "RO'Lyfe Expiration Selected:",

        type,

        expirationInput.value

    );

}


/* =====================================
   MARKET STATUS SYSTEM
===================================== */

function updateMarketStatus() {

    const spyStatus =
        document.getElementById(
            "spyStatus"
        );


    const qqqStatus =
        document.getElementById(
            "qqqStatus"
        );


    const vixStatus =
        document.getElementById(
            "vixStatus"
        );


    /*
       Initial system status.

       Later we can connect these
       to real market data.
    */

    if (spyStatus) {

        spyStatus.textContent =
            "SCANNING 📡";

    }


    if (qqqStatus) {

        qqqStatus.textContent =
            "SCANNING 📡";

    }


    if (vixStatus) {

        vixStatus.textContent =
            "MONITORING ⚡";

    }

}


/* =====================================
   RTIC SYSTEM STATUS
===================================== */

function updateSystemStatus() {

    console.log(
        "RO'Lyfe RTIC System Online 🟢"
    );

}


/* =====================================
   GLOBAL APP START
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        console.log(
            "🔥 RO'LYFE TACTICAL INTELLIGENCE CENTER™ LOADED"
        );


        updateMarketStatus();


        updateSystemStatus();

    }

);


/* =====================================
   MAKE FUNCTIONS AVAILABLE GLOBALLY
===================================== */

window.setExpiration =
    setExpiration;

window.formatDateForInput =
    formatDateForInput;

window.updateMarketStatus =
    updateMarketStatus;

window.updateSystemStatus =
    updateSystemStatus;
