/* =====================================
   RO'LYFE EXPIRATION SELECTOR
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


function setExpiration(type) {

    const expirationInput =
        document.getElementById(
            "expiration"
        );


    if (!expirationInput) {

        return;

    }


    const today =
        new Date();


    let selectedDate =
        new Date();


    /*
       ⚡ 0DTE
    */

    if (type === "0dte") {

        selectedDate =
            new Date();

    }


    /*
       🔥 NEXT EXPIRATION

       Finds the next Friday.
    */

    if (type === "next") {

        const day =
            today.getDay();


        const daysUntilFriday =
            (5 - day + 7) % 7;


        selectedDate =
            new Date();


        selectedDate.setDate(

            today.getDate() +

            (
                daysUntilFriday === 0
                    ? 7
                    : daysUntilFriday
            )

        );

    }


    /*
       📅 THIS FRIDAY
    */

    if (type === "thisFriday") {

        const day =
            today.getDay();


        const daysUntilFriday =
            (5 - day + 7) % 7;


        selectedDate =
            new Date();


        selectedDate.setDate(

            today.getDate() +

            daysUntilFriday

        );

    }


    /*
       📆 NEXT FRIDAY
    */

    if (type === "nextFriday") {

        const day =
            today.getDay();


        let daysUntilFriday =
            (5 - day + 7) % 7;


        if (daysUntilFriday === 0) {

            daysUntilFriday =
                7;

        }


        selectedDate =
            new Date();


        selectedDate.setDate(

            today.getDate() +

            daysUntilFriday +

            7

        );

    }


    expirationInput.value =
        formatDateForInput(
            selectedDate
        );

}
