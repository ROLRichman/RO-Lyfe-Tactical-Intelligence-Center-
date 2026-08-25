/* ============================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MASTER TRADE PLANNER ENGINE
============================================ */

(function () {

    "use strict";


    console.log(
        "🔥 RO'LYFE TRADE PLANNER ENGINE LOADING..."
    );


    /* ============================================
       DEFAULT PRESETS
    ============================================ */

    const DEFAULTS = {

        symbol:
            "NVDA",

        instrument:
            "Option",

        direction:
            "Long",

        accountSize:
            10000,

        riskPercent:
            1,

        probability:
            70,

        impliedVolatility:
            35,

        entry:
            150,

        stop:
            145,

        target1:
            "",

        target2:
            "",

        target3:
            "",

        optionType:
            "Call",

        strike:
            150,

        expiration:
            "",

        optionEntry:
            2.53,

        optionDelta:
            0.50,

        optionTarget1:
            3.00,

        optionTarget2:
            3.50,

        optionTarget3:
            4.00

    };


    /* ============================================
       GET ELEMENT
    ============================================ */

    function getElement(id) {

        return document.getElementById(id);

    }


    /* ============================================
       GET VALUE WITH DEFAULT FALLBACK
    ============================================ */

    function getValue(id, defaultValue) {

        const element =
            getElement(id);


        if (!element) {

            return defaultValue;

        }


        const value =
            element.value;


        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {

            return defaultValue;

        }


        return value;

    }


    /* ============================================
       GET NUMBER WITH DEFAULT FALLBACK
    ============================================ */

    function getNumber(id, defaultValue) {

        const element =
            getElement(id);


        if (!element) {

            return defaultValue;

        }


        const value =
            parseFloat(
                element.value
            );


        if (
            Number.isNaN(value)
        ) {

            return defaultValue;

        }


        return value;

    }


    /* ============================================
       MONEY FORMAT
    ============================================ */

    function money(value) {

        if (
            !Number.isFinite(value)
        ) {

            return "$0.00";

        }


        return value.toLocaleString(

            "en-US",

            {

                style:
                    "currency",

                currency:
                    "USD"

            }

        );

    }


    /* ============================================
       NUMBER FORMAT
    ============================================ */

    function number(value, decimals = 2) {

        if (
            !Number.isFinite(value)
        ) {

            return "0";

        }


        return value.toFixed(
            decimals
        );

    }


    /* ============================================
       SET DEFAULT VALUES ON PAGE
    ============================================ */

    function loadDefaults() {

        console.log(
            "Loading RO'LYFE default trade values..."
        );


        Object.keys(DEFAULTS).forEach(

            function (id) {

                const element =
                    getElement(id);


                if (!element) {

                    return;

                }


                if (
                    element.value === ""
                ) {

                    element.value =
                        DEFAULTS[id];

                }

            }

        );

    }


    /* ============================================
       RESTORE DEFAULT ON EMPTY FIELD
    ============================================ */

    function enableDefaultRestore() {

        Object.keys(DEFAULTS).forEach(

            function (id) {

                const element =
                    getElement(id);


                if (!element) {

                    return;

                }


                element.addEventListener(

                    "blur",

                    function () {

                        if (
                            element.value === ""
                        ) {

                            element.value =
                                DEFAULTS[id];

                        }

                    }

                );

            }

        );

    }


    /* ============================================
       CALCULATE AUTOMATIC TARGET
    ============================================ */

    function calculateTarget(

        entry,
        stop,
        multiple,
        direction

    ) {

        const riskPerShare =
            Math.abs(
                entry - stop
            );


        if (
            direction === "Long"
        ) {

            return (
                entry +
                (
                    riskPerShare *
                    multiple
                )
            );

        }


        return (
            entry -
            (
                riskPerShare *
                multiple
            )
        );

    }


    /* ============================================
       CREATE TRADE PLAN
    ============================================ */

    function createPlan() {

        console.log(
            "🎯 RO'LYFE CREATE MASTER TRADE PLAN STARTED"
        );


        /* ========================================
           GET FORM VALUES
        ======================================== */

        const symbol =
            getValue(
                "symbol",
                DEFAULTS.symbol
            )
            .toUpperCase()
            .trim();


        const instrument =
            getValue(
                "instrument",
                DEFAULTS.instrument
            );


        const direction =
            getValue(
                "direction",
                DEFAULTS.direction
            );


        const accountSize =
            getNumber(
                "accountSize",
                DEFAULTS.accountSize
            );


        const riskPercent =
            getNumber(
                "riskPercent",
                DEFAULTS.riskPercent
            );


        const probability =
            getNumber(
                "probability",
                DEFAULTS.probability
            );


        const impliedVolatility =
            getNumber(
                "impliedVolatility",
                DEFAULTS.impliedVolatility
            );


        const entry =
            getNumber(
                "entry",
                DEFAULTS.entry
            );


        const stop =
            getNumber(
                "stop",
                DEFAULTS.stop
            );


        const manualTarget1 =
            getElement(
                "target1"
            );


        const manualTarget2 =
            getElement(
                "target2"
            );


        const manualTarget3 =
            getElement(
                "target3"
            );


        const optionType =
            getValue(
                "optionType",
                DEFAULTS.optionType
            );


        const strike =
            getNumber(
                "strike",
                DEFAULTS.strike
            );


        const expiration =
            getValue(
                "expiration",
                DEFAULTS.expiration
            );


        const optionEntry =
            getNumber(
                "optionEntry",
                DEFAULTS.optionEntry
            );


        const optionDelta =
            getNumber(
                "optionDelta",
                DEFAULTS.optionDelta
            );


        const optionTarget1 =
            getNumber(
                "optionTarget1",
                DEFAULTS.optionTarget1
            );


        const optionTarget2 =
            getNumber(
                "optionTarget2",
                DEFAULTS.optionTarget2
            );


        const optionTarget3 =
            getNumber(
                "optionTarget3",
                DEFAULTS.optionTarget3
            );


        /* ========================================
           VALIDATION
        ======================================== */

        if (
            entry <= 0
        ) {

            alert(
                "Entry price must be greater than zero."
            );

            return;

        }


        if (
            stop <= 0
        ) {

            alert(
                "Stop price must be greater than zero."
            );

            return;

        }


        if (
            entry === stop
        ) {

            alert(
                "Entry and Stop cannot be the same price."
            );

            return;

        }


        /* ========================================
           RISK ENGINE
        ======================================== */

        const dollarRisk =
            accountSize *
            (
                riskPercent / 100
            );


        const riskPerShare =
            Math.abs(
                entry - stop
            );


        const stockPositionSize =
            Math.floor(
                dollarRisk /
                riskPerShare
            );


        const stockPositionValue =
            stockPositionSize *
            entry;


        /* ========================================
           STOCK TARGETS
        ======================================== */

        let target1;
        let target2;
        let target3;


        if (
            manualTarget1 &&
            manualTarget1.value !== ""
        ) {

            target1 =
                parseFloat(
                    manualTarget1.value
                );

        }

        else {

            target1 =
                calculateTarget(
                    entry,
                    stop,
                    1,
                    direction
                );

        }


        if (
            manualTarget2 &&
            manualTarget2.value !== ""
        ) {

            target2 =
                parseFloat(
                    manualTarget2.value
                );

        }

        else {

            target2 =
                calculateTarget(
                    entry,
                    stop,
                    2,
                    direction
                );

        }


        if (
            manualTarget3 &&
            manualTarget3.value !== ""
        ) {

            target3 =
                parseFloat(
                    manualTarget3.value
                );

        }

        else {

            target3 =
                calculateTarget(
                    entry,
                    stop,
                    3,
                    direction
                );

        }


        /* ========================================
           REWARD CALCULATIONS
        ======================================== */

        const reward1 =
            Math.abs(
                target1 - entry
            );


        const reward2 =
            Math.abs(
                target2 - entry
            );


        const reward3 =
            Math.abs(
                target3 - entry
            );


        const rr1 =
            reward1 /
            riskPerShare;


        const rr2 =
            reward2 /
            riskPerShare;


        const rr3 =
            reward3 /
            riskPerShare;


        /* ========================================
           LADDER ALLOCATION

           40% TARGET 1
           30% TARGET 2
           20% TARGET 3
           10% RUNNER
        ======================================== */

        const ladder1 =
            Math.floor(
                stockPositionSize *
                0.40
            );


        const ladder2 =
            Math.floor(
                stockPositionSize *
                0.30
            );


        const ladder3 =
            Math.floor(
                stockPositionSize *
                0.20
            );


        const runner =
            stockPositionSize -
            ladder1 -
            ladder2 -
            ladder3;


        /* ========================================
           OPTION POSITION SIZING

           Premium × 100 = Cost Per Contract
        ======================================== */

        const optionContractCost =
            optionEntry *
            100;


        const optionContracts =
            Math.floor(
                dollarRisk /
                optionContractCost
            );


        const optionPositionCost =
            optionContracts *
            optionContractCost;


        /* ========================================
           OPTION TARGET PROFITS
        ======================================== */

        const optionProfit1 =
            (
                optionTarget1 -
                optionEntry
            ) *
            100 *
            optionContracts;


        const optionProfit2 =
            (
                optionTarget2 -
                optionEntry
            ) *
            100 *
            optionContracts;


        const optionProfit3 =
            (
                optionTarget3 -
                optionEntry
            ) *
            100 *
            optionContracts;


        /* ========================================
           TRADE QUALITY
        ======================================== */

        let status =
            "⚠️ REVIEW";


        let statusText =
            "Trade needs review before execution.";


        if (
            probability >= 70 &&
            rr2 >= 2
        ) {

            status =
                "🟢 GREEN SETUP";


            statusText =
                "Probability and reward profile meet RO'LYFE GREEN criteria.";

        }

        else if (
            probability >= 55
        ) {

            status =
                "🟡 CAUTION SETUP";


            statusText =
                "Possible setup, but requires additional confirmation.";

        }

        else {

            status =
                "🔴 LOW PROBABILITY";


            statusText =
                "Probability is below preferred execution criteria.";

        }


        /* ========================================
           CREATE DATE
        ======================================== */

        const now =
            new Date();


        const planDate =
            now.toLocaleString();


        /* ========================================
           BUILD OUTPUT
        ======================================== */

        const output =
            getElement(
                "tradePlanOutput"
            );


        if (
            !output
        ) {

            console.error(
                "tradePlanOutput element not found."
            );

            alert(
                "ERROR: Trade plan output area is missing."
            );

            return;

        }


        output.innerHTML = `

            <div class="trade-plan-card">

                <h3>
                    🎯 RO'LYFE MASTER TRADE PLAN
                </h3>


                <div class="plan-status">

                    ${status}

                </div>


                <div class="plan-section">

                    <h4>
                        📋 TRADE IDENTITY
                    </h4>

                    <p>
                        <strong>Symbol:</strong>
                        ${symbol}
                    </p>

                    <p>
                        <strong>Instrument:</strong>
                        ${instrument}
                    </p>

                    <p>
                        <strong>Direction:</strong>
                        ${direction}
                    </p>

                    <p>
                        <strong>Trade Probability:</strong>
                        ${number(probability)}%
                    </p>

                    <p>
                        <strong>Implied Volatility:</strong>
                        ${number(impliedVolatility)}%
                    </p>

                </div>


                <div class="plan-section">

                    <h4>
                        💰 RISK & POSITION SIZE
                    </h4>

                    <p>
                        <strong>Account Size:</strong>
                        ${money(accountSize)}
                    </p>

                    <p>
                        <strong>Risk Percentage:</strong>
                        ${number(riskPercent)}%
                    </p>

                    <p>
                        <strong>Maximum Dollar Risk:</strong>
                        ${money(dollarRisk)}
                    </p>

                    <p>
                        <strong>Entry:</strong>
                        ${money(entry)}
                    </p>

                    <p>
                        <strong>Stop:</strong>
                        ${money(stop)}
                    </p>

                    <p>
                        <strong>Risk Per Share:</strong>
                        ${money(riskPerShare)}
                    </p>

                    <p>
                        <strong>Maximum Stock Position:</strong>
                        ${stockPositionSize} shares
                    </p>

                    <p>
                        <strong>Position Value:</strong>
                        ${money(stockPositionValue)}
                    </p>

                </div>


                <div class="plan-section">

                    <h4>
                        🎯 STOCK / ASSET TARGET LADDER
                    </h4>


                    <div class="target-result">

                        <strong>
                            TARGET 1
                        </strong>

                        <div class="result-line">

                            Price:
                            ${money(target1)}

                            |

                            Reward:
                            ${money(reward1)}

                            |

                            R:R:
                            ${number(rr1)}R

                            |

                            Sell:
                            ${ladder1} shares

                        </div>

                    </div>


                    <div class="target-result">

                        <strong>
                            TARGET 2
                        </strong>

                        <div class="result-line">

                            Price:
                            ${money(target2)}

                            |

                            Reward:
                            ${money(reward2)}

                            |

                            R:R:
                            ${number(rr2)}R

                            |

                            Sell:
                            ${ladder2} shares

                        </div>

                    </div>


                    <div class="target-result">

                        <strong>
                            TARGET 3
                        </strong>

                        <div class="result-line">

                            Price:
                            ${money(target3)}

                            |

                            Reward:
                            ${money(reward3)}

                            |

                            R:R:
                            ${number(rr3)}R

                            |

                            Sell:
                            ${ladder3} shares

                        </div>

                    </div>


                    <div class="runner-box">

                        🏃 RUNNER:
                        ${runner} shares

                        <br>

                        Let the remaining position run while protecting profits.

                    </div>

                </div>


                <div class="plan-section">

                    <h4>
                        🎯 OPTION EXECUTION PLAN
                    </h4>

                    <p>
                        <strong>Option Type:</strong>
                        ${optionType}
                    </p>

                    <p>
                        <strong>Strike:</strong>
                        ${money(strike)}
                    </p>

                    <p>
                        <strong>Expiration:</strong>
                        ${
                            expiration ||
                            "Not selected"
                        }
                    </p>

                    <p>
                        <strong>Premium Entry:</strong>
                        ${money(optionEntry)}
                    </p>

                    <p>
                        <strong>Delta:</strong>
                        ${number(optionDelta)}
                    </p>

                    <p>
                        <strong>Cost Per Contract:</strong>
                        ${money(optionContractCost)}
                    </p>

                    <p>
                        <strong>Contracts Based on Risk Budget:</strong>
                        ${optionContracts}
                    </p>

                    <p>
                        <strong>Total Option Position Cost:</strong>
                        ${money(optionPositionCost)}
                    </p>

                </div>


                <div class="plan-section">

                    <h4>
                        🚀 OPTION PROFIT TARGETS
                    </h4>

                    <p>
                        <strong>Option Target 1:</strong>
                        ${money(optionTarget1)}

                        |

                        Estimated Profit:
                        ${money(optionProfit1)}
                    </p>

                    <p>
                        <strong>Option Target 2:</strong>
                        ${money(optionTarget2)}

                        |

                        Estimated Profit:
                        ${money(optionProfit2)}
                    </p>

                    <p>
                        <strong>Option Target 3:</strong>
                        ${money(optionTarget3)}

                        |

                        Estimated Profit:
                        ${money(optionProfit3)}
                    </p>

                </div>


                <div class="plan-section">

                    <h4>
                        🧠 RO'LYFE EXECUTION STATUS
                    </h4>

                    <p>
                        ${statusText}
                    </p>

                    <p>
                        <strong>Stock Stop:</strong>
                        ${money(stop)}
                    </p>

                    <p>
                        <strong>Risk First:</strong>
                        Define the stock stop before entering the trade.
                    </p>

                    <p>
                        <strong>Execution Sequence:</strong>
                        Direction → Entry → Stop → Risk → Position Size → Ladder → Execute.
                    </p>

                </div>


                <div class="trade-plan-actions">

                    <button
                        type="button"
                        onclick="window.print()"
                    >

                        🖨️ PRINT PLAN

                    </button>


                    <button
                        type="button"
                        onclick="TradePlanner.clearOutput()"
                    >

                        ✖ CLOSE PLAN

                    </button>

                </div>


                <p class="plan-date">

                    Generated:
                    ${planDate}

                </p>

            </div>

        `;


        output.scrollIntoView(

            {

                behavior:
                    "smooth",

                block:
                    "start"

            }

        );


        console.log(
            "🟢 RO'LYFE MASTER TRADE PLAN CREATED SUCCESSFULLY"
        );

    }


    /* ============================================
       CLEAR OUTPUT
    ============================================ */

    function clearOutput() {

        const output =
            getElement(
                "tradePlanOutput"
            );


        if (
            output
        ) {

            output.innerHTML =
                "";

        }

    }


    /* ============================================
       EXPOSE PUBLIC API
    ============================================ */

    window.TradePlanner = {

        createPlan:
            createPlan,

        clearOutput:
            clearOutput,

        loadDefaults:
            loadDefaults

    };


    /* ============================================
       INITIALIZE
    ============================================ */

    function initialize() {

        loadDefaults();

        enableDefaultRestore();

        console.log(
            "🟢 RO'LYFE TRADE PLANNER READY"
        );

        console.log(
            window.TradePlanner
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initialize

        );

    }

    else {

        initialize();

    }

})();
