/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE PLANNER ENGINE
   js/trade-planner.js

   STOCK MAP → OPTION EXECUTION → RISK → ROI
========================================================= */

const TradePlanner = {

    /* =====================================
       HELPERS
    ===================================== */

    getNumber(id) {

        const element =
            document.getElementById(id);

        if (!element) {

            return null;

        }

        const value =
            parseFloat(element.value);

        return isNaN(value)
            ? null
            : value;

    },


    getValue(id, fallback = "") {

        const element =
            document.getElementById(id);

        if (!element) {

            return fallback;

        }

        return element.value || fallback;

    },


    /* =====================================
       CREATE COMPLETE TRADE PLAN
    ===================================== */

    createPlan() {

        /* ---------------------------------
           BASIC TRADE INFORMATION
        --------------------------------- */

        const symbol =
            this.getValue(
                "symbol",
                ""
            ).toUpperCase();


        const instrument =
            this.getValue(
                "instrument",
                "Option"
            );


        const direction =
            this.getValue(
                "direction",
                "Long"
            );


        const accountSize =
            this.getNumber(
                "accountSize"
            );


        const riskPercent =
            this.getNumber(
                "riskPercent"
            );


        /* ---------------------------------
           PROBABILITY / VOLATILITY
        --------------------------------- */

        const probability =
            this.getNumber(
                "probability"
            );


        const impliedVolatility =
            this.getNumber(
                "impliedVolatility"
            );


        /* ---------------------------------
           STOCK MAP
        --------------------------------- */

        const stockEntry =
            this.getNumber(
                "entry"
            );


        const stockStop =
            this.getNumber(
                "stop"
            );


        const stockTarget1 =
            this.getNumber(
                "target1"
            );


        const stockTarget2 =
            this.getNumber(
                "target2"
            );


        const stockTarget3 =
            this.getNumber(
                "target3"
            );


        /* ---------------------------------
           OPTION EXECUTION
        --------------------------------- */

        const optionType =
            this.getValue(
                "optionType",
                "Call"
            );


        const strike =
            this.getNumber(
                "strike"
            );


        const expiration =
            this.getValue(
                "expiration",
                ""
            );


        const optionEntry =
            this.getNumber(
                "optionEntry"
            );


        const optionTarget1 =
            this.getNumber(
                "optionTarget1"
            );


        const optionTarget2 =
            this.getNumber(
                "optionTarget2"
            );


        const optionTarget3 =
            this.getNumber(
                "optionTarget3"
            );


        /* ---------------------------------
           VALIDATION

           Stock Map is the foundation.
        --------------------------------- */

        if (!symbol) {

            alert(
                "Please enter a Symbol."
            );

            return null;

        }


        if (
            stockEntry === null ||
            stockStop === null
        ) {

            alert(
                "Please enter Stock Entry and Stock Stop."
            );

            return null;

        }


        if (
            stockEntry <= 0 ||
            stockStop <= 0
        ) {

            alert(
                "Stock Entry and Stock Stop must be greater than zero."
            );

            return null;

        }


        if (
            direction === "Long" &&
            stockStop >= stockEntry
        ) {

            alert(
                "For a Long trade, the Stock Stop must be below the Stock Entry."
            );

            return null;

        }


        if (
            direction === "Short" &&
            stockStop <= stockEntry
        ) {

            alert(
                "For a Short trade, the Stock Stop must be above the Stock Entry."
            );

            return null;

        }


        /* ---------------------------------
           STOCK RISK
        --------------------------------- */

        const stockRiskPerShare =
            Math.abs(
                stockEntry -
                stockStop
            );


        let riskAmount = 0;


        if (
            accountSize !== null &&
            riskPercent !== null &&
            accountSize > 0 &&
            riskPercent > 0
        ) {

            riskAmount =
                accountSize *
                (
                    riskPercent / 100
                );

        }


        /* ---------------------------------
           STOCK ROI / RESULTS

           Long:
           Target - Entry

           Short:
           Entry - Target
        --------------------------------- */

        const calculateStockResult =
            (target) => {

                if (
                    target === null ||
                    stockEntry === null
                ) {

                    return null;

                }


                let result;


                if (
                    direction === "Long"
                ) {

                    result =
                        target -
                        stockEntry;

                } else {

                    result =
                        stockEntry -
                        target;

                }


                const roi =
                    (
                        result /
                        stockEntry
                    ) * 100;


                return {

                    target: target,

                    result: result,

                    roi: roi

                };

            };


        const stockResult1 =
            calculateStockResult(
                stockTarget1
            );


        const stockResult2 =
            calculateStockResult(
                stockTarget2
            );


        const stockResult3 =
            calculateStockResult(
                stockTarget3
            );


        /* ---------------------------------
           OPTION ROI / RESULTS

           Premium movement.
        --------------------------------- */

        const calculateOptionResult =
            (target) => {

                if (
                    target === null ||
                    optionEntry === null ||
                    optionEntry <= 0
                ) {

                    return null;

                }


                const profitPerShare =
                    target -
                    optionEntry;


                const roi =
                    (
                        profitPerShare /
                        optionEntry
                    ) * 100;


                /*
                   Standard equity option
                   contract = 100 shares
                */

                const profitPerContract =
                    profitPerShare *
                    100;


                return {

                    target: target,

                    profitPerShare:
                        profitPerShare,

                    profitPerContract:
                        profitPerContract,

                    roi: roi

                };

            };


        const optionResult1 =
            calculateOptionResult(
                optionTarget1
            );


        const optionResult2 =
            calculateOptionResult(
                optionTarget2
            );


        const optionResult3 =
            calculateOptionResult(
                optionTarget3
            );


        /* ---------------------------------
           BUILD COMPLETE PLAN
        --------------------------------- */

        const plan = {

            id:
                Date.now(),


            date:
                new Date()
                    .toLocaleString(),


            status:
                "PLANNED",


            /* BASIC */

            symbol:
                symbol,


            instrument:
                instrument,


            direction:
                direction,


            accountSize:
                accountSize || 0,


            riskPercent:
                riskPercent || 0,


            riskAmount:
                riskAmount,


            /* PROBABILITY */

            probability:
                probability,


            impliedVolatility:
                impliedVolatility,


            /* =============================
               STOCK MAP
            ============================= */

            stockEntry:
                stockEntry,


            stockStop:
                stockStop,


            stockRiskPerShare:
                stockRiskPerShare,


            stockTarget1:
                stockTarget1,


            stockTarget2:
                stockTarget2,


            stockTarget3:
                stockTarget3,


            stockResult1:
                stockResult1,


            stockResult2:
                stockResult2,


            stockResult3:
                stockResult3,


            /* =============================
               OPTION EXECUTION
            ============================= */

            optionType:
                optionType,


            strike:
                strike,


            expiration:
                expiration ||
                "Not Selected",


            optionEntry:
                optionEntry,


            optionTarget1:
                optionTarget1,


            optionTarget2:
                optionTarget2,


            optionTarget3:
                optionTarget3,


            optionResult1:
                optionResult1,


            optionResult2:
                optionResult2,


            optionResult3:
                optionResult3,


            /* =============================
               LADDER ALLOCATION
            ============================= */

            ladder: {

                target1Percent:
                    40,


                target2Percent:
                    30,


                target3Percent:
                    20,


                runnerPercent:
                    10

            }

        };


        /*
           BACKWARD COMPATIBILITY

           Keeps your existing Risk,
           Ladder, and Journal code
           from immediately breaking.
        */

        plan.entry =
            stockEntry;


        plan.stop =
            stockStop;


        plan.riskPerUnit =
            stockRiskPerShare;


        plan.target1 =
            stockTarget1;


        plan.target2 =
            stockTarget2;


        plan.target3 =
            stockTarget3;


        /*
           SAVE CURRENT PLAN
        */

        window.currentTradePlan =
            plan;


        /*
           DISPLAY COMPLETE PLAN
        */

        this.displayPlan(plan);


        console.log(
            "🎯 RO'Lyfe Trade Plan Created:",
            plan
        );


        return plan;

    },


    /* =====================================
       DISPLAY COMPLETE PLAN
    ===================================== */

    displayPlan(plan) {

        const output =
            document.getElementById(
                "tradePlanOutput"
            );


        if (!output) {

            return;

        }


        const money =
            (value) => {

                if (
                    value === null ||
                    value === undefined
                ) {

                    return "Not Set";

                }


                return "$" +
                    Number(value)
                        .toFixed(2);

            };


        const percent =
            (value) => {

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

            };


        const displayStockResult =
            (result) => {

                if (!result) {

                    return `
                        <span>
                            Not Set
                        </span>
                    `;

                }


                return `

                    <div class="result-line">

                        <span>

                            Result:
                            ${money(result.result)}

                        </span>

                        <span>

                            ROI:
                            ${percent(result.roi)}

                        </span>

                    </div>

                `;

            };


        const displayOptionResult =
            (result) => {

                if (!result) {

                    return `
                        <span>
                            Not Set
                        </span>
                    `;

                }


                return `

                    <div class="result-line">

                        <span>

                            Profit / Contract:
                            ${money(
                                result.profitPerContract
                            )}

                        </span>

                        <span>

                            ROI:
                            ${percent(
                                result.roi
                            )}

                        </span>

                    </div>

                `;

            };


        output.innerHTML = `

            <div class="trade-plan-card">

                <h3>
                    🎯 RO'LYFE TRADE PLAN
                </h3>


                <div class="plan-status">

                    ${plan.status}

                </div>


                <!-- =========================
                     BASIC
                ========================== -->

                <div class="plan-section">

                    <h4>
                        📋 TRADE INFORMATION
                    </h4>

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

                    <p>
                        <strong>Account:</strong>
                        ${money(plan.accountSize)}
                    </p>

                    <p>
                        <strong>Risk Budget:</strong>
                        ${money(plan.riskAmount)}
                    </p>

                </div>


                <!-- =========================
                     PROBABILITY
                ========================== -->

                <div class="plan-section">

                    <h4>
                        🧠 TRADE PROBABILITY
                    </h4>

                    <p>
                        <strong>Probability:</strong>
                        ${percent(plan.probability)}
                    </p>

                    <p>
                        <strong>Implied Volatility:</strong>
                        ${percent(
                            plan.impliedVolatility
                        )}
                    </p>

                </div>


                <!-- =========================
                     STOCK MAP
                ========================== -->

                <div class="plan-section stock-plan">

                    <h4>
                        📈 STOCK MAP
                    </h4>

                    <p>
                        <strong>Stock Entry:</strong>
                        ${money(plan.stockEntry)}
                    </p>

                    <p>
                        <strong>Stock Stop:</strong>
                        ${money(plan.stockStop)}
                    </p>

                    <p>
                        <strong>Risk Per Share:</strong>
                        ${money(
                            plan.stockRiskPerShare
                        )}
                    </p>


                    <hr>


                    <div class="target-result">

                        <strong>
                            Target 1:
                            ${money(
                                plan.stockTarget1
                            )}
                        </strong>

                        ${displayStockResult(
                            plan.stockResult1
                        )}

                    </div>


                    <div class="target-result">

                        <strong>
                            Target 2:
                            ${money(
                                plan.stockTarget2
                            )}
                        </strong>

                        ${displayStockResult(
                            plan.stockResult2
                        )}

                    </div>


                    <div class="target-result">

                        <strong>
                            Target 3:
                            ${money(
                                plan.stockTarget3
                            )}
                        </strong>

                        ${displayStockResult(
                            plan.stockResult3
                        )}

                    </div>

                </div>


                <!-- =========================
                     OPTION EXECUTION
                ========================== -->

                <div class="plan-section option-plan">

                    <h4>
                        🎯 OPTION EXECUTION
                    </h4>

                    <p>
                        <strong>Type:</strong>
                        ${plan.optionType}
                    </p>

                    <p>
                        <strong>Strike:</strong>
                        ${
                            plan.strike !== null
                                ? money(plan.strike)
                                : "Not Set"
                        }
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


                    <div class="target-result">

                        <strong>
                            Take Profit 1:
                            ${money(
                                plan.optionTarget1
                            )}
                        </strong>

                        ${displayOptionResult(
                            plan.optionResult1
                        )}

                        <small>
                            Sell 40%
                        </small>

                    </div>


                    <div class="target-result">

                        <strong>
                            Take Profit 2:
                            ${money(
                                plan.optionTarget2
                            )}
                        </strong>

                        ${displayOptionResult(
                            plan.optionResult2
                        )}

                        <small>
                            Sell 30%
                        </small>

                    </div>


                    <div class="target-result">

                        <strong>
                            Take Profit 3:
                            ${money(
                                plan.optionTarget3
                            )}
                        </strong>

                        ${displayOptionResult(
                            plan.optionResult3
                        )}

                        <small>
                            Sell 20%
                        </small>

                    </div>


                    <div class="runner-box">

                        🏃 RUNNER — 10%

                        <br>

                        Trail With Structure

                    </div>

                </div>


                <!-- =========================
                     DATE
                ========================== -->

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

            JSON.stringify(
                plans
            )

        );


        alert(

            `🎯 ${window.currentTradePlan.symbol} trade plan saved!`

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

            JSON.stringify(
                plans
            )

        );

    }

};


/* =====================================
   GLOBAL ACCESS
===================================== */

window.TradePlanner =
    TradePlanner;
