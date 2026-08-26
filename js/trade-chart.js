/* ============================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   VISUAL TRADE CHART ENGINE

   PURPOSE:
   Displays a visual execution map showing:

   • Stop
   • Entry
   • Target 1
   • Target 2
   • Target 3
   • Long / Short direction
   • Risk zone
   • Reward zone
   • Automatic price scaling

   PUBLIC API:

   TradeChart.render({
       direction,
       entry,
       stop,
       target1,
       target2,
       target3
   });

   TradeChart.clear();

============================================ */

(function () {

    "use strict";


    console.log(
        "📊 RO'LYFE TRADE CHART ENGINE LOADING..."
    );


    /* ============================================
       GET ELEMENT
    ============================================ */

    function getElement(id) {

        return document.getElementById(
            id
        );

    }


    /* ============================================
       NUMBER VALIDATION
    ============================================ */

    function isValidNumber(value) {

        return (
            typeof value === "number" &&
            Number.isFinite(value)
        );

    }


    /* ============================================
       MONEY FORMAT
    ============================================ */

    function money(value) {

        if (
            !isValidNumber(value)
        ) {

            return "$0.00";

        }


        return value.toLocaleString(

            "en-US",

            {

                style:
                    "currency",

                currency:
                    "USD",

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }

        );

    }


    /* ============================================
       PERCENT FORMAT
    ============================================ */

    function percent(value) {

        if (
            !isValidNumber(value)
        ) {

            return "0.00%";

        }


        return (
            value.toFixed(2) +
            "%"
        );

    }


    /* ============================================
       CALCULATE POSITION
       Converts a price into a vertical percentage.
    ============================================ */

    function calculatePosition(

        price,
        minimum,
        maximum

    ) {

        if (
            maximum === minimum
        ) {

            return 50;

        }


        const position =
            (
                (
                    price -
                    minimum
                ) /
                (
                    maximum -
                    minimum
                )
            ) *
            100;


        return Math.max(

            0,

            Math.min(
                100,
                position
            )

        );

    }


    /* ============================================
       CREATE PRICE SCALE

       Adds padding above and below the trade.
    ============================================ */

    function createScale(prices) {

        const validPrices =
            prices.filter(

                function (price) {

                    return isValidNumber(
                        price
                    );

                }

            );


        const lowest =
            Math.min(
                ...validPrices
            );


        const highest =
            Math.max(
                ...validPrices
            );


        const range =
            highest -
            lowest;


        const padding =
            range === 0

                ?

                Math.max(
                    highest * 0.05,
                    1
                )

                :

                range * 0.15;


        return {

            minimum:
                lowest -
                padding,

            maximum:
                highest +
                padding

        };

    }


    /* ============================================
       CREATE CHART ROW
    ============================================ */

    function createLevel(

        label,
        price,
        position,
        type,
        sideText

    ) {

        return `

            <div
                class="trade-chart-level ${type}"
                style="
                    bottom:
                    ${position}%;
                "
            >

                <div
                    class="trade-chart-line"
                ></div>


                <div
                    class="trade-chart-label"
                >

                    <span
                        class="trade-chart-level-name"
                    >

                        ${label}

                    </span>


                    <span
                        class="trade-chart-level-price"
                    >

                        ${money(price)}

                    </span>

                </div>


                <div
                    class="trade-chart-side-text"
                >

                    ${sideText}

                </div>

            </div>

        `;

    }


    /* ============================================
       RENDER TRADE CHART
    ============================================ */

    function render(data) {

        console.log(
            "📊 RENDERING RO'LYFE TRADE CHART...",
            data
        );


        if (
            !data
        ) {

            console.error(
                "Trade chart data is missing."
            );

            return;

        }


        const direction =
            data.direction === "Short"

                ?

                "Short"

                :

                "Long";


        const entry =
            Number(
                data.entry
            );


        const stop =
            Number(
                data.stop
            );


        const target1 =
            Number(
                data.target1
            );


        const target2 =
            Number(
                data.target2
            );


        const target3 =
            Number(
                data.target3
            );


        /* ========================================
           VALIDATE
        ======================================== */

        const requiredValues = [

            entry,
            stop,
            target1,
            target2,
            target3

        ];


        if (

            requiredValues.some(

                function (value) {

                    return !isValidNumber(
                        value
                    );

                }

            )

        ) {

            console.error(
                "Invalid chart price data."
            );

            return;

        }


        /* ========================================
           CREATE SCALE
        ======================================== */

        const scale =
            createScale(

                [

                    entry,
                    stop,
                    target1,
                    target2,
                    target3

                ]

            );


        const minimum =
            scale.minimum;


        const maximum =
            scale.maximum;


        /* ========================================
           CALCULATE POSITIONS
        ======================================== */

        const entryPosition =
            calculatePosition(
                entry,
                minimum,
                maximum
            );


        const stopPosition =
            calculatePosition(
                stop,
                minimum,
                maximum
            );


        const target1Position =
            calculatePosition(
                target1,
                minimum,
                maximum
            );


        const target2Position =
            calculatePosition(
                target2,
                minimum,
                maximum
            );


        const target3Position =
            calculatePosition(
                target3,
                minimum,
                maximum
            );


        /* ========================================
           DIRECTION TEXT
        ======================================== */

        let chartTitle;
        let riskText;
        let rewardText;
        let directionArrow;


        if (
            direction === "Long"
        ) {

            chartTitle =
                "📈 LONG TRADE MAP";


            riskText =
                "🔴 RISK BELOW ENTRY";


            rewardText =
                "🟢 REWARD ABOVE ENTRY";


            directionArrow =
                "↑";

        }

        else {

            chartTitle =
                "📉 SHORT TRADE MAP";


            riskText =
                "🔴 RISK ABOVE ENTRY";


            rewardText =
                "🟢 REWARD BELOW ENTRY";


            directionArrow =
                "↓";

        }


        /* ========================================
           GET CONTAINER
        ======================================== */

        let container =
            getElement(
                "rolyfeTradeChart"
            );


        if (
            !container
        ) {

            console.log(
                "Chart container does not exist. Creating one."
            );


            const output =
                getElement(
                    "tradePlanOutput"
                );


            if (
                !output
            ) {

                console.error(
                    "Unable to find chart output area."
                );

                return;

            }


            container =
                document.createElement(
                    "div"
                );


            container.id =
                "rolyfeTradeChart";


            output.appendChild(
                container
            );

        }


        /* ========================================
           BUILD CHART
        ======================================== */

        container.innerHTML = `

            <section
                class="trade-chart-card"
            >

                <div
                    class="trade-chart-header"
                >

                    <div>

                        <h3>

                            ${chartTitle}

                        </h3>

                        <p>

                            Visualize the trade
                            before you execute it.

                        </p>

                    </div>


                    <div
                        class="
                            trade-chart-direction
                            ${direction.toLowerCase()}
                        "
                    >

                        ${directionArrow}

                        ${direction.toUpperCase()}

                    </div>

                </div>


                <div
                    class="trade-chart-zones"
                >

                    <div
                        class="
                            trade-chart-zone
                            risk-zone
                        "
                    >

                        ${riskText}

                    </div>


                    <div
                        class="
                            trade-chart-zone
                            reward-zone
                        "
                    >

                        ${rewardText}

                    </div>

                </div>


                <div
                    class="trade-chart-body"
                >

                    <div
                        class="trade-chart-scale"
                    >

                        <span>

                            ${money(maximum)}

                        </span>


                        <span>

                            ${money(
                                (
                                    maximum +
                                    minimum
                                ) / 2
                            )}

                        </span>


                        <span>

                            ${money(minimum)}

                        </span>

                    </div>


                    <div
                        class="
                            trade-chart-visual
                            ${direction.toLowerCase()}
                        "
                    >

                        ${createLevel(

                            "T3",

                            target3,

                            target3Position,

                            "target target-3",

                            "TARGET 3"

                        )}


                        ${createLevel(

                            "T2",

                            target2,

                            target2Position,

                            "target target-2",

                            "TARGET 2"

                        )}


                        ${createLevel(

                            "T1",

                            target1,

                            target1Position,

                            "target target-1",

                            "TARGET 1"

                        )}


                        ${createLevel(

                            "ENTRY",

                            entry,

                            entryPosition,

                            "entry-level",

                            "EXECUTION POINT"

                        )}


                        ${createLevel(

                            "STOP",

                            stop,

                            stopPosition,

                            "stop-level",

                            "INVALIDATION POINT"

                        )}


                        <div
                            class="trade-chart-center-line"
                        ></div>


                        <div
                            class="
                                trade-chart-arrow
                                ${direction.toLowerCase()}
                            "
                        >

                            ${directionArrow}

                        </div>

                    </div>

                </div>


                <div
                    class="trade-chart-footer"
                >

                    <div>

                        <strong>

                            STOP

                        </strong>

                        <span>

                            ${money(stop)}

                        </span>

                    </div>


                    <div>

                        <strong>

                            ENTRY

                        </strong>

                        <span>

                            ${money(entry)}

                        </span>

                    </div>


                    <div>

                        <strong>

                            T1

                        </strong>

                        <span>

                            ${money(target1)}

                        </span>

                    </div>


                    <div>

                        <strong>

                            T2

                        </strong>

                        <span>

                            ${money(target2)}

                        </span>

                    </div>


                    <div>

                        <strong>

                            T3

                        </strong>

                        <span>

                            ${money(target3)}

                        </span>

                    </div>

                </div>


                <div
                    class="trade-chart-rule"
                >

                    🧠
                    The chart defines the risk.
                    The position size fits the account.
                    The ladder manages the exit.

                </div>

            </section>

        `;


        console.log(
            "🟢 RO'LYFE TRADE CHART RENDERED"
        );

    }


    /* ============================================
       CLEAR CHART
    ============================================ */

    function clear() {

        const container =
            getElement(
                "rolyfeTradeChart"
            );


        if (
            container
        ) {

            container.innerHTML =
                "";

        }


        console.log(
            "📊 RO'LYFE TRADE CHART CLEARED"
        );

    }


    /* ============================================
       PUBLIC API
    ============================================ */

    window.TradeChart = {

        render:
            render,

        clear:
            clear

    };


    /* ============================================
       READY
    ============================================ */

    console.log(
        "🟢 RO'LYFE TRADE CHART ENGINE READY"
    );


})();
