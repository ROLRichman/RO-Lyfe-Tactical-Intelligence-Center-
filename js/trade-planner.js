/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MASTER TRADE PLANNER ENGINE
   js/trade-planner.js

   PLAN → SIZE → LADDER → EXECUTE → JOURNAL → REVIEW

   CONNECTS:

   • ROLyfeRiskEngine
   • ROLyfeLadderEngine
   • Trade Journal
   • Trade Planner UI

   TRADE SMART. STAY DISCIPLINED.
   PROTECT YOUR CAPITAL. TRUST THE PROCESS.
========================================================= */

const TradePlanner = {

    /* =====================================================
       HELPERS
    ===================================================== */

    getElement(id) {

        return document.getElementById(id);

    },


    getNumber(id, fallback = null) {

        const element =
            this.getElement(id);

        if (!element) {
            return fallback;
        }

        const value =
            parseFloat(element.value);

        return isNaN(value)
            ? fallback
            : value;

    },


    getValue(id, fallback = "") {

        const element =
            this.getElement(id);

        if (!element) {
            return fallback;
        }

        const value =
            String(element.value || "").trim();

        return value || fallback;

    },


    normalizeDirection(direction) {

        direction =
            String(direction || "long")
                .trim()
                .toLowerCase();

        return direction === "short"
            ? "short"
            : "long";

    },


    displayDirection(direction) {

        return this.normalizeDirection(direction) === "short"
            ? "Short"
            : "Long";

    },


    normalizeInstrument(instrument) {

        instrument =
            String(instrument || "stock")
                .trim()
                .toLowerCase();

        if (
            instrument.includes("crypto")
        ) {
            return "crypto";
        }

        if (
            instrument.includes("spread")
        ) {
            return "option_spread";
        }

        if (
            instrument.includes("option")
        ) {
            return "option";
        }

        return "stock";

    },


    formatMoney(value) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {
            return "Not Set";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD"
            }
        ).format(Number(value));

    },


    formatPercent(value) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {
            return "Not Set";
        }

        return (
            Number(value).toFixed(2) +
            "%"
        );

    },


    formatNumber(value, decimals = 2) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {
            return "Not Set";
        }

        return Number(value).toFixed(decimals);

    },


    formatPrice(value) {

        if (
            window.ROLyfeLadderEngine &&
            typeof window.ROLyfeLadderEngine.formatPrice ===
            "function"
        ) {
            return "$" +
                window.ROLyfeLadderEngine.formatPrice(value);
        }

        return this.formatMoney(value);

    },


    /* =====================================================
       PROBABILITY CLASSIFICATION
    ===================================================== */

    calculateProbabilityResult(probability) {

        if (
            probability === null ||
            probability === undefined
        ) {
            return "NOT SET";
        }

        probability =
            Number(probability);

        if (probability >= 70) {
            return "HIGH";
        }

        if (probability >= 50) {
            return "MODERATE";
        }

        return "LOW";

    },


    /* =====================================================
       GET ENGINE STATUS

       Prevents silent failures if scripts
       are loaded in the wrong order.
    ===================================================== */

    checkEngines() {

        const missing = [];

        if (
            !window.ROLyfeRiskEngine
        ) {
            missing.push(
                "ROLyfeRiskEngine"
            );
        }

        if (
            !window.ROLyfeLadderEngine
        ) {
            missing.push(
                "ROLyfeLadderEngine"
            );
        }

        return {

            valid:
                missing.length === 0,

            missing

        };

    },


    /* =====================================================
       VALIDATE CORE TRADE MAP
    ===================================================== */

    validateTrade({

        symbol,

        direction,

        accountSize,

        riskPercent,

        stockEntry,

        stockStop,

        probability

    }) {

        if (!symbol) {

            return {
                valid: false,
                error:
                    "Please enter a Symbol."
            };

        }


        if (
            accountSize === null ||
            accountSize <= 0
        ) {

            return {
                valid: false,
                error:
                    "Please enter a valid Account Size."
            };

        }


        if (
            riskPercent === null ||
            riskPercent <= 0
        ) {

            return {
                valid: false,
                error:
                    "Please enter a valid Risk Percentage."
            };

        }


        if (
            stockEntry === null ||
            stockEntry <= 0
        ) {

            return {
                valid: false,
                error:
                    "Please enter a valid Stock Entry."
            };

        }


        if (
            stockStop === null ||
            stockStop <= 0
        ) {

            return {
                valid: false,
                error:
                    "Please enter a valid Stock Stop."
            };

        }


        if (
            probability !== null &&
            (
                probability < 0 ||
                probability > 100
            )
        ) {

            return {
                valid: false,
                error:
                    "Probability must be between 0 and 100."
            };

        }


        if (
            direction === "long" &&
            stockStop >= stockEntry
        ) {

            return {
                valid: false,
                error:
                    "For a Long trade, the Stock Stop must be below the Stock Entry."
            };

        }


        if (
            direction === "short" &&
            stockStop <= stockEntry
        ) {

            return {
                valid: false,
                error:
                    "For a Short trade, the Stock Stop must be above the Stock Entry."
            };

        }


        return {
            valid: true
        };

    },


    /* =====================================================
       CALCULATE MANUAL TARGET RESULT
    ===================================================== */

    calculateStockTargetResult({

        entry,

        stop,

        target,

        direction,

        quantity = 0

    }) {

        if (
            target === null ||
            target === undefined ||
            !Number.isFinite(Number(target))
        ) {
            return null;
        }


        entry =
            Number(entry);

        stop =
            Number(stop);

        target =
            Number(target);

        quantity =
            Number(quantity) || 0;


        const riskPerUnit =
            Math.abs(
                entry - stop
            );


        let priceResult;


        if (direction === "short") {

            priceResult =
                entry - target;

        }

        else {

            priceResult =
                target - entry;

        }


        const roi =
            entry > 0
                ? (
                    priceResult /
                    entry
                ) * 100
                : null;


        const rMultiple =
            riskPerUnit > 0
                ? (
                    priceResult /
                    riskPerUnit
                )
                : null;


        const estimatedProfit =
            quantity > 0
                ? priceResult * quantity
                : null;


        return {

            target,

            result:
                priceResult,

            roi,

            rMultiple,

            estimatedProfit

        };

    },


    /* =====================================================
       CALCULATE OPTION TARGET RESULT
    ===================================================== */

    calculateOptionTargetResult({

        optionEntry,

        optionTarget,

        contracts = 0

    }) {

        if (
            optionEntry === null ||
            optionEntry === undefined ||
            optionTarget === null ||
            optionTarget === undefined
        ) {
            return null;
        }


        optionEntry =
            Number(optionEntry);

        optionTarget =
            Number(optionTarget);

        contracts =
            Math.floor(
                Number(contracts) || 0
            );


        if (
            optionEntry <= 0 ||
            optionTarget <= 0
        ) {
            return null;
        }


        const priceMove =
            optionTarget -
            optionEntry;


        const profitPerContract =
            priceMove * 100;


        const roi =
            (
                priceMove /
                optionEntry
            ) * 100;


        const estimatedTotalProfit =
            contracts > 0
                ? profitPerContract *
                  contracts
                : null;


        return {

            target:
                optionTarget,

            profitPerShare:
                priceMove,

            profitPerContract,

            contracts,

            estimatedTotalProfit,

            roi

        };

    },


    /* =====================================================
       CREATE COMPLETE MASTER TRADE PLAN
    ===================================================== */

    createPlan() {

        /* =============================================
           CHECK ENGINES
        ============================================== */

        const engineStatus =
            this.checkEngines();


        if (!engineStatus.valid) {

            const message =
                "Missing required engine(s): " +
                engineStatus.missing.join(", ");

            console.error(message);

            alert(message);

            return null;

        }


        /* =============================================
           BASIC INFORMATION
        ============================================== */

        const symbol =
            this.getValue(
                "symbol",
                ""
            ).toUpperCase();


        const instrumentInput =
            this.getValue(
                "instrument",
                "Stock"
            );


        const instrument =
            this.normalizeInstrument(
                instrumentInput
            );


        const directionInput =
            this.getValue(
                "direction",
                "Long"
            );


        const direction =
            this.normalizeDirection(
                directionInput
            );


        const directionDisplay =
            this.displayDirection(
                direction
            );


        const accountSize =
            this.getNumber(
                "accountSize"
            );


        const riskPercent =
            this.getNumber(
                "riskPercent"
            );


        /* =============================================
           PROBABILITY / VOLATILITY
        ============================================== */

        const probability =
            this.getNumber(
                "probability"
            );


        const impliedVolatility =
            this.getNumber(
                "impliedVolatility"
            );


        /* =============================================
           STOCK MAP
        ============================================== */

        const stockEntry =
            this.getNumber(
                "entry"
            );


        const stockStop =
            this.getNumber(
                "stop"
            );


        /*
           Manual targets are optional.

           If not entered, the ladder engine
           automatically creates 1R / 2R / 3R.
        */

        const manualTarget1 =
            this.getNumber(
                "target1"
            );


        const manualTarget2 =
            this.getNumber(
                "target2"
            );


        const manualTarget3 =
            this.getNumber(
                "target3"
            );


        /* =============================================
           OPTION EXECUTION
        ============================================== */

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


        const optionDelta =
            this.getNumber(
                "optionDelta",
                0
            );


        /* =============================================
           VALIDATE TRADE
        ============================================== */

        const validation =
            this.validateTrade({

                symbol,

                direction,

                accountSize,

                riskPercent,

                stockEntry,

                stockStop,

                probability

            });


        if (!validation.valid) {

            alert(
                validation.error
            );

            return null;

        }


        /* =============================================
           CALCULATE RISK BUDGET
        ============================================== */

        const dollarRisk =
            accountSize *
            (
                riskPercent / 100
            );


        /* =============================================
           STOCK / CRYPTO RISK ENGINE
        ============================================== */

        let riskResult = null;

        let positionSize = 0;

        let positionValue = 0;

        let riskPerUnit =
            Math.abs(
                stockEntry -
                stockStop
            );


        /*
           STOCK
        */

        if (
            instrument === "stock"
        ) {

            riskResult =
                window.ROLyfeRiskEngine
                    .calculateStock({

                        accountBalance:
                            accountSize,

                        riskPercent,

                        entry:
                            stockEntry,

                        stop:
                            stockStop,

                        direction

                    });


            if (!riskResult.valid) {

                alert(
                    riskResult.error ||
                    "Unable to calculate stock risk."
                );

                return null;

            }


            positionSize =
                riskResult.shares;


            positionValue =
                riskResult.positionValue;


            riskPerUnit =
                riskResult.riskPerShare;

        }


        /*
           CRYPTO
        */

        else if (
            instrument === "crypto"
        ) {

            riskResult =
                window.ROLyfeRiskEngine
                    .calculateCrypto({

                        accountBalance:
                            accountSize,

                        riskPercent,

                        entry:
                            stockEntry,

                        stop:
                            stockStop,

                        direction

                    });


            if (!riskResult.valid) {

                alert(
                    riskResult.error ||
                    "Unable to calculate crypto risk."
                );

                return null;

            }


            positionSize =
                riskResult.quantity;


            positionValue =
                riskResult.positionValue;


            riskPerUnit =
                riskResult.riskPerUnit;

        }


        /*
           OPTIONS

           Position sizing is based on
           stock invalidation + option delta
           when option information exists.

           If no valid option entry exists,
           the stock map is still created.
        */

        else if (
            instrument === "option"
        ) {

            if (
                optionEntry !== null &&
                optionEntry > 0
            ) {

                riskResult =
                    window.ROLyfeRiskEngine
                        .calculateOption({

                            accountBalance:
                                accountSize,

                            riskPercent,

                            stockEntry,

                            stockStop,

                            optionPremium:
                                optionEntry,

                            optionDelta:
                                optionDelta || 0,

                            direction,

                            maxPremiumRisk:
                                false

                        });


                if (
                    riskResult.valid
                ) {

                    positionSize =
                        riskResult.contracts;


                    positionValue =
                        riskResult.totalPremiumExposure;

                }

                else {

                    /*
                       Do not kill the entire plan.

                       The trader may still want
                       to map the trade manually.
                    */

                    positionSize = 0;

                    positionValue = 0;

                }

            }

        }


        /* =============================================
           BUILD AUTOMATIC R-MULTIPLE LADDER
        ============================================== */

        const stockLadder =
            window.ROLyfeLadderEngine
                .calculateLevels({

                    entry:
                        stockEntry,

                    stop:
                        stockStop,

                    direction,

                    tp1R:
                        1,

                    tp2R:
                        2,

                    tp3R:
                        3,

                    runnerR:
                        4

                });


        if (!stockLadder.valid) {

            alert(
                stockLadder.error ||
                "Unable to calculate trade ladder."
            );

            return null;

        }


        /*
           Manual targets override
           automatic ladder targets.
        */

        const stockTarget1 =
            manualTarget1 !== null
                ? manualTarget1
                : stockLadder.tp1.price;


        const stockTarget2 =
            manualTarget2 !== null
                ? manualTarget2
                : stockLadder.tp2.price;


        const stockTarget3 =
            manualTarget3 !== null
                ? manualTarget3
                : stockLadder.tp3.price;


        const runnerTarget =
            stockLadder.runner.price;


        /* =============================================
           BUILD POSITION ALLOCATION
        ============================================== */

        let allocationResult = null;


        if (
            positionSize > 0 &&
            instrument !== "crypto"
        ) {

            allocationResult =
                window.ROLyfeLadderEngine
                    .calculateAllocation({

                        positionSize

                    });

        }


        /*
           Crypto can be fractional.

           Use percentage quantities.
        */

        else if (
            positionSize > 0 &&
            instrument === "crypto"
        ) {

            allocationResult = {

                valid:
                    true,

                positionSize,

                allocation:
                    window.ROLyfeLadderEngine
                        .defaultAllocation,

                tp1:
                    positionSize * 0.40,

                tp2:
                    positionSize * 0.30,

                tp3:
                    positionSize * 0.20,

                runner:
                    positionSize * 0.10

            };

        }


        /* =============================================
           CALCULATE STOCK TARGET RESULTS
        ============================================== */

        const stockResult1 =
            this.calculateStockTargetResult({

                entry:
                    stockEntry,

                stop:
                    stockStop,

                target:
                    stockTarget1,

                direction,

                quantity:
                    allocationResult
                        ? allocationResult.tp1
                        : 0

            });


        const stockResult2 =
            this.calculateStockTargetResult({

                entry:
                    stockEntry,

                stop:
                    stockStop,

                target:
                    stockTarget2,

                direction,

                quantity:
                    allocationResult
                        ? allocationResult.tp2
                        : 0

            });


        const stockResult3 =
            this.calculateStockTargetResult({

                entry:
                    stockEntry,

                stop:
                    stockStop,

                target:
                    stockTarget3,

                direction,

                quantity:
                    allocationResult
                        ? allocationResult.tp3
                        : 0

            });


        const runnerResult =
            this.calculateStockTargetResult({

                entry:
                    stockEntry,

                stop:
                    stockStop,

                target:
                    runnerTarget,

                direction,

                quantity:
                    allocationResult
                        ? allocationResult.runner
                        : 0

            });


        /* =============================================
           CALCULATE RISK / REWARD
        ============================================== */

        const riskReward1 =
            window.ROLyfeRiskEngine
                .calculateRiskReward(

                    stockEntry,
                    stockStop,
                    stockTarget1

                );


        const riskReward2 =
            window.ROLyfeRiskEngine
                .calculateRiskReward(

                    stockEntry,
                    stockStop,
                    stockTarget2

                );


        const riskReward3 =
            window.ROLyfeRiskEngine
                .calculateRiskReward(

                    stockEntry,
                    stockStop,
                    stockTarget3

                );


        /* =============================================
           OPTION INFORMATION
        ============================================== */

        const optionContractCost =
            optionEntry !== null &&
            optionEntry > 0

                ? optionEntry * 100

                : null;


        /*
           OPTION LADDER

           Allocation is based on
           number of contracts.

           Stock targets are still used
           as the structural trade map.
        */

        let optionLadder = null;


        if (
            instrument === "option" &&
            positionSize > 0
        ) {

            optionLadder =
                window.ROLyfeLadderEngine
                    .buildOptionLadder({

                        stockEntry,

                        stockStop,

                        contracts:
                            positionSize,

                        direction

                    });

        }


        /*
           Option target calculations.

           These use manually entered
           option premium targets.
        */

        const optionResult1 =
            this.calculateOptionTargetResult({

                optionEntry,

                optionTarget:
                    optionTarget1,

                contracts:
                    optionLadder
                        ? optionLadder.allocation.tp1
                        : 0

            });


        const optionResult2 =
            this.calculateOptionTargetResult({

                optionEntry,

                optionTarget:
                    optionTarget2,

                contracts:
                    optionLadder
                        ? optionLadder.allocation.tp2
                        : 0

            });


        const optionResult3 =
            this.calculateOptionTargetResult({

                optionEntry,

                optionTarget:
                    optionTarget3,

                contracts:
                    optionLadder
                        ? optionLadder.allocation.tp3
                        : 0

            });


        /* =============================================
           EXPECTED LADDER PROFIT

           Theoretical estimate if every
           ladder target is reached.
        ============================================== */

        const estimatedLadderProfit = [

            stockResult1,

            stockResult2,

            stockResult3,

            runnerResult

        ]
            .reduce(

                (total, result) =>

                    total +

                    (
                        result &&
                        Number.isFinite(
                            Number(
                                result.estimatedProfit
                            )
                        )

                            ? Number(
                                result.estimatedProfit
                            )

                            : 0
                    ),

                0

            );


        /* =============================================
           TRADE PROBABILITY
        ============================================== */

        const probabilityResult =
            this.calculateProbabilityResult(
                probability
            );


        /* =============================================
           BREAK-EVEN / PROTECTION PLAN
        ============================================== */

        const protectionPlan =
            window.ROLyfeLadderEngine
                .calculateProtection({

                    entry:
                        stockEntry,

                    stop:
                        stockStop,

                    direction,

                    mode:
                        "breakeven"

                });


        /* =============================================
           BUILD MASTER TRADE OBJECT
        ============================================== */

        const plan = {

            /* =========================================
               IDENTIFICATION
            ========================================== */

            id:
                Date.now(),

            planId:
                Date.now(),

            date:
                new Date()
                    .toLocaleString(),

            createdAt:
                new Date()
                    .toISOString(),

            status:
                "PLANNED",


            /* =========================================
               BASIC TRADE INFORMATION
            ========================================== */

            symbol,

            instrument:
                instrumentInput,

            normalizedInstrument:
                instrument,

            direction:
                directionDisplay,

            normalizedDirection:
                direction,


            /* =========================================
               ACCOUNT / RISK
            ========================================== */

            accountSize,

            riskPercent,

            riskAmount:
                dollarRisk,

            dollarRisk,

            riskEngine:
                riskResult,


            /* =========================================
               POSITION SIZE
            ========================================== */

            positionSize,

            quantity:
                positionSize,

            shares:

                instrument === "stock"

                    ? positionSize

                    : 0,

            contracts:

                instrument === "option"

                    ? positionSize

                    : 0,

            positionValue,

            riskPerUnit,


            /* =========================================
               PROBABILITY / VOLATILITY
            ========================================== */

            probability,

            probabilityResult,

            impliedVolatility,


            /* =========================================
               STOCK MAP
            ========================================== */

            stockEntry,

            stockStop,

            stockRiskPerShare:
                riskPerUnit,

            stockTarget1,

            stockTarget2,

            stockTarget3,

            runnerTarget,

            stockResult1,

            stockResult2,

            stockResult3,

            runnerResult,


            /* =========================================
               RISK / REWARD
            ========================================== */

            riskReward1,

            riskReward2,

            riskReward3,


            /* =========================================
               STOCK LADDER STRUCTURE
            ========================================== */

            ladderLevels:
                stockLadder,

            allocation:
                allocationResult,

            estimatedLadderProfit,


            /* =========================================
               OPTION EXECUTION
            ========================================== */

            optionType,

            strike,

            expiration:
                expiration ||
                "Not Selected",

            optionEntry,

            optionDelta,

            optionContractCost,

            optionTarget1,

            optionTarget2,

            optionTarget3,

            optionResult1,

            optionResult2,

            optionResult3,

            optionLadder,


            /* =========================================
               PROTECTION
            ========================================== */

            protectionPlan,


            /* =========================================
               LADDER PERCENTAGES

               Backward compatible structure.
            ========================================== */

            ladder: {

                target1Percent:
                    40,

                target2Percent:
                    30,

                target3Percent:
                    20,

                runnerPercent:
                    10,

                tp1Quantity:
                    allocationResult
                        ? allocationResult.tp1
                        : 0,

                tp2Quantity:
                    allocationResult
                        ? allocationResult.tp2
                        : 0,

                tp3Quantity:
                    allocationResult
                        ? allocationResult.tp3
                        : 0,

                runnerQuantity:
                    allocationResult
                        ? allocationResult.runner
                        : 0

            }


        };


        /* =============================================
           BACKWARD COMPATIBILITY

           Journal.js currently expects:
           entry
           stop
           target1
           target2
           target3
           riskPerUnit
        ============================================== */

        plan.entry =
            stockEntry;


        plan.stop =
            stockStop;


        plan.target1 =
            stockTarget1;


        plan.target2 =
            stockTarget2;


        plan.target3 =
            stockTarget3;


        plan.riskPerUnit =
            riskPerUnit;


        /* =============================================
           SAVE CURRENT PLAN TO MEMORY
        ============================================== */

        window.currentTradePlan =
            plan;


        /* =============================================
           DISPLAY PLAN
        ============================================== */

        this.displayPlan(
            plan
        );


        console.log(
            "🎯 RO'LYFE MASTER TRADE PLAN CREATED",
            plan
        );


        return plan;

    },


    /* =====================================================
       DISPLAY COMPLETE TRADE PLAN
    ===================================================== */

    displayPlan(plan) {

        const output =
            document.getElementById(
                "tradePlanOutput"
            );


        if (!output) {
            return;
        }


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
                            Move:
                            ${this.formatMoney(
                                result.result
                            )}
                        </span>

                        <span>
                            ROI:
                            ${this.formatPercent(
                                result.roi
                            )}
                        </span>

                        <span>
                            R:
                            ${this.formatNumber(
                                result.rMultiple
                            )}R
                        </span>

                        <span>
                            Est. Profit:
                            ${this.formatMoney(
                                result.estimatedProfit
                            )}
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
                            Contracts:
                            ${result.contracts}
                        </span>

                        <span>
                            Profit / Contract:
                            ${this.formatMoney(
                                result.profitPerContract
                            )}
                        </span>

                        <span>
                            Total:
                            ${this.formatMoney(
                                result.estimatedTotalProfit
                            )}
                        </span>

                        <span>
                            ROI:
                            ${this.formatPercent(
                                result.roi
                            )}
                        </span>

                    </div>

                `;

            };


        const positionLabel =

            plan.normalizedInstrument === "option"

                ? "Contracts"

                : plan.normalizedInstrument === "crypto"

                    ? "Quantity"

                    : "Shares";


        output.innerHTML = `

            <div class="trade-plan-card">

                <h3>
                    🎯 RO'LYFE MASTER TRADE PLAN
                </h3>


                <div class="plan-status">

                    ${plan.status}

                </div>


                <!-- =============================
                     TRADE INFORMATION
                ============================== -->

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
                        ${this.formatMoney(
                            plan.accountSize
                        )}
                    </p>

                    <p>
                        <strong>Risk:</strong>
                        ${this.formatPercent(
                            plan.riskPercent
                        )}
                    </p>

                    <p>
                        <strong>Risk Budget:</strong>
                        ${this.formatMoney(
                            plan.riskAmount
                        )}
                    </p>

                </div>


                <!-- =============================
                     POSITION SIZE
                ============================== -->

                <div class="plan-section">

                    <h4>
                        📦 POSITION SIZE
                    </h4>

                    <p>
                        <strong>${positionLabel}:</strong>
                        ${this.formatNumber(
                            plan.positionSize,
                            plan.normalizedInstrument === "crypto"
                                ? 6
                                : 0
                        )}
                    </p>

                    <p>
                        <strong>Position Value:</strong>
                        ${this.formatMoney(
                            plan.positionValue
                        )}
                    </p>

                    <p>
                        <strong>Risk Per Unit:</strong>
                        ${this.formatMoney(
                            plan.riskPerUnit
                        )}
                    </p>

                </div>


                <!-- =============================
                     PROBABILITY
                ============================== -->

                <div class="plan-section">

                    <h4>
                        🧠 TRADE INTELLIGENCE
                    </h4>

                    <p>
                        <strong>Probability:</strong>
                        ${this.formatPercent(
                            plan.probability
                        )}
                    </p>

                    <p>
                        <strong>Signal:</strong>
                        ${plan.probabilityResult}
                    </p>

                    <p>
                        <strong>Implied Volatility:</strong>
                        ${this.formatPercent(
                            plan.impliedVolatility
                        )}
                    </p>

                </div>


                <!-- =============================
                     STOCK MAP
                ============================== -->

                <div class="plan-section stock-plan">

                    <h4>
                        📈 STOCK MAP
                    </h4>

                    <p>
                        <strong>Entry:</strong>
                        ${this.formatPrice(
                            plan.stockEntry
                        )}
                    </p>

                    <p>
                        <strong>Stop:</strong>
                        ${this.formatPrice(
                            plan.stockStop
                        )}
                    </p>

                    <p>
                        <strong>1R Risk:</strong>
                        ${this.formatMoney(
                            plan.riskPerUnit
                        )}
                    </p>


                    <hr>


                    <div class="target-result">

                        <strong>
                            🎯 TP1 — 1R

                            ${this.formatPrice(
                                plan.stockTarget1
                            )}
                        </strong>

                        ${displayStockResult(
                            plan.stockResult1
                        )}

                        <small>
                            Sell 40%
                            ${
                                plan.allocation
                                    ? `(${plan.allocation.tp1})`
                                    : ""
                            }
                        </small>

                    </div>


                    <div class="target-result">

                        <strong>
                            🎯 TP2 — 2R

                            ${this.formatPrice(
                                plan.stockTarget2
                            )}
                        </strong>

                        ${displayStockResult(
                            plan.stockResult2
                        )}

                        <small>
                            Sell 30%
                            ${
                                plan.allocation
                                    ? `(${plan.allocation.tp2})`
                                    : ""
                            }
                        </small>

                    </div>


                    <div class="target-result">

                        <strong>
                            🎯 TP3 — 3R

                            ${this.formatPrice(
                                plan.stockTarget3
                            )}
                        </strong>

                        ${displayStockResult(
                            plan.stockResult3
                        )}

                        <small>
                            Sell 20%
                            ${
                                plan.allocation
                                    ? `(${plan.allocation.tp3})`
                                    : ""
                            }
                        </small>

                    </div>


                    <div class="runner-box">

                        🏃 RUNNER — 4R

                        <br>

                        Target:
                        ${this.formatPrice(
                            plan.runnerTarget
                        )}

                        <br>

                        ${
                            plan.allocation
                                ? `Quantity: ${plan.allocation.runner}`
                                : ""
                        }

                    </div>

                </div>


                <!-- =============================
                     RISK / REWARD
                ============================== -->

                <div class="plan-section">

                    <h4>
                        ⚖️ RISK / REWARD
                    </h4>

                    <p>
                        <strong>TP1:</strong>
                        ${
                            plan.riskReward1 !== null
                                ? this.formatNumber(
                                    plan.riskReward1
                                ) + " : 1"
                                : "Not Set"
                        }
                    </p>

                    <p>
                        <strong>TP2:</strong>
                        ${
                            plan.riskReward2 !== null
                                ? this.formatNumber(
                                    plan.riskReward2
                                ) + " : 1"
                                : "Not Set"
                        }
                    </p>

                    <p>
                        <strong>TP3:</strong>
                        ${
                            plan.riskReward3 !== null
                                ? this.formatNumber(
                                    plan.riskReward3
                                ) + " : 1"
                                : "Not Set"
                        }
                    </p>

                    <p>
                        <strong>Full Ladder Estimate:</strong>
                        ${this.formatMoney(
                            plan.estimatedLadderProfit
                        )}
                    </p>

                </div>


                <!-- =============================
                     OPTION EXECUTION
                ============================== -->

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
                                ? this.formatPrice(
                                    plan.strike
                                )
                                : "Not Set"
                        }
                    </p>

                    <p>
                        <strong>Expiration:</strong>
                        ${plan.expiration}
                    </p>

                    <p>
                        <strong>Premium Entry:</strong>
                        ${this.formatMoney(
                            plan.optionEntry
                        )}
                    </p>

                    <p>
                        <strong>Delta:</strong>
                        ${
                            plan.optionDelta
                                ? this.formatNumber(
                                    plan.optionDelta,
                                    2
                                )
                                : "Not Set"
                        }
                    </p>

                    <p>
                        <strong>Contract Cost:</strong>
                        ${this.formatMoney(
                            plan.optionContractCost
                        )}
                    </p>


                    <hr>


                    <div class="target-result">

                        <strong>
                            Option TP1:
                            ${this.formatMoney(
                                plan.optionTarget1
                            )}
                        </strong>

                        ${displayOptionResult(
                            plan.optionResult1
                        )}

                    </div>


                    <div class="target-result">

                        <strong>
                            Option TP2:
                            ${this.formatMoney(
                                plan.optionTarget2
                            )}
                        </strong>

                        ${displayOptionResult(
                            plan.optionResult2
                        )}

                    </div>


                    <div class="target-result">

                        <strong>
                            Option TP3:
                            ${this.formatMoney(
                                plan.optionTarget3
                            )}
                        </strong>

                        ${displayOptionResult(
                            plan.optionResult3
                        )}

                    </div>

                </div>


                <!-- =============================
                     TRADE PROTECTION
                ============================== -->

                <div class="plan-section">

                    <h4>
                        🛡️ TRADE PROTECTION
                    </h4>

                    <p>
                        <strong>After TP1:</strong>
                        Move Stop to Break-Even
                    </p>

                    <p>
                        <strong>Protected Stop:</strong>
                        ${
                            plan.protectionPlan &&
                            plan.protectionPlan.valid

                                ? this.formatPrice(
                                    plan.protectionPlan
                                        .protectedStop
                                )

                                : "Not Set"
                        }
                    </p>

                </div>


                <!-- =============================
                     PLAN DATE
                ============================== -->

                <p class="plan-date">

                    Created:
                    ${plan.date}

                </p>


                <!-- =============================
                     ACTIONS
                ============================== -->

                <div class="trade-plan-actions">

                    <button
                        onclick="TradePlanner.savePlan()"
                    >
                        💾 SAVE PLAN
                    </button>


                    <button
                        onclick="TradePlanner.addToJournal()"
                    >
                        📓 ADD TO JOURNAL
                    </button>

                </div>

            </div>

        `;

    },


    /* =====================================================
       SAVE PLAN

       Prevent duplicate saves of the same plan ID.
    ===================================================== */

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
            this.loadPlans();


        const alreadySaved =
            plans.some(

                plan =>
                    plan.planId ===
                    window.currentTradePlan.planId

            );


        if (alreadySaved) {

            alert(
                "This trade plan is already saved."
            );

            return;

        }


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


    /* =====================================================
       ADD CURRENT PLAN TO JOURNAL
    ===================================================== */

    addToJournal() {

        if (
            !window.currentTradePlan
        ) {

            alert(
                "Create a Trade Plan first."
            );

            return;

        }


        if (
            !window.TradeJournal ||
            typeof window.TradeJournal.addTrade !==
            "function"
        ) {

            alert(
                "Trade Journal is not loaded."
            );

            console.error(
                "TradeJournal.addTrade() not available."
            );

            return;

        }


        window.TradeJournal.addTrade();

    },


    /* =====================================================
       LOAD SAVED PLANS
    ===================================================== */

    loadPlans() {

        try {

            return JSON.parse(

                localStorage.getItem(
                    "roLyfeTradePlans"
                ) || "[]"

            );

        }

        catch (error) {

            console.error(
                "Error loading trade plans:",
                error
            );

            return [];

        }

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

                    plan.id !== id &&
                    plan.planId !== id

            );


        localStorage.setItem(

            "roLyfeTradePlans",

            JSON.stringify(
                plans
            )

        );

    },


    /* =====================================================
       CLEAR ALL SAVED PLANS
    ===================================================== */

    clearPlans() {

        const confirmed =
            confirm(
                "Delete all saved RO'Lyfe Trade Plans?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            "roLyfeTradePlans"
        );


        alert(
            "All saved trade plans cleared."
        );

    }

};


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.TradePlanner =
    TradePlanner;


/* =========================================================
   SYSTEM READY MESSAGE
========================================================= */

console.log(
    "🎯 RO'LYFE MASTER TRADE PLANNER ENGINE ONLINE"
);
