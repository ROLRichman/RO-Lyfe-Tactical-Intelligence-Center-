/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE PLANNER ENGINE v2
   STOCK MAP + OPTION EXECUTION
========================================================= */

const TradePlanner = {

    createPlan() {

        /* =====================================
           BASIC INFORMATION
        ===================================== */

        const symbol =
            document.getElementById("symbol")
                ?.value
                ?.toUpperCase()
                .trim() || "";

        const instrument =
            document.getElementById("instrument")
                ?.value || "Stock";

        const direction =
            document.getElementById("direction")
                ?.value || "Long";


        /* =====================================
           OPTIONAL MARKET DATA
        ===================================== */

        const probability =
            parseFloat(
                document.getElementById(
                    "probability"
                )?.value
            ) || null;


        const impliedVolatility =
            parseFloat(
                document.getElementById(
                    "impliedVolatility"
                )?.value
            ) || null;


        /* =====================================
           STOCK MAP
        ===================================== */

        const entry =
            parseFloat(
                document.getElementById("entry")?.value
            );

        const stop =
            parseFloat(
                document.getElementById("stop")?.value
            );

        const stockTarget1 =
            parseFloat(
                document.getElementById(
                    "stockTarget1"
                )?.value
            );

        const stockTarget2 =
            parseFloat(
                document.getElementById(
                    "stockTarget2"
                )?.value
            );

        const stockTarget3 =
            parseFloat(
                document.getElementById(
                    "stockTarget3"
                )?.value
            );


        /* =====================================
           ACCOUNT RISK
        ===================================== */

        const accountSize =
            parseFloat(
                document.getElementById(
                    "accountSize"
                )?.value
            ) || 0;


        const riskPercent =
            parseFloat(
                document.getElementById(
                    "riskPercent"
                )?.value
            ) || 0;


        /* =====================================
           OPTION EXECUTION
        ===================================== */

        const optionType =
            document.getElementById(
                "optionType"
            )?.value || "CALL";


        const strike =
            document.getElementById(
                "strike"
            )?.value || "N/A";


        const expiration =
            document.getElementById(
                "expiration"
            )?.value || "N/A";


        const optionEntry =
            parseFloat(
                document.getElementById(
                    "optionEntry"
                )?.value
            );


        const optionTarget1 =
            parseFloat(
                document.getElementById(
                    "optionTarget1"
                )?.value
            );


        const optionTarget2 =
            parseFloat(
                document.getElementById(
                    "optionTarget2"
                )?.value
            );


        const optionTarget3 =
            parseFloat(
                document.getElementById(
                    "optionTarget3"
                )?.value
            );


        /* =====================================
           VALIDATION
        ===================================== */

        if (!symbol) {

            alert(
                "Please enter a Symbol."
            );

            return;

        }


        if (
            isNaN(entry) ||
            isNaN(stop)
        ) {

            alert(
                "Please enter Stock Entry and Stock Stop."
            );

            return;

        }


        /* =====================================
           STOCK RISK
        ===================================== */

        const riskPerUnit =
            Math.abs(
                entry - stop
            );


        const riskAmount =
            accountSize *
            (
                riskPercent / 100
            );


        /* =====================================
           STOCK RESULT / ROI
        ===================================== */

        const stockROI1 =
            !isNaN(stockTarget1)
                ? (
                    (
                        stockTarget1 - entry
                    ) /
                    entry
                ) * 100
                : null;


        const stockROI2 =
            !isNaN(stockTarget2)
                ? (
                    (
                        stockTarget2 - entry
                    ) /
                    entry
                ) * 100
                : null;


        const stockROI3 =
            !isNaN(stockTarget3)
                ? (
                    (
                        stockTarget3 - entry
                    ) /
                    entry
                ) * 100
                : null;


        /* =====================================
           STOCK RISK / REWARD
        ===================================== */

        const stockRR1 =
            !isNaN(stockTarget1) &&
            riskPerUnit > 0
                ? Math.abs(
                    stockTarget1 - entry
                ) / riskPerUnit
                : null;


        const stockRR2 =
            !isNaN(stockTarget2) &&
            riskPerUnit > 0
                ? Math.abs(
                    stockTarget2 - entry
                ) / riskPerUnit
                : null;


        const stockRR3 =
            !isNaN(stockTarget3) &&
            riskPerUnit > 0
                ? Math.abs(
                    stockTarget3 - entry
                ) / riskPerUnit
                : null;


        /* =====================================
           OPTION ROI
        ===================================== */

        const optionROI1 =
            !isNaN(optionEntry) &&
            optionEntry > 0 &&
            !isNaN(optionTarget1)
                ? (
                    (
                        optionTarget1 -
                        optionEntry
                    ) /
                    optionEntry
                ) * 100
                : null;


        const optionROI2 =
            !isNaN(optionEntry) &&
            optionEntry > 0 &&
            !isNaN(optionTarget2)
                ? (
                    (
                        optionTarget2 -
                        optionEntry
                    ) /
                    optionEntry
                ) * 100
                : null;


        const optionROI3 =
            !isNaN(optionEntry) &&
            optionEntry > 0 &&
            !isNaN(optionTarget3)
                ? (
                    (
                        optionTarget3 -
                        optionEntry
                    ) /
                    optionEntry
                ) * 100
                : null;


        /* =====================================
           OPTION CONTRACT RESULTS

           Each standard option contract
           controls 100 shares.
        ===================================== */

        const optionProfit1 =
            !isNaN(optionEntry) &&
            !isNaN(optionTarget1)
                ? (
                    optionTarget1 -
                    optionEntry
                ) * 100
                : null;


        const optionProfit2 =
            !isNaN(optionEntry) &&
            !isNaN(optionTarget2)
                ? (
                    optionTarget2 -
                    optionEntry
                ) * 100
                : null;


        const optionProfit3 =
            !isNaN(optionEntry) &&
            !isNaN(optionTarget3)
                ? (
                    optionTarget3 -
                    optionEntry
                ) * 100
                : null;


        /* =====================================
           LADDER WEIGHTED RESULT

           T1 = 40%
           T2 = 30%
           T3 = 20%
           Runner = 10%
        ===================================== */

        let weightedOptionProfit =
            0;


        if (
            optionProfit1 !== null
        ) {

            weightedOptionProfit +=
                optionProfit1 * 0.40;

        }


        if (
            optionProfit2 !== null
        ) {

            weightedOptionProfit +=
                optionProfit2 * 0.30;

        }


        if (
            optionProfit3 !== null
        ) {

            weightedOptionProfit +=
                optionProfit3 * 0.20;

        }


        /* =====================================
           BUILD PLAN
        ===================================== */

        const plan = {

            id: Date.now(),

            date:
                new Date()
                    .toLocaleString(),


            /* BASIC */

            symbol:
                symbol,

            instrument:
                instrument,

            direction:
                direction,


            /* MARKET DATA */

            probability:
                probability,

            impliedVolatility:
                impliedVolatility,


            /* STOCK MAP */

            entry:
                entry,

            stop:
                stop,

            stockTarget1:
                isNaN(stockTarget1)
                    ? null
                    : stockTarget1,

            stockTarget2:
                isNaN(stockTarget2)
                    ? null
                    : stockTarget2,

            stockTarget3:
                isNaN(stockTarget3)
                    ? null
                    : stockTarget3,


            /* STOCK RISK */

            riskPerUnit:
                riskPerUnit,

            accountSize:
                accountSize,

            riskPercent:
                riskPercent,

            riskAmount:
                riskAmount,


            /* STOCK RESULTS */

            stockROI1:
                stockROI1,

            stockROI2:
                stockROI2,

            stockROI3:
                stockROI3,

            stockRR1:
                stockRR1,

            stockRR2:
                stockRR2,

            stockRR3:
                stockRR3,


            /* OPTION */

            optionType:
                optionType,

            strike:
                strike,

            expiration:
                expiration,

            optionEntry:
                isNaN(optionEntry)
                    ? null
                    : optionEntry,

            optionTarget1:
                isNaN(optionTarget1)
                    ? null
                    : optionTarget1,

            optionTarget2:
                isNaN(optionTarget2)
                    ? null
                    : optionTarget2,

            optionTarget3:
                isNaN(optionTarget3)
                    ? null
                    : optionTarget3,


            /* OPTION RESULTS */

            optionROI1:
                optionROI1,

            optionROI2:
                optionROI2,

            optionROI3:
                optionROI3,

            optionProfit1:
                optionProfit1,

            optionProfit2:
                optionProfit2,

            optionProfit3:
                optionProfit3,

            weightedOptionProfit:
                weightedOptionProfit,


            /* STATUS */

            status:
                "PLANNED"

        };


        window.currentTradePlan =
            plan;


        this.displayPlan(plan);


        return plan;

    },


    /* =====================================
       DISPLAY PLAN
    ===================================== */

    displayPlan(plan) {

        const output =
            document.getElementById(
                "tradePlanOutput"
            );


        if (!output) return;


        const money = value =>

            value === null ||
            value === undefined

                ? "Not Set"

                : "$" +
                  Number(value)
                    .toFixed(2);


        const percent = value =>

            value === null ||
            value === undefined

                ? "Not Set"

                : Number(value)
                    .toFixed(2) + "%";


        const ratio = value =>

            value === null ||
            value === undefined

                ? "Not Set"

                : "1:" +
                  Number(value)
                    .toFixed(2);


        output.innerHTML = `

        <div class="trade-plan-card">

            <h3>
                🎯 RO'LYFE TRADE PLAN
            </h3>


            <div class="plan-status">

                ${plan.status}

            </div>


            <p>
                <strong>Symbol:</strong>
                ${plan.symbol}
            </p>


            <p>
                <strong>Instrument:</strong>
                ${plan.instrument}
            </p>


            <p>
                <strong>Direction:</strong>
                ${plan.direction}
            </p>


            <hr>


            <h3>
                🗺️ STOCK MAP
            </h3>


            <p>
                <strong>Probability:</strong>
                ${percent(plan.probability)}
            </p>


            <p>
                <strong>Implied Volatility:</strong>
                ${percent(plan.impliedVolatility)}
            </p>


            <p>
                <strong>Stock Entry:</strong>
                ${money(plan.entry)}
            </p>


            <p>
                <strong>Stock Stop:</strong>
                ${money(plan.stop)}
            </p>


            <p>
                <strong>Risk Per Share:</strong>
                ${money(plan.riskPerUnit)}
            </p>


            <p>
                <strong>Risk Budget:</strong>
                ${money(plan.riskAmount)}
            </p>


            <hr>


            <h4>
                🎯 Stock Target 1
            </h4>

            <p>
                Price:
                ${money(plan.stockTarget1)}
            </p>

            <p>
                Result / ROI:
                ${percent(plan.stockROI1)}
            </p>

            <p>
                Risk / Reward:
                ${ratio(plan.stockRR1)}
            </p>


            <hr>


            <h4>
                🎯 Stock Target 2
            </h4>

            <p>
                Price:
                ${money(plan.stockTarget2)}
            </p>

            <p>
                Result / ROI:
                ${percent(plan.stockROI2)}
            </p>

            <p>
                Risk / Reward:
                ${ratio(plan.stockRR2)}
            </p>


            <hr>


            <h4>
                🚀 Stock Target 3
            </h4>

            <p>
                Price:
                ${money(plan.stockTarget3)}
            </p>

            <p>
                Result / ROI:
                ${percent(plan.stockROI3)}
            </p>

            <p>
                Risk / Reward:
                ${ratio(plan.stockRR3)}
            </p>


            <hr>


            <h3>
                🎯 OPTION EXECUTION
            </h3>


            <p>
                <strong>Contract:</strong>
                ${plan.optionType}
            </p>


            <p>
                <strong>Strike:</strong>
                ${plan.strike}
            </p>


            <p>
                <strong>Expiration:</strong>
                ${plan.expiration}
            </p>


            <p>
                <strong>Premium Entry:</strong>
                ${money(plan.optionEntry)}
            </p>


            <hr>


            <h4>
                🟢 TAKE PROFIT 1
            </h4>

            <p>
                Premium:
                ${money(plan.optionTarget1)}
            </p>

            <p>
                Sell:
                40%
            </p>

            <p>
                Option ROI:
                ${percent(plan.optionROI1)}
            </p>

            <p>
                Contract Result:
                ${money(plan.optionProfit1)}
            </p>


            <hr>


            <h4>
                🟢 TAKE PROFIT 2
            </h4>

            <p>
                Premium:
                ${money(plan.optionTarget2)}
            </p>

            <p>
                Sell:
                30%
            </p>

            <p>
                Option ROI:
                ${percent(plan.optionROI2)}
            </p>

            <p>
                Contract Result:
                ${money(plan.optionProfit2)}
            </p>


            <hr>


            <h4>
                🚀 TAKE PROFIT 3
            </h4>

            <p>
                Premium:
                ${money(plan.optionTarget3)}
            </p>

            <p>
                Sell:
                20%
            </p>

            <p>
                Option ROI:
                ${percent(plan.optionROI3)}
            </p>

            <p>
                Contract Result:
                ${money(plan.optionProfit3)}
            </p>


            <hr>


            <h4>
                🏃 RUNNER
            </h4>

            <p>
                Keep:
                10%
            </p>

            <p>
                Trail with structure.
            </p>


            <hr>


            <h3>
                📊 LADDER RESULT
            </h3>

            <p>
                <strong>
                    Weighted Realized Profit:
                </strong>

                ${money(plan.weightedOptionProfit)}

            </p>


            <p class="plan-date">

                Created:
                ${plan.date}

            </p>


            <button
                onclick="TradePlanner.savePlan()"
            >

                💾 SAVE TRADE PLAN

            </button>

        </div>

        `;

    },


    /* =====================================
       SAVE PLAN
    ===================================== */

    savePlan() {

        if (!window.currentTradePlan) {

            alert(
                "Create a trade plan first."
            );

            return;

        }


        let plans =
            JSON.parse(

                localStorage.getItem(
                    "roLyfeTradePlans"
                ) || "[]"

            );


        plans.push(
            window.currentTradePlan
        );


        localStorage.setItem(

            "roLyfeTradePlans",

            JSON.stringify(plans)

        );


        alert(

            `${window.currentTradePlan.symbol} trade plan saved!`

        );

    },


    /* =====================================
       LOAD PLANS
    ===================================== */

    loadPlans() {

        return JSON.parse(

            localStorage.getItem(
                "roLyfeTradePlans"
            ) || "[]"

        );

    },


    /* =====================================
       DELETE PLAN
    ===================================== */

    deletePlan(id) {

        let plans =
            this.loadPlans();


        plans =
            plans.filter(

                plan =>
                    plan.id !== id

            );


        localStorage.setItem(

            "roLyfeTradePlans",

            JSON.stringify(plans)

        );

    }

};
