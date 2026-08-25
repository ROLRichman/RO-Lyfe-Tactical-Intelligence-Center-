/* ============================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MASTER TRADE PLANNER ENGINE

   PLAN → SIZE → LADDER → EXECUTE → JOURNAL → REVIEW

   VERSION:
   MASTER TRADE PLANNER + RISK/REWARD + ROI + CHART
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

        return document.getElementById(
            id
        );

    }


    /* ============================================
       GET VALUE
    ============================================ */

    function getValue(
        id,
        defaultValue
    ) {

        const element =
            getElement(
                id
            );


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
       GET NUMBER
    ============================================ */

    function getNumber(
        id,
        defaultValue
    ) {

        const element =
            getElement(
                id
            );


        if (!element) {

            return defaultValue;

        }


        const value =
            parseFloat(
                element.value
            );


        if (
            Number.isNaN(
                value
            )
        ) {

            return defaultValue;

        }


        return value;

    }


    /* ============================================
       SAFE NUMBER
    ============================================ */

    function safeNumber(value) {

        const parsed =
            parseFloat(
                value
            );


        if (
            Number.isNaN(
                parsed
            )
        ) {

            return 0;

        }


        return parsed;

    }


    /* ============================================
       MONEY FORMAT
    ============================================ */

    function money(value) {

        if (
            !Number.isFinite(
                value
            )
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

    function number(
        value,
        decimals = 2
    ) {

        if (
            !Number.isFinite(
                value
            )
        ) {

            return "0";

        }


        return value.toFixed(
            decimals
        );

    }


    /* ============================================
       PERCENT FORMAT
    ============================================ */

    function percent(
        value,
        decimals = 2
    ) {

        if (
            !Number.isFinite(
                value
            )
        ) {

            return "0.00%";

        }


        return (
            value.toFixed(
                decimals
            ) +
            "%"
        );

    }


    /* ============================================
       SET DEFAULT VALUES
    ============================================ */

    function loadDefaults() {

        console.log(
            "Loading RO'LYFE default trade values..."
        );


        Object.keys(
            DEFAULTS
        ).forEach(

            function (id) {

                const element =
                    getElement(
                        id
                    );


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

        Object.keys(
            DEFAULTS
        ).forEach(

            function (id) {

                const element =
                    getElement(
                        id
                    );


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
       CALCULATE ROI

       ROI =
       Profit ÷ Position Cost × 100
    ============================================ */

    function calculateROI(
        profit,
        positionCost
    ) {

        if (
            positionCost <= 0
        ) {

            return 0;

        }


        return (
            profit /
            positionCost
        ) *
        100;

    }


    /* ============================================
       CALCULATE STOCK PROFIT
    ============================================ */

    function calculateStockProfit(

        entry,
        target,
        shares,
        direction

    ) {

        if (
            direction === "Long"
        ) {

            return (
                target -
                entry
            ) *
            shares;

        }


        return (
            entry -
            target
        ) *
        shares;

    }


    /* ============================================
       CALCULATE OPTION PROFIT

       For long Calls/Puts:

       Profit =
       (Target Premium - Entry Premium)
       × 100
       × Contracts

       Negative values are allowed so
       downside remains visible.
    ============================================ */

    function calculateOptionProfit(

        optionEntry,
        optionTarget,
        contracts

    ) {

        return (
            optionTarget -
            optionEntry
        ) *
        100 *
        contracts;

    }


    /* ============================================
       OPTION ROI
    ============================================ */

    function calculateOptionROI(

        optionProfit,
        optionPositionCost

    ) {

        return calculateROI(
            optionProfit,
            optionPositionCost
        );

    }


    /* ============================================
       TAKE PROFIT SUGGESTION ENGINE
    ============================================ */

    function getTakeProfitSuggestion(

        rr1,
        rr2,
        rr3,
        probability,
        impliedVolatility

    ) {

        let suggestion =
            "Use the ladder and manage the runner.";

        let detail =
            "Consider taking partial profits while allowing a smaller remaining position to continue if the trend stays intact.";


        if (
            rr1 < 1
        ) {

            suggestion =
                "Target 1 is tight.";

            detail =
                "Consider using Target 1 primarily as a partial-risk reduction point rather than treating it as the main reward objective.";

        }


        if (
            rr2 >= 2 &&
            probability >= 70
        ) {

            suggestion =
                "Strong partial-profit profile.";

            detail =
                "Consider taking partial profits at Target 1, locking additional gains at Target 2, and letting a smaller position work toward Target 3.";

        }


        if (
            rr3 >= 3 &&
            probability >= 70
        ) {

            suggestion =
                "Excellent asymmetric reward potential.";

            detail =
                "The trade offers a larger reward window. Protect profits as the position moves in your favor instead of automatically closing the entire position too early.";

        }


        if (
            impliedVolatility >= 60
        ) {

            detail +=
                " Elevated implied volatility may justify faster profit-taking because option premium can change rapidly.";

        }


        if (
            probability < 55
        ) {

            suggestion =
                "Conservative profit-taking suggested.";

            detail =
                "Because the probability score is below the preferred range, avoid relying heavily on a runner unless price action confirms the move.";

        }


        return {

            suggestion:
                suggestion,

            detail:
                detail

        };

    }


    /* ============================================
       RISK / REWARD STATUS
    ============================================ */

    function getRiskRewardStatus(
        rr
    ) {

        if (
            rr >= 3
        ) {

            return
                "🟢 STRONG REWARD PROFILE";

        }


        if (
            rr >= 2
        ) {

            return
                "🟢 FAVORABLE RISK/REWARD";

        }


        if (
            rr >= 1
        ) {

            return
                "🟡 ACCEPTABLE — REVIEW";

        }


        return
            "🔴 WEAK RISK/REWARD";

    }


    /* ============================================
       BUILD RISK / REWARD CHART

       Visual map:

       STOP → ENTRY → T1 → T2 → T3

       Long:
       STOP is left of ENTRY

       Short:
       STOP is right of ENTRY
    ============================================ */

    function buildRiskRewardChart(

        entry,
        stop,
        target1,
        target2,
        target3,
        direction

    ) {

        const values = [

            entry,
            stop,
            target1,
            target2,
            target3

        ];


        const minValue =
            Math.min(
                ...values
            );


        const maxValue =
            Math.max(
                ...values
            );


        const range =
            maxValue -
            minValue;


        const safeRange =
            range === 0
                ? 1
                : range;


        function getPosition(
            value
        ) {

            return (
                (
                    (
                        value -
                        minValue
                    ) /
                    safeRange
                ) *
                100
            );

        }


        const entryPosition =
            getPosition(
                entry
            );


        const stopPosition =
            getPosition(
                stop
            );


        const target1Position =
            getPosition(
                target1
            );


        const target2Position =
            getPosition(
                target2
            );


        const target3Position =
            getPosition(
                target3
            );


        const riskWidth =
            Math.abs(
                entryPosition -
                stopPosition
            );


        const rewardWidth =
            Math.abs(
                target3Position -
                entryPosition
            );


        const riskLeft =
            Math.min(
                entryPosition,
                stopPosition
            );


        const rewardLeft =
            Math.min(
                entryPosition,
                target3Position
            );


        const directionText =
            direction === "Long"
                ? "LONG TRADE MAP"
                : "SHORT TRADE MAP";


        return `

            <div class="rr-chart">

                <div class="rr-chart-header">

                    📊 ${directionText}

                </div>


                <div class="rr-chart-track">

                    <div
                        class="rr-risk-zone"
                        style="
                            left:
                            ${riskLeft}%;

                            width:
                            ${riskWidth}%;
                        "
                    ></div>


                    <div
                        class="rr-reward-zone"
                        style="
                            left:
                            ${rewardLeft}%;

                            width:
                            ${rewardWidth}%;
                        "
                    ></div>


                    <div
                        class="rr-marker rr-stop"
                        style="
                            left:
                            ${stopPosition}%;
                        "
                    >

                        <span>
                            STOP
                        </span>

                        <strong>
                            ${money(stop)}
                        </strong>

                    </div>


                    <div
                        class="rr-marker rr-entry"
                        style="
                            left:
                            ${entryPosition}%;
                        "
                    >

                        <span>
                            ENTRY
                        </span>

                        <strong>
                            ${money(entry)}
                        </strong>

                    </div>


                    <div
                        class="rr-marker rr-target rr-target-1"
                        style="
                            left:
                            ${target1Position}%;
                        "
                    >

                        <span>
                            T1
                        </span>

                        <strong>
                            ${money(target1)}
                        </strong>

                    </div>


                    <div
                        class="rr-marker rr-target rr-target-2"
                        style="
                            left:
                            ${target2Position}%;
                        "
                    >

                        <span>
                            T2
                        </span>

                        <strong>
                            ${money(target2)}
                        </strong>

                    </div>


                    <div
                        class="rr-marker rr-target rr-target-3"
                        style="
                            left:
                            ${target3Position}%;
                        "
                    >

                        <span>
                            T3
                        </span>

                        <strong>
                            ${money(target3)}
                        </strong>

                    </div>

                </div>


                <div class="rr-chart-legend">

                    <span>
                        🔴 Risk Zone
                    </span>

                    <span>
                        🟢 Reward Zone
                    </span>

                </div>

            </div>

        `;

    }


    /* ============================================
       CREATE MASTER TRADE PLAN
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
            accountSize <= 0
        ) {

            alert(
                "Account size must be greater than zero."
            );

            return;

        }


        if (
            riskPercent <= 0
        ) {

            alert(
                "Risk percentage must be greater than zero."
            );

            return;

        }


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
           DIRECTION VALIDATION
        ======================================== */

        if (
            direction === "Long" &&
            stop >= entry
        ) {

            alert(
                "For a Long trade, the Stop should be below the Entry."
            );

            return;

        }


        if (
            direction === "Short" &&
            stop <= entry
        ) {

            alert(
                "For a Short trade, the Stop should be above the Entry."
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
                safeNumber(
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
                safeNumber(
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
                safeNumber(
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
           TARGET DIRECTION VALIDATION
        ======================================== */

        if (
            direction === "Long"
        ) {

            if (
                target1 <= entry ||
                target2 <= entry ||
                target3 <= entry
            ) {

                alert(
                    "For a Long trade, targets should be above Entry."
                );

                return;

            }

        }


        if (
            direction === "Short"
        ) {

            if (
                target1 >= entry ||
                target2 >= entry ||
                target3 >= entry
            ) {

                alert(
                    "For a Short trade, targets should be below Entry."
                );

                return;

            }

        }


        /* ========================================
           REWARD CALCULATIONS
        ======================================== */

        const reward1 =
            Math.abs(
                target1 -
                entry
            );


        const reward2 =
            Math.abs(
                target2 -
                entry
            );


        const reward3 =
            Math.abs(
                target3 -
                entry
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
           STOCK PROFIT AT FULL POSITION
        ======================================== */

        const fullStockProfit1 =
            calculateStockProfit(

                entry,
                target1,
                stockPositionSize,
                direction

            );


        const fullStockProfit2 =
            calculateStockProfit(

                entry,
                target2,
                stockPositionSize,
                direction

            );


        const fullStockProfit3 =
            calculateStockProfit(

                entry,
                target3,
                stockPositionSize,
                direction

            );


        /* ========================================
           STOCK ROI

           Based on position value
        ======================================== */

        const stockROI1 =
            calculateROI(

                fullStockProfit1,
                stockPositionValue

            );


        const stockROI2 =
            calculateROI(

                fullStockProfit2,
                stockPositionValue

            );


        const stockROI3 =
            calculateROI(

                fullStockProfit3,
                stockPositionValue

            );


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
           LADDER PROFITS

           Profit from each partial sale
        ======================================== */

        const ladderProfit1 =
            calculateStockProfit(

                entry,
                target1,
                ladder1,
                direction

            );


        const ladderProfit2 =
            calculateStockProfit(

                entry,
                target2,
                ladder2,
                direction

            );


        const ladderProfit3 =
            calculateStockProfit(

                entry,
                target3,
                ladder3,
                direction

            );


        const lockedProfitAtT3 =
            ladderProfit1 +
            ladderProfit2 +
            ladderProfit3;


        const lockedROIAtT3 =
            calculateROI(

                lockedProfitAtT3,
                stockPositionValue

            );


        /* ========================================
           OPTION POSITION SIZING

           Long Option Premium × 100
           = Cost Per Contract

           Maximum loss for a long option,
           if held to zero, can be the
           premium paid.

           Therefore:

           Contracts =
           Risk Budget ÷ Cost Per Contract
        ======================================== */

        const optionContractCost =
            optionEntry *
            100;


        const optionContracts =
            optionContractCost > 0

                ? Math.floor(
                    dollarRisk /
                    optionContractCost
                )

                : 0;


        const optionPositionCost =
            optionContracts *
            optionContractCost;


        /* ========================================
           OPTION TARGET PROFITS
        ======================================== */

        const optionProfit1 =
            calculateOptionProfit(

                optionEntry,
                optionTarget1,
                optionContracts

            );


        const optionProfit2 =
            calculateOptionProfit(

                optionEntry,
                optionTarget2,
                optionContracts

            );


        const optionProfit3 =
            calculateOptionProfit(

                optionEntry,
                optionTarget3,
                optionContracts

            );


        /* ========================================
           OPTION ROI
        ======================================== */

        const optionROI1 =
            calculateOptionROI(

                optionProfit1,
                optionPositionCost

            );


        const optionROI2 =
            calculateOptionROI(

                optionProfit2,
                optionPositionCost

            );


        const optionROI3 =
            calculateOptionROI(

                optionProfit3,
                optionPositionCost

            );


        /* ========================================
           OPTION LADDER

           Same 40 / 30 / 20 / 10 concept
        ======================================== */

        const optionLadder1 =
            Math.floor(
                optionContracts *
                0.40
            );


        const optionLadder2 =
            Math.floor(
                optionContracts *
                0.30
            );


        const optionLadder3 =
            Math.floor(
                optionContracts *
                0.20
            );


        const optionRunner =
            optionContracts -
            optionLadder1 -
            optionLadder2 -
            optionLadder3;


        /* ========================================
           TAKE PROFIT ENGINE
        ======================================== */

        const takeProfitPlan =
            getTakeProfitSuggestion(

                rr1,
                rr2,
                rr3,
                probability,
                impliedVolatility

            );


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
            probability >= 55 &&
            rr1 >= 1
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
                "Probability or risk/reward profile is below preferred execution criteria.";

        }


        /* ========================================
           BEST RISK / REWARD STATUS
        ======================================== */

        const riskRewardStatus =
            getRiskRewardStatus(
                rr3
            );


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


                <!-- =================================
                     TRADE IDENTITY
                ================================== -->

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
                        ${percent(probability)}
                    </p>

                    <p>
                        <strong>Implied Volatility:</strong>
                        ${percent(impliedVolatility)}
                    </p>

                </div>


                <!-- =================================
                     RISK & POSITION SIZE
                ================================== -->

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
                        ${percent(riskPercent)}
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


                <!-- =================================
                     RISK VS REWARD
                ================================== -->

                <div class="plan-section">

                    <h4>
                        ⚖️ RISK VS. REWARD
                    </h4>

                    <p>
                        <strong>Maximum Risk:</strong>
                        ${money(dollarRisk)}
                    </p>

                    <p>
                        <strong>Target 1 Reward:</strong>
                        ${money(fullStockProfit1)}
                    </p>

                    <p>
                        <strong>Target 1 Risk/Reward:</strong>
                        1 : ${number(rr1)}
                    </p>

                    <p>
                        <strong>Target 2 Reward:</strong>
                        ${money(fullStockProfit2)}
                    </p>

                    <p>
                        <strong>Target 2 Risk/Reward:</strong>
                        1 : ${number(rr2)}
                    </p>

                    <p>
                        <strong>Target 3 Reward:</strong>
                        ${money(fullStockProfit3)}
                    </p>

                    <p>
                        <strong>Target 3 Risk/Reward:</strong>
                        1 : ${number(rr3)}
                    </p>

                    <p>
                        <strong>Profile:</strong>
                        ${riskRewardStatus}
                    </p>

                </div>


                <!-- =================================
                     RISK / REWARD CHART
                ================================== -->

                <div class="plan-section">

                    <h4>
                        📊 TRADE MAP
                    </h4>

                    ${buildRiskRewardChart(

                        entry,
                        stop,
                        target1,
                        target2,
                        target3,
                        direction

                    )}

                </div>


                <!-- =================================
                     STOCK TARGET LADDER
                ================================== -->

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

                            R:R:
                            1:${number(rr1)}

                            |

                            Full Position Profit:
                            ${money(fullStockProfit1)}

                            |

                            ROI:
                            ${percent(stockROI1)}

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

                            R:R:
                            1:${number(rr2)}

                            |

                            Full Position Profit:
                            ${money(fullStockProfit2)}

                            |

                            ROI:
                            ${percent(stockROI2)}

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

                            R:R:
                            1:${number(rr3)}

                            |

                            Full Position Profit:
                            ${money(fullStockProfit3)}

                            |

                            ROI:
                            ${percent(stockROI3)}

                            |

                            Sell:
                            ${ladder3} shares

                        </div>

                    </div>


                    <div class="runner-box">

                        🏃 RUNNER:
                        ${runner} shares

                        <br><br>

                        <strong>
                            Locked Profit Through Target 3:
                        </strong>

                        ${money(lockedProfitAtT3)}

                        <br>

                        <strong>
                            Locked ROI:
                        </strong>

                        ${percent(lockedROIAtT3)}

                        <br><br>

                        Let the remaining position run while protecting profits.

                    </div>

                </div>


                <!-- =================================
                     TAKE PROFIT SUGGESTION
                ================================== -->

                <div class="plan-section">

                    <h4>
                        💰 RO'LYFE TAKE-PROFIT PLAN
                    </h4>

                    <p>
                        <strong>
                            Suggested Approach:
                        </strong>

                        ${takeProfitPlan.suggestion}
                    </p>

                    <p>
                        ${takeProfitPlan.detail}
                    </p>

                    <p>
                        <strong>
                            Ladder Structure:
                        </strong>

                        40% → Target 1

                        |
                        30% → Target 2

                        |
                        20% → Target 3

                        |
                        10% → Runner
                    </p>

                    <p>
                        <strong>
                            Protection Rule:
                        </strong>

                        As the trade moves in your favor, consider protecting gains according to your trade plan rather than allowing a profitable trade to completely reverse.

                    </p>

                </div>


                <!-- =================================
                     OPTION EXECUTION
                ================================== -->

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


                <!-- =================================
                     OPTION PROFIT TARGETS + ROI
                ================================== -->

                <div class="plan-section">

                    <h4>
                        🚀 OPTION PROFIT TARGETS & ROI
                    </h4>

                    <p>
                        <strong>
                            Option Target 1:
                        </strong>

                        ${money(optionTarget1)}

                        |

                        Estimated Profit:
                        ${money(optionProfit1)}

                        |

                        ROI:
                        ${percent(optionROI1)}
                    </p>

                    <p>
                        <strong>
                            Option Target 2:
                        </strong>

                        ${money(optionTarget2)}

                        |

                        Estimated Profit:
                        ${money(optionProfit2)}

                        |

                        ROI:
                        ${percent(optionROI2)}
                    </p>

                    <p>
                        <strong>
                            Option Target 3:
                        </strong>

                        ${money(optionTarget3)}

                        |

                        Estimated Profit:
                        ${money(optionProfit3)}

                        |

                        ROI:
                        ${percent(optionROI3)}
                    </p>

                    <p>
                        <strong>
                            Option Ladder:
                        </strong>

                        T1:
                        ${optionLadder1} contracts

                        |

                        T2:
                        ${optionLadder2} contracts

                        |

                        T3:
                        ${optionLadder3} contracts

                        |

                        Runner:
                        ${optionRunner} contracts
                    </p>

                </div>


                <!-- =================================
                     EXECUTION STATUS
                ================================== -->

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
                        <strong>Risk/Reward:</strong>
                        Know what you can lose before deciding what you want to make.
                    </p>

                    <p>
                        <strong>Execution Sequence:</strong>
                        Direction
                        →
                        Entry
                        →
                        Stop
                        →
                        Risk
                        →
                        Position Size
                        →
                        Risk/Reward
                        →
                        Ladder
                        →
                        Execute.
                    </p>

                    <p>
                        <strong>
                            RO'LYFE Rule:
                        </strong>

                        The calculator fits the pocket;
                        the risk rules protect the pocket.

                    </p>

                </div>


                <!-- =================================
                     ACTIONS
                ================================== -->

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


        console.log({

            symbol:
                symbol,

            direction:
                direction,

            accountSize:
                accountSize,

            dollarRisk:
                dollarRisk,

            positionSize:
                stockPositionSize,

            rr1:
                rr1,

            rr2:
                rr2,

            rr3:
                rr3,

            stockROI1:
                stockROI1,

            stockROI2:
                stockROI2,

            stockROI3:
                stockROI3,

            optionROI1:
                optionROI1,

            optionROI2:
                optionROI2,

            optionROI3:
                optionROI3

        });

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


        console.log(
            "Trade plan closed."
        );

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


    /* ============================================
       WAIT FOR PAGE
    ============================================ */

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
