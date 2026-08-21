/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE PLANNER ENGINE

   STOCK MAP + OPTION EXECUTION
========================================================= */

const TradePlanner = {

    createPlan() {

        const getNumber = (id) => {

            const element =
                document.getElementById(id);

            if (!element) return null;

            const value =
                parseFloat(element.value);

            return isNaN(value)
                ? null
                : value;

        };


        const symbol =
            document
                .getElementById("symbol")
                ?.value
                ?.toUpperCase()
                .trim() || "";


        const instrument =
            document
                .getElementById("instrument")
                ?.value || "Option";


        const direction =
            document
                .getElementById("direction")
                ?.value || "Long";


        const optionType =
            document
                .getElementById("optionType")
                ?.value || "Call";


        const expiration =
            document
                .getElementById("expiration")
                ?.value || "";


        /* ================================
           ACCOUNT / RISK
        ================================= */

        const accountSize =
            getNumber("accountSize") || 0;


        const riskPercent =
            getNumber("riskPercent") || 0;


        const riskAmount =
            accountSize *
            (riskPercent / 100);


        /* ================================
           PROBABILITY
        ================================= */

        const probability =
            getNumber("probability");


        const impliedVolatility =
            getNumber("impliedVolatility");


        /* ================================
           STOCK MAP
        ================================= */

        const entry =
            getNumber("entry");


        const stop =
            getNumber("stop");


        const target1 =
            getNumber("target1");


        const target2 =
            getNumber("target2");


        const target3 =
            getNumber("target3");


        /* ================================
           OPTION EXECUTION
        ================================= */

        const strike =
            getNumber("strike");


        const optionEntry =
            getNumber("optionEntry");


        const optionTarget1 =
            getNumber("optionTarget1");


        const optionTarget2 =
            getNumber("optionTarget2");


        const optionTarget3 =
            getNumber("optionTarget3");


        /* ================================
           VALIDATION
        ================================= */

        if (!symbol) {

            alert(
                "Please enter a Symbol."
            );

            return;

        }


        if (entry === null) {

            alert(
                "Please enter a Stock Entry."
            );

            return;

        }


        /* ================================
           STOCK RISK
        ================================= */

        let riskPerUnit = 0;


        if (
            stop !== null
        ) {

            riskPerUnit =
                Math.abs(
                    entry - stop
                );

        }


        /* ================================
           STOCK RESULTS
        ================================= */

        const stockROI1 =
            target1 !== null
                ? (
                    (target1 - entry) /
                    entry
                ) * 100
                : null;


        const stockROI2 =
            target2 !== null
                ? (
                    (target2 - entry) /
                    entry
                ) * 100
                : null;


        const stockROI3 =
            target3 !== null
                ? (
                    (target3 - entry) /
                    entry
                ) * 100
                : null;


        /* ================================
           OPTION RESULTS
        ================================= */

        const optionROI1 =
            optionEntry &&
            optionTarget1 !== null
                ? (
                    (optionTarget1 -
                    optionEntry) /
                    optionEntry
                ) * 100
                : null;


        const optionROI2 =
            optionEntry &&
            optionTarget2 !== null
                ? (
                    (optionTarget2 -
                    optionEntry) /
                    optionEntry
                ) * 100
                : null;


        const optionROI3 =
            optionEntry &&
            optionTarget3 !== null
                ? (
                    (optionTarget3 -
                    optionEntry) /
                    optionEntry
                ) * 100
                : null;


        /* ================================
           POSITION SIZE

           Options are usually quoted
           per share. One standard
           contract represents 100 shares.
        ================================= */

        let maxContracts = 0;


        if (
            optionEntry &&
            riskAmount > 0
        ) {

            maxContracts =
                Math.floor(
                    riskAmount /
                    (optionEntry * 100)
                );

        }


        /* ================================
           BUILD PLAN
        ================================= */

        const plan = {

            id:
                Date.now(),

            date:
                new Date()
                    .toLocaleString(),


            status:
                "PLANNED",


            symbol:
                symbol,


            instrument:
                instrument,


            direction:
                direction,


            /* PROBABILITY */

            probability:
                probability,


            impliedVolatility:
                impliedVolatility,


            /* STOCK MAP */

            entry:
                entry,


            stop:
                stop,


            riskPerUnit:
                riskPerUnit,


            target1:
                target1,


            target2:
                target2,


            target3:
                target3,


            stockROI1:
                stockROI1,


            stockROI2:
                stockROI2,


            stockROI3:
                stockROI3,


            /* ACCOUNT */

            accountSize:
                accountSize,


            riskPercent:
                riskPercent,


            riskAmount:
                riskAmount,


            /* OPTION */

            optionType:
                optionType,


            strike:
                strike,


            expiration:
                expiration,


            optionEntry:
                optionEntry,


            optionTarget1:
                optionTarget1,


            optionTarget2:
                optionTarget2,


            optionTarget3:
                optionTarget3,


            optionROI1:
                optionROI1,


            optionROI2:
                optionROI2,


            optionROI3:
                optionROI3,


            maxContracts:
                maxContracts,


            /* LADDER */

            sellTarget1:
                40,


            sellTarget2:
                30,


            sellTarget3:
                20,


            runner:
                10

        };


        window.currentTradePlan =
            plan;


        this.displayPlan(plan);


        return plan;

    },



    /* =====================================
       DISPLAY PLAN
    ====================================== */

    displayPlan(plan) {

        const output =
            document.getElementById(
                "tradePlanOutput"
            );


        if (!output) return;


        const money = (value) => {

            return value !== null &&
                value !== undefined

                ? "$" +
                    Number(value)
                        .toFixed(2)

                : "Not Set";

        };


        const percent = (value) => {

            return value !== null &&
                value !== undefined

                ? Number(value)
                    .toFixed(2) + "%"

                : "N/A";

        };


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
                <strong>Direction:</strong>
                ${plan.direction}
            </p>


            <p>
                <strong>Probability:</strong>
                ${percent(plan.probability)}
            </p>


            <p>
                <strong>Implied Volatility:</strong>
                ${percent(plan.impliedVolatility)}
            </p>


            <hr>


            <h3>
                📈 STOCK MAP
            </h3>


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
                <strong>Stock Target 1:</strong>
                ${money(plan.target1)}
            </p>


            <p>
                <strong>Stock Target 1 ROI:</strong>
                ${percent(plan.stockROI1)}
            </p>


            <p>
                <strong>Stock Target 2:</strong>
                ${money(plan.target2)}
            </p>


            <p>
                <strong>Stock Target 2 ROI:</strong>
                ${percent(plan.stockROI2)}
            </p>


            <p>
                <strong>Stock Target 3:</strong>
                ${money(plan.target3)}
            </p>


            <p>
                <strong>Stock Target 3 ROI:</strong>
                ${percent(plan.stockROI3)}
            </p>


            <hr>


            <h3>
                🎯 OPTION EXECUTION
            </h3>


            <p>
                <strong>${plan.optionType} Strike:</strong>
                ${money(plan.strike)}
            </p>


            <p>
                <strong>Expiration:</strong>
                ${plan.expiration || "Not Set"}
            </p>


            <p>
                <strong>Option Premium Entry:</strong>
                ${money(plan.optionEntry)}
            </p>


            <p>
                <strong>Take Profit 1:</strong>
                ${money(plan.optionTarget1)}
            </p>


            <p>
                <strong>Option ROI 1:</strong>
                ${percent(plan.optionROI1)}
            </p>


            <p>
                <strong>Take Profit 2:</strong>
                ${money(plan.optionTarget2)}
            </p>


            <p>
                <strong>Option ROI 2:</strong>
                ${percent(plan.optionROI2)}
            </p>


            <p>
                <strong>Take Profit 3:</strong>
                ${money(plan.optionTarget3)}
            </p>


            <p>
                <strong>Option ROI 3:</strong>
                ${percent(plan.optionROI3)}
            </p>


            <hr>


            <h3>
                🪜 EXECUTION LADDER
            </h3>


            <p>
                🟢 Target 1 —
                Sell 40%
            </p>


            <p>
                🟢 Target 2 —
                Sell 30%
            </p>


            <p>
                🚀 Target 3 —
                Sell 20%
            </p>


            <p>
                🏃 Runner —
                Hold 10%
            </p>


            <hr>


            <h3>
                🛡 RISK
            </h3>


            <p>
                <strong>Account Size:</strong>
                ${money(plan.accountSize)}
            </p>


            <p>
                <strong>Risk Budget:</strong>
                ${money(plan.riskAmount)}
            </p>


            <p>
                <strong>Maximum Contracts by Budget:</strong>
                ${plan.maxContracts}
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
    ====================================== */

    savePlan() {

        if (
            !window.currentTradePlan
        ) {

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



    loadPlans() {

        return JSON.parse(

            localStorage.getItem(
                "roLyfeTradePlans"
            ) || "[]"

        );

    },



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
