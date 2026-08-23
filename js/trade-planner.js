/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE PLANNER ENGINE — ACCOUNT-AWARE UPGRADE

   PURPOSE:

   STOCK MAP
   → OPTION EXECUTION
   → ACCOUNT BUYING POWER
   → MAX AFFORDABLE CONTRACTS
   → RISK-BASED CONTRACT LIMIT
   → USER REQUESTED CONTRACTS
   → RO'LYFE SAFETY WARNING
   → ROI / PROFIT TARGETS

   IMPORTANT CONCEPT:

   AFFORDABLE CONTRACTS
   = How many contracts the account can physically buy.

   RISK-SAFE CONTRACTS
   = How many contracts fit inside the user's risk budget.

   REQUESTED CONTRACTS
   = How many contracts the trader wants to buy.

   RO'LYFE compares all three.
========================================================= */

const TradePlanner = {


    /* =====================================================
       HELPERS
    ===================================================== */

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


    /* =====================================================
       MONEY FORMAT
    ===================================================== */

    formatMoney(value) {

        if (

            value === null ||

            value === undefined ||

            !Number.isFinite(
                Number(value)
            )

        ) {

            return "Not Set";

        }


        return new Intl.NumberFormat(

            "en-US",

            {

                style: "currency",

                currency: "USD"

            }

        ).format(
            Number(value)
        );

    },


    /* =====================================================
       PERCENT FORMAT
    ===================================================== */

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


    /* =====================================================
       WHOLE NUMBER FORMAT
    ===================================================== */

    formatNumber(value) {

        if (

            value === null ||

            value === undefined ||

            !Number.isFinite(
                Number(value)
            )

        ) {

            return "0";

        }


        return Math.floor(
            Number(value)
        ).toLocaleString();

    },


    /* =====================================================
       CREATE COMPLETE TRADE PLAN
    ===================================================== */

    createPlan() {


        /* =================================================
           BASIC INFORMATION
        ================================================= */

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


        /*
           NEW:

           Optional input.

           If the input does not exist yet,
           default to automatic sizing.

           When you later add this field
           to the interface, it will work
           automatically.

           Example:

           id="requestedContracts"
        */

        const requestedContractsInput =
            this.getNumber(
                "requestedContracts"
            );


        /* =================================================
           PROBABILITY / VOLATILITY
        ================================================= */

        const probability =
            this.getNumber(
                "probability"
            );


        const impliedVolatility =
            this.getNumber(
                "impliedVolatility"
            );


        /* =================================================
           STOCK MAP
        ================================================= */

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


        /* =================================================
           OPTION EXECUTION
        ================================================= */

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


        /* =================================================
           VALIDATION
        ================================================= */

        if (!symbol) {

            alert(
                "Please enter a Symbol."
            );

            return null;

        }


        if (

            accountSize === null ||

            accountSize <= 0

        ) {

            alert(
                "Please enter a valid Account Size."
            );

            return null;

        }


        if (

            riskPercent === null ||

            riskPercent <= 0

        ) {

            alert(
                "Please enter a valid Risk %."
            );

            return null;

        }


        /*
           Stock map validation.

           Options still use the stock map
           as the trade invalidation reference.
        */

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

            probability !== null &&

            (

                probability < 0 ||

                probability > 100

            )

        ) {

            alert(
                "Probability must be between 0 and 100."
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


        /*
           Option validation only when
           the instrument is an Option.
        */

        if (

            instrument === "Option" &&

            (

                optionEntry === null ||

                optionEntry <= 0

            )

        ) {

            alert(
                "Please enter a valid Option Premium Entry."
            );

            return null;

        }


        /* =================================================
           ACCOUNT RISK BUDGET
        ================================================= */

        const riskAmount =
            accountSize *
            (
                riskPercent / 100
            );


        /* =================================================
           STOCK RISK
        ================================================= */

        const stockRiskPerShare =
            Math.abs(

                stockEntry -

                stockStop

            );


        /* =================================================
           STOCK BUYING POWER
        ================================================= */

        const maxAffordableShares =
            Math.floor(

                accountSize /

                stockEntry

            );


        const riskBasedShares =
            stockRiskPerShare > 0

                ? Math.floor(

                    riskAmount /

                    stockRiskPerShare

                )

                : 0;


        const recommendedShares =
            Math.min(

                maxAffordableShares,

                riskBasedShares

            );


        const recommendedStockCost =
            recommendedShares *
            stockEntry;


        const recommendedStockRisk =
            recommendedShares *
            stockRiskPerShare;


        /* =================================================
           OPTION CONTRACT ECONOMICS

           OPTION PREMIUM × 100
        ================================================= */

        const optionContractCost =

            optionEntry !== null &&

            optionEntry > 0

                ? optionEntry * 100

                : 0;


        /*
           MAX AFFORDABLE CONTRACTS

           Example:

           Account = $1,000
           Premium = $2.00

           Contract Cost = $200

           $1,000 / $200 = 5 Contracts
        */

        const maxAffordableContracts =

            optionContractCost > 0

                ? Math.floor(

                    accountSize /

                    optionContractCost

                )

                : 0;


        /*
           RISK-SAFE CONTRACTS

           Conservative premium-risk model.

           Example:

           Account = $1,000
           Risk = 5%

           Risk Budget = $50

           Contract Cost = $200

           $50 / $200 = 0 Contracts

           This tells the trader:

           "You can afford 5 contracts,
           but none fit inside your
           current 5% premium-risk rule."
        */

        const riskBasedContracts =

            optionContractCost > 0

                ? Math.floor(

                    riskAmount /

                    optionContractCost

                )

                : 0;


        /*
           RECOMMENDED CONTRACTS

           The lower of:

           1. What the account can afford
           2. What the risk budget allows
        */

        const recommendedContracts =
            Math.min(

                maxAffordableContracts,

                riskBasedContracts

            );


        /*
           REQUESTED CONTRACTS

           If trader enters a number,
           use it.

           Otherwise use RO'Lyfe
           recommended size.
        */

        let requestedContracts =
            requestedContractsInput;


        if (

            requestedContracts === null ||

            requestedContracts <= 0

        ) {

            requestedContracts =
                recommendedContracts;

        }


        requestedContracts =
            Math.floor(
                requestedContracts
            );


        /* =================================================
           CONTRACT EXPOSURE
        ================================================= */

        const requestedContractCost =
            requestedContracts *
            optionContractCost;


        const remainingAccountAfterPurchase =
            accountSize -
            requestedContractCost;


        const requestedPremiumRisk =
            requestedContractCost;


        const actualRiskPercent =
            accountSize > 0

                ? (

                    requestedPremiumRisk /

                    accountSize

                ) * 100

                : 0;


        /* =================================================
           RO'LYFE CONTRACT STATUS
        ================================================= */

        let contractStatus =
            "GREEN";


        let contractWarning =
            "RO'LYFE sizing is within your account and defined risk limits.";


        let contractWarningType =
            "SAFE";


        /*
           RED:
           Trader cannot physically afford
           the requested contracts.
        */

        if (

            requestedContractCost >

            accountSize

        ) {

            contractStatus =
                "RED";


            contractWarningType =
                "ACCOUNT_LIMIT";


            contractWarning =
                `⚠️ ACCOUNT LIMIT EXCEEDED: ${this.formatNumber(
                    requestedContracts
                )} contract(s) require ${this.formatMoney(
                    requestedContractCost
                )}, but the account contains only ${this.formatMoney(
                    accountSize
                )}. Maximum affordable: ${this.formatNumber(
                    maxAffordableContracts
                )} contract(s).`;

        }


        /*
           YELLOW:
           Trader can afford the contracts
           but exceeds the defined risk rule.
        */

        else if (

            requestedContracts >

            riskBasedContracts

        ) {

            contractStatus =
                "YELLOW";


            contractWarningType =
                "RISK_LIMIT";


            contractWarning =
                `⚠️ RISK LIMIT WARNING: ${this.formatNumber(
                    requestedContracts
                )} contract(s) cost ${this.formatMoney(
                    requestedContractCost
                )}. Your current risk budget is ${this.formatMoney(
                    riskAmount
                )}. RO'Lyfe risk-based limit is ${this.formatNumber(
                    riskBasedContracts
                )} contract(s).`;

        }


        /*
           ORANGE:
           The account can technically
           afford one contract, but one
           contract itself exceeds the
           selected risk budget.
        */

        else if (

            maxAffordableContracts >= 1 &&

            riskBasedContracts === 0

        ) {

            contractStatus =
                "ORANGE";


            contractWarningType =
                "ONE_CONTRACT_EXCEEDS_RISK";


            contractWarning =
                `⚠️ ONE CONTRACT EXCEEDS YOUR RISK RULE: One contract costs ${this.formatMoney(
                    optionContractCost
                )}, while your ${this.formatPercent(
                    riskPercent
                )} risk budget is only ${this.formatMoney(
                    riskAmount
                )}.`;

        }


        /*
           RED:
           Account cannot afford one
           complete contract.
        */

        else if (

            maxAffordableContracts === 0 &&

            instrument === "Option"

        ) {

            contractStatus =
                "RED";


            contractWarningType =
                "INSUFFICIENT_ACCOUNT_SIZE";


            contractWarning =
                `⚠️ INSUFFICIENT CAPITAL: One contract costs ${this.formatMoney(
                    optionContractCost
                )}, but the account size is ${this.formatMoney(
                    accountSize
                )}.`;

        }


        /* =================================================
           CONTRACT DECISION
        ================================================= */

        const contractDecision = {

            accountSize,

            riskPercent,

            riskBudget:
                riskAmount,


            contractCost:
                optionContractCost,


            maxAffordableContracts,


            riskBasedContracts,


            recommendedContracts,


            requestedContracts,


            requestedContractCost,


            requestedPremiumRisk,


            actualRiskPercent,


            remainingAccountAfterPurchase,


            status:
                contractStatus,


            warningType:
                contractWarningType,


            warning:
                contractWarning

        };


        /* =================================================
           STOCK TARGET CALCULATOR
        ================================================= */

        const calculateStockResult =
            (target) => {

                if (

                    target === null ||

                    target === undefined

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

                }

                else {

                    result =
                        stockEntry -
                        target;

                }


                const roi =
                    (

                        result /

                        stockEntry

                    ) * 100;


                const rMultiple =

                    stockRiskPerShare > 0

                        ? (

                            result /

                            stockRiskPerShare

                        )

                        : 0;


                return {

                    target,

                    result,

                    roi,

                    rMultiple

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


        /* =================================================
           OPTION TARGET CALCULATOR

           Calculates results using the
           REQUESTED CONTRACT SIZE.
        ================================================= */

        const calculateOptionResult =
            (target) => {

                if (

                    target === null ||

                    optionEntry === null ||

                    optionEntry <= 0

                ) {

                    return null;

                }


                const profitPerOptionShare =

                    target -

                    optionEntry;


                const profitPerContract =

                    profitPerOptionShare *

                    100;


                const totalProfit =

                    profitPerContract *

                    requestedContracts;


                const roi =

                    (

                        profitPerOptionShare /

                        optionEntry

                    ) * 100;


                return {

                    target,

                    profitPerShare:
                        profitPerOptionShare,


                    profitPerContract,


                    totalProfit,


                    contracts:
                        requestedContracts,


                    roi

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


        /* =================================================
           PROBABILITY RESULT
        ================================================= */

        let probabilityResult =
            "Not Set";


        if (
            probability !== null
        ) {

            if (
                probability >= 70
            ) {

                probabilityResult =
                    "HIGH";

            }

            else if (
                probability >= 50
            ) {

                probabilityResult =
                    "MODERATE";

            }

            else {

                probabilityResult =
                    "LOW";

            }

        }


        /* =================================================
           BUILD COMPLETE PLAN
        ================================================= */

        const plan = {


            id:
                Date.now(),


            date:
                new Date()
                    .toLocaleString(),


            status:
                "PLANNED",


            /* =============================================
               BASIC
            ============================================= */

            symbol,

            instrument,

            direction,


            accountSize,

            riskPercent,

            riskAmount,


            /* =============================================
               PROBABILITY
            ============================================= */

            probability,

            probabilityResult,

            impliedVolatility,


            /* =============================================
               STOCK MAP
            ============================================= */

            stockEntry,

            stockStop,

            stockRiskPerShare,

            stockTarget1,

            stockTarget2,

            stockTarget3,

            stockResult1,

            stockResult2,

            stockResult3,


            /* =============================================
               STOCK POSITION SIZING
            ============================================= */

            maxAffordableShares,

            riskBasedShares,

            recommendedShares,

            recommendedStockCost,

            recommendedStockRisk,


            /* =============================================
               OPTION EXECUTION
            ============================================= */

            optionType,

            strike,

            expiration:
                expiration ||
                "Not Selected",


            optionEntry,

            optionContractCost,

            optionTarget1,

            optionTarget2,

            optionTarget3,

            optionResult1,

            optionResult2,

            optionResult3,


            /* =============================================
               RO'LYFE CONTRACT DECISION ENGINE
            ============================================= */

            contractDecision,


            maxAffordableContracts,

            riskBasedContracts,

            recommendedContracts,

            requestedContracts,

            requestedContractCost,

            requestedPremiumRisk,

            actualRiskPercent,

            remainingAccountAfterPurchase,

            contractStatus,

            contractWarning,

            contractWarningType,


            /* =============================================
               LADDER ALLOCATION
            ============================================= */

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


        /* =================================================
           BACKWARD COMPATIBILITY
        ================================================= */

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
           Compatibility for Risk Engine.

           These can be overwritten by
           the Risk Engine after calculation.
        */

        plan.contracts =
            requestedContracts;


        /* =================================================
           SAVE CURRENT PLAN
        ================================================= */

        window.currentTradePlan =
            plan;


        /* =================================================
           DISPLAY PLAN
        ================================================= */

        this.displayPlan(
            plan
        );


        console.log(
            "🎯 RO'LYFE ACCOUNT-AWARE TRADE PLAN:",
            plan
        );


        return plan;

    },


    /* =====================================================
       DISPLAY COMPLETE PLAN
    ===================================================== */

    displayPlan(plan) {


        const output =
            document.getElementById(
                "tradePlanOutput"
            );


        if (!output) {

            return;

        }


        const money =
            this.formatMoney;


        const percent =
            this.formatPercent;


        const number =
            this.formatNumber;


        const rMultiple =
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

                    + "R"

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

                            ${money(
                                result.result
                            )}

                        </span>


                        <span>

                            ROI:

                            ${percent(
                                result.roi
                            )}

                        </span>


                        <span>

                            R/R:

                            ${rMultiple(
                                result.rMultiple
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

                            Profit / Contract:

                            ${money(
                                result.profitPerContract
                            )}

                        </span>


                        <span>

                            Total Profit:

                            ${money(
                                result.totalProfit
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


        /*
           RO'LYFE STATUS DISPLAY
        */

        let statusEmoji =
            "🟢";


        if (
            plan.contractStatus === "YELLOW"
        ) {

            statusEmoji =
                "🟡";

        }


        if (
            plan.contractStatus === "ORANGE"
        ) {

            statusEmoji =
                "🟠";

        }


        if (
            plan.contractStatus === "RED"
        ) {

            statusEmoji =
                "🔴";

        }


        output.innerHTML = `

            <div class="trade-plan-card">


                <h3>

                    🎯 RO'LYFE TRADE PLAN

                </h3>


                <div class="plan-status">

                    ${plan.status}

                </div>


                <!-- =====================================
                     TRADE INFORMATION
                ====================================== -->

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

                        ${money(
                            plan.accountSize
                        )}

                    </p>


                    <p>

                        <strong>Risk Budget:</strong>

                        ${money(
                            plan.riskAmount
                        )}

                    </p>


                    <p>

                        <strong>Risk Rule:</strong>

                        ${percent(
                            plan.riskPercent
                        )}

                    </p>


                </div>


                <!-- =====================================
                     RO'LYFE POSITION INTELLIGENCE
                ====================================== -->

                ${plan.instrument === "Option"
                    ? `

                    <div class="plan-section contract-decision-section">


                        <h4>

                            🧮 RO'LYFE CONTRACT INTELLIGENCE™

                        </h4>


                        <p>

                            <strong>
                                Account Size:
                            </strong>

                            ${money(
                                plan.accountSize
                            )}

                        </p>


                        <p>

                            <strong>
                                Cost Per Contract:
                            </strong>

                            ${money(
                                plan.optionContractCost
                            )}

                        </p>


                        <hr>


                        <p>

                            <strong>
                                Maximum Account Can Afford:
                            </strong>

                            ${number(
                                plan.maxAffordableContracts
                            )}

                            Contract(s)

                        </p>


                        <p>

                            <strong>
                                Maximum Inside Risk Limit:
                            </strong>

                            ${number(
                                plan.riskBasedContracts
                            )}

                            Contract(s)

                        </p>


                        <p>

                            <strong>
                                RO'Lyfe Recommended:
                            </strong>

                            ${number(
                                plan.recommendedContracts
                            )}

                            Contract(s)

                        </p>


                        <hr>


                        <p>

                            <strong>
                                Trader Requested:
                            </strong>

                            ${number(
                                plan.requestedContracts
                            )}

                            Contract(s)

                        </p>


                        <p>

                            <strong>
                                Total Contract Cost:
                            </strong>

                            ${money(
                                plan.requestedContractCost
                            )}

                        </p>


                        <p>

                            <strong>
                                Account Remaining:
                            </strong>

                            ${money(
                                plan.remainingAccountAfterPurchase
                            )}

                        </p>


                        <p>

                            <strong>
                                Actual Premium Exposure:
                            </strong>

                            ${percent(
                                plan.actualRiskPercent
                            )}

                        </p>


                        <div class="contract-warning contract-${String(
                            plan.contractStatus
                        ).toLowerCase()}">


                            <strong>

                                ${statusEmoji}

                                RO'LYFE STATUS:

                                ${plan.contractStatus}

                            </strong>


                            <p>

                                ${plan.contractWarning}

                            </p>

                        </div>


                    </div>

                `
                    : ""
                }


                <!-- =====================================
                     PROBABILITY
                ====================================== -->

                <div class="plan-section">


                    <h4>

                        🧠 TRADE PROBABILITY

                    </h4>


                    <p>

                        <strong>
                            Probability:
                        </strong>

                        ${percent(
                            plan.probability
                        )}

                    </p>


                    <p>

                        <strong>
                            Result:
                        </strong>

                        ${plan.probabilityResult}

                    </p>


                    <p>

                        <strong>
                            Implied Volatility:
                        </strong>

                        ${percent(
                            plan.impliedVolatility
                        )}

                    </p>


                </div>


                <!-- =====================================
                     STOCK MAP
                ====================================== -->

                <div class="plan-section stock-plan">


                    <h4>

                        📈 STOCK MAP

                    </h4>


                    <p>

                        <strong>
                            Stock Entry:
                        </strong>

                        ${money(
                            plan.stockEntry
                        )}

                    </p>


                    <p>

                        <strong>
                            Stock Stop:
                        </strong>

                        ${money(
                            plan.stockStop
                        )}

                    </p>


                    <p>

                        <strong>
                            Risk Per Share:
                        </strong>

                        ${money(
                            plan.stockRiskPerShare
                        )}

                    </p>


                    <p>

                        <strong>
                            Max Affordable Shares:
                        </strong>

                        ${number(
                            plan.maxAffordableShares
                        )}

                    </p>


                    <p>

                        <strong>
                            RO'Lyfe Risk-Based Shares:
                        </strong>

                        ${number(
                            plan.riskBasedShares
                        )}

                    </p>


                    <p>

                        <strong>
                            Recommended Shares:
                        </strong>

                        ${number(
                            plan.recommendedShares
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


                <!-- =====================================
                     OPTION EXECUTION
                ====================================== -->

                ${plan.instrument === "Option"
                    ? `

                    <div class="plan-section option-plan">


                        <h4>

                            🎯 OPTION EXECUTION

                        </h4>


                        <p>

                            <strong>
                                Type:
                            </strong>

                            ${plan.optionType}

                        </p>


                        <p>

                            <strong>
                                Strike:
                            </strong>

                            ${
                                plan.strike !== null

                                    ? money(
                                        plan.strike
                                    )

                                    : "Not Set"
                            }

                        </p>


                        <p>

                            <strong>
                                Expiration:
                            </strong>

                            ${plan.expiration}

                        </p>


                        <p>

                            <strong>
                                Premium Entry:
                            </strong>

                            ${money(
                                plan.optionEntry
                            )}

                        </p>


                        <p>

                            <strong>
                                Contract Cost:
                            </strong>

                            ${money(
                                plan.optionContractCost
                            )}

                        </p>


                        <p>

                            <strong>
                                Contracts Used:
                            </strong>

                            ${number(
                                plan.requestedContracts
                            )}

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

                `
                    : ""
                }


                <!-- =====================================
                     PLAN DATE
                ====================================== -->

                <p class="plan-date">


                    Created:

                    ${plan.date}


                </p>


                <button
                    type="button"
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
                )

                || "[]"

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


    /* =====================================================
       LOAD PLANS
    ===================================================== */

    loadPlans() {

        return JSON.parse(

            localStorage.getItem(
                "roLyfeTradePlans"
            )

            || "[]"

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


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.TradePlanner =
    TradePlanner;
