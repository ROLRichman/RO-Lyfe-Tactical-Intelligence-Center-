/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE PLANNER ENGINE
   js/trade-planner.js

   STOCK MAP → OPTION EXECUTION
========================================================= */

const TradePlanner = {

    /* =====================================================
       CREATE TRADE PLAN
    ===================================================== */

    createPlan() {

        /* ---------------------------------------------
           BASIC INFORMATION
        --------------------------------------------- */

        const symbol =
            document
                .getElementById("symbol")
                ?.value
                ?.trim()
                .toUpperCase() || "";

        const instrument =
            document
                .getElementById("instrument")
                ?.value || "Option";

        const direction =
            document
                .getElementById("direction")
                ?.value || "Long";

        const accountSize =
            parseFloat(
                document
                    .getElementById("accountSize")
                    ?.value
            ) || 0;

        const riskPercent =
            parseFloat(
                document
                    .getElementById("riskPercent")
                    ?.value
            ) || 0;


        /* ---------------------------------------------
           PROBABILITY / IMPLIED VOLATILITY
        --------------------------------------------- */

        const probability =
            parseFloat(
                document
                    .getElementById("probability")
                    ?.value
            );

        const impliedVolatility =
            parseFloat(
                document
                    .getElementById("impliedVolatility")
                    ?.value
            );


        /* ---------------------------------------------
           STOCK MAP
        --------------------------------------------- */

        const stockEntry =
            parseFloat(
                document
                    .getElementById("entry")
                    ?.value
            );

        const stockStop =
            parseFloat(
                document
                    .getElementById("stop")
                    ?.value
            );

        const stockTarget1 =
            parseFloat(
                document
                    .getElementById("target1")
                    ?.value
            );

        const stockTarget2 =
            parseFloat(
                document
                    .getElementById("target2")
                    ?.value
            );

        const stockTarget3 =
            parseFloat(
                document
                    .getElementById("target3")
                    ?.value
            );


        /* ---------------------------------------------
           OPTION EXECUTION
        --------------------------------------------- */

        const optionType =
            document
                .getElementById("optionType")
                ?.value || "Call";

        const strike =
            parseFloat(
                document
                    .getElementById("strike")
                    ?.value
            );

        const expiration =
            document
                .getElementById("expiration")
                ?.value || "";

        const optionEntry =
            parseFloat(
                document
                    .getElementById("optionEntry")
                    ?.value
            );

        const optionTarget1 =
            parseFloat(
                document
                    .getElementById("optionTarget1")
                    ?.value
            );

        const optionTarget2 =
            parseFloat(
                document
                    .getElementById("optionTarget2")
                    ?.value
            );

        const optionTarget3 =
            parseFloat(
                document
                    .getElementById("optionTarget3")
                    ?.value
            );


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!symbol) {

            alert(
                "Please enter a Symbol."
            );

            return null;

        }


        if (
            isNaN(stockEntry) ||
            isNaN(stockStop)
        ) {

            alert(
                "Please enter Stock Entry and Stock Stop."
            );

            return null;

        }


        /* ---------------------------------------------
           RISK CALCULATIONS
        --------------------------------------------- */

        const stockRiskPerShare =
            Math.abs(
                stockEntry -
                stockStop
            );


        const riskAmount =
            accountSize *
            (
                riskPercent / 100
            );


        let maxShares = 0;


        if (
            stockRiskPerShare > 0 &&
            riskAmount > 0
        ) {

            maxShares =
                Math.floor(
                    riskAmount /
                    stockRiskPerShare
                );

        }


        /* ---------------------------------------------
           STOCK TARGET CALCULATIONS
        --------------------------------------------- */

        const stockRiskReward1 =
            this.calculateRiskReward(
                stockEntry,
                stockStop,
                stockTarget1
            );


        const stockRiskReward2 =
            this.calculateRiskReward(
                stockEntry,
                stockStop,
                stockTarget2
            );


        const stockRiskReward3 =
            this.calculateRiskReward(
                stockEntry,
                stockStop,
                stockTarget3
            );


        const stockROI1 =
            this.calculateStockROI(
                stockEntry,
                stockTarget1,
                direction
            );


        const stockROI2 =
            this.calculateStockROI(
                stockEntry,
                stockTarget2,
                direction
            );


        const stockROI3 =
            this.calculateStockROI(
                stockEntry,
                stockTarget3,
                direction
            );


        /* ---------------------------------------------
           OPTION ROI CALCULATIONS
        --------------------------------------------- */

        const optionROI1 =
            this.calculateOptionROI(
                optionEntry,
                optionTarget1
            );


        const optionROI2 =
            this.calculateOptionROI(
                optionEntry,
                optionTarget2
            );


        const optionROI3 =
            this.calculateOptionROI(
                optionEntry,
                optionTarget3
            );


        /* ---------------------------------------------
           OPTION PROFIT PER CONTRACT

           Options normally represent
           100 shares per contract.
        --------------------------------------------- */

        const optionProfit1 =
            this.calculateOptionProfit(
                optionEntry,
                optionTarget1
            );


        const optionProfit2 =
            this.calculateOptionProfit(
                optionEntry,
                optionTarget2
            );


        const optionProfit3 =
            this.calculateOptionProfit(
                optionEntry,
                optionTarget3
            );


        /* ---------------------------------------------
           CREATE PLAN OBJECT
        --------------------------------------------- */

        const plan = {

            id:
                Date.now(),


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


            accountSize:
                accountSize,


            riskPercent:
                riskPercent,


            riskAmount:
                riskAmount,


            /* PROBABILITY */

            probability:
                isNaN(probability)
                    ? null
                    : probability,


            impliedVolatility:
                isNaN(impliedVolatility)
                    ? null
                    : impliedVolatility,


            /* STOCK MAP */

            stockEntry:
                stockEntry,


            stockStop:
                stockStop,


            stockRiskPerShare:
                stockRiskPerShare,


            maxShares:
                maxShares,


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


            stockRiskReward1:
                stockRiskReward1,


            stockRiskReward2:
                stockRiskReward2,


            stockRiskReward3:
                stockRiskReward3,


            stockROI1:
                stockROI1,


            stockROI2:
                stockROI2,


            stockROI3:
                stockROI3,


            /* OPTION EXECUTION */

            optionType:
                optionType,


            strike:
                isNaN(strike)
                    ? null
                    : strike,


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


            /* LADDER */

            sellTarget1:
                40,


            sellTarget2:
                30,


            sellTarget3:
                20,


            runner:
                10,


            status:
                "PLANNED"

        };


        /* ---------------------------------------------
           BACKWARD COMPATIBILITY

           Keeps current Risk Engine and Ladder
           working while we upgrade them.
        --------------------------------------------- */

        plan.entry =
            stockEntry;


        plan.stop =
            stockStop;


        plan.riskPerUnit =
            stockRiskPerShare;


        plan.target1 =
            plan.stockTarget1;


        plan.target2 =
            plan.stockTarget2;


        plan.target3 =
            plan.stockTarget3;


        /* ---------------------------------------------
           SAVE CURRENT PLAN
        --------------------------------------------- */

        window.currentTradePlan =
            plan;


        /* ---------------------------------------------
           DISPLAY PLAN
        --------------------------------------------- */

        this.displayPlan(
            plan
        );


        return plan;

    },



    /* =====================================================
       CALCULATE STOCK ROI
    ===================================================== */

    calculateStockROI(
        entry,
        target,
        direction
    ) {

        if (
            isNaN(entry) ||
            isNaN(target) ||
            entry === 0
        ) {

            return null;

        }


        let percentage;


        if (direction === "Short") {

            percentage =
                (
                    (entry - target) /
                    entry
                ) * 100;

        }

        else {

            percentage =
                (
                    (target - entry) /
                    entry
                ) * 100;

        }


        return percentage;

    },



    /* =====================================================
       CALCULATE RISK / REWARD
    ===================================================== */

    calculateRiskReward(
        entry,
        stop,
        target
    ) {

        if (
            isNaN(entry) ||
            isNaN(stop) ||
            isNaN(target)
        ) {

            return null;

        }


        const risk =
            Math.abs(
                entry - stop
            );


        const reward =
            Math.abs(
                target - entry
            );


        if (risk === 0) {

            return null;

        }


        return reward / risk;

    },



    /* =====================================================
       CALCULATE OPTION ROI
    ===================================================== */

    calculateOptionROI(
        entry,
        target
    ) {

        if (
            isNaN(entry) ||
            isNaN(target) ||
            entry === 0
        ) {

            return null;

        }


        return (
            (
                target -
                entry
            )
            /
            entry
        ) * 100;

    },



    /* =====================================================
       CALCULATE OPTION PROFIT

       1 CONTRACT = 100 SHARES
    ===================================================== */

    calculateOptionProfit(
        entry,
        target
    ) {

        if (
            isNaN(entry) ||
            isNaN(target)
        ) {

            return null;

        }


        return (
            target -
            entry
        ) * 100;

    },



    /* =====================================================
       FORMAT VALUE
    ===================================================== */

    formatMoney(value) {

        if (
            value === null ||
            value === undefined ||
            isNaN(value)
        ) {

            return "Not Set";

        }


        return "$" +
            Number(value)
                .toFixed(2);

    },



    formatPercent(value) {

        if (
            value === null ||
            value === undefined ||
            isNaN(value)
        ) {

            return "Not Set";

        }


        return (
            Number(value)
                .toFixed(2)
            + "%"
        );

    },



    formatRiskReward(value) {

        if (
            value === null ||
            value === undefined ||
            isNaN(value)
        ) {

            return "Not Set";

        }


        return (
            "1 : " +
            Number(value)
                .toFixed(2)
        );

    },



    /* =====================================================
       DISPLAY TRADE PLAN
    ===================================================== */

    displayPlan(plan) {

        const output =
            document.getElementById(
                "tradePlanOutput"
            );


        if (!output) return;


        output.innerHTML = `

        <div class="trade-plan-card">


            <h3>
                🎯 RO'LYFE TRADE PLAN
            </h3>


            <div class="plan-status">

                ${plan.status}

            </div>


            <!-- ============================
                 TRADE IDENTITY
            ============================= -->

            <h4>
                🧠 TRADE IDENTITY
            </h4>


            <p>

                <strong>
                    Symbol:
                </strong>

                ${plan.symbol}

            </p>


            <p>

                <strong>
                    Instrument:
                </strong>

                ${plan.instrument}

            </p>


            <p>

                <strong>
                    Direction:
                </strong>

                ${plan.direction}

            </p>


            <hr>


            <!-- ============================
                 PROBABILITY
            ============================= -->

            <h4>
                🧠 PROBABILITY / VOLATILITY
            </h4>


            <p>

                <strong>
                    Probability:
                </strong>

                ${this.formatPercent(
                    plan.probability
                )}

            </p>


            <p>

                <strong>
                    Implied Volatility:
                </strong>

                ${this.formatPercent(
                    plan.impliedVolatility
                )}

            </p>


            <hr>


            <!-- ============================
                 STOCK MAP
            ============================= -->

            <h4>
                📈 STOCK MAP
            </h4>


            <p>

                <strong>
                    Stock Entry:
                </strong>

                ${this.formatMoney(
                    plan.stockEntry
                )}

            </p>


            <p>

                <strong>
                    Stock Stop:
                </strong>

                ${this.formatMoney(
                    plan.stockStop
                )}

            </p>


            <p>

                <strong>
                    Risk Per Share:
                </strong>

                ${this.formatMoney(
                    plan.stockRiskPerShare
                )}

            </p>


            <p>

                <strong>
                    Risk Budget:
                </strong>

                ${this.formatMoney(
                    plan.riskAmount
                )}

            </p>


            <p>

                <strong>
                    Maximum Shares:
                </strong>

                ${plan.maxShares}

            </p>


            <hr>


            <!-- ============================
                 STOCK TARGET 1
            ============================= -->

            <h4>
                🟢 STOCK TARGET 1
            </h4>


            <p>

                <strong>
                    Target:
                </strong>

                ${this.formatMoney(
                    plan.stockTarget1
                )}

            </p>


            <p>

                <strong>
                    Result / ROI:
                </strong>

                ${this.formatPercent(
                    plan.stockROI1
                )}

            </p>


            <p>

                <strong>
                    Risk / Reward:
                </strong>

                ${this.formatRiskReward(
                    plan.stockRiskReward1
                )}

            </p>


            <!-- ============================
                 STOCK TARGET 2
            ============================= -->

            <h4>
                🟢 STOCK TARGET 2
            </h4>


            <p>

                <strong>
                    Target:
                </strong>

                ${this.formatMoney(
                    plan.stockTarget2
                )}

            </p>


            <p>

                <strong>
                    Result / ROI:
                </strong>

                ${this.formatPercent(
                    plan.stockROI2
                )}

            </p>


            <p>

                <strong>
                    Risk / Reward:
                </strong>

                ${this.formatRiskReward(
                    plan.stockRiskReward2
                )}

            </p>


            <!-- ============================
                 STOCK TARGET 3
            ============================= -->

            <h4>
                🚀 STOCK TARGET 3
            </h4>


            <p>

                <strong>
                    Target:
                </strong>

                ${this.formatMoney(
                    plan.stockTarget3
                )}

            </p>


            <p>

                <strong>
                    Result / ROI:
                </strong>

                ${this.formatPercent(
                    plan.stockROI3
                )}

            </p>


            <p>

                <strong>
                    Risk / Reward:
                </strong>

                ${this.formatRiskReward(
                    plan.stockRiskReward3
                )}

            </p>


            <hr>


            <!-- ============================
                 OPTION EXECUTION
            ============================= -->

            <h4>
                🎯 OPTION EXECUTION
            </h4>


            <p>

                <strong>
                    Contract:
                </strong>

                ${plan.strike ?? "Not Set"}
                ${plan.optionType}

            </p>


            <p>

                <strong>
                    Expiration:
                </strong>

                ${plan.expiration || "Not Set"}

            </p>


            <p>

                <strong>
                    Premium Entry:
                </strong>

                ${this.formatMoney(
                    plan.optionEntry
                )}

            </p>


            <hr>


            <!-- ============================
                 OPTION TAKE PROFIT 1
            ============================= -->

            <h4>
                🟢 TAKE PROFIT 1 — SELL 40%
            </h4>


            <p>

                <strong>
                    Premium Target:
                </strong>

                ${this.formatMoney(
                    plan.optionTarget1
                )}

            </p>


            <p>

                <strong>
                    Option ROI:
                </strong>

                ${this.formatPercent(
                    plan.optionROI1
                )}

            </p>


            <p>

                <strong>
                    Profit Per Contract:
                </strong>

                ${this.formatMoney(
                    plan.optionProfit1
                )}

            </p>


            <!-- ============================
                 OPTION TAKE PROFIT 2
            ============================= -->

            <h4>
                🟢 TAKE PROFIT 2 — SELL 30%
            </h4>


            <p>

                <strong>
                    Premium Target:
                </strong>

                ${this.formatMoney(
                    plan.optionTarget2
                )}

            </p>


            <p>

                <strong>
                    Option ROI:
                </strong>

                ${this.formatPercent(
                    plan.optionROI2
                )}

            </p>


            <p>

                <strong>
                    Profit Per Contract:
                </strong>

                ${this.formatMoney(
                    plan.optionProfit2
                )}

            </p>


            <!-- ============================
                 OPTION TAKE PROFIT 3
            ============================= -->

            <h4>
                🚀 TAKE PROFIT 3 — SELL 20%
            </h4>


            <p>

                <strong>
                    Premium Target:
                </strong>

                ${this.formatMoney(
                    plan.optionTarget3
                )}

            </p>


            <p>

                <strong>
                    Option ROI:
                </strong>

                ${this.formatPercent(
                    plan.optionROI3
                )}

            </p>


            <p>

                <strong>
                    Profit Per Contract:
                </strong>

                ${this.formatMoney(
                    plan.optionProfit3
                )}

            </p>


            <!-- ============================
                 RUNNER
            ============================= -->

            <div class="runner">

                <h4>
                    🏃 RUNNER — KEEP 10%
                </h4>


                <p>

                    Trail remaining position
                    using stock structure.

                </p>

            </div>


            <hr>


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



    /* =====================================================
       SAVE PLAN
    ===================================================== */

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

            JSON.stringify(
                plans
            )

        );


        alert(

            `${window.currentTradePlan.symbol} trade plan saved! 🎯`

        );

    },



    /* =====================================================
       LOAD PLANS
    ===================================================== */

    loadPlans() {

        return JSON.parse(

            localStorage.getItem(
                "roLyfeTradePlans"
            ) || "[]"

        );

    },



    /* =====================================================
       DELETE PLAN
    ===================================================== */

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

            JSON.stringify(
                plans
            )

        );

    }

};
