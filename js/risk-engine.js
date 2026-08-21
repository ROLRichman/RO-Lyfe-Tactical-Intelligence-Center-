/* =========================================================
   RO'LYFE RTIC™ — RISK ENGINE
   Trade Smart. Stay Disciplined.
   Protect Your Capital. Trust the Process.

   RISK MODES:

   1. STOCK MAP
      Entry → Stop → Risk → Position Size

   2. OPTION + STOCK STOP
      Stock Map → Option Delta Estimate → Contract Size

   3. OPTION PREMIUM RISK
      Buy Call / Buy Put → Premium Risk → Contract Size

   4. OPTION SPREAD
      Defined Risk Spread → Max Loss → Contract Size
========================================================= */

const ROLyfeRiskEngine = {


    /* =====================================================
       STOCK RISK
    ===================================================== */

    calculateStock({

        accountBalance,

        riskPercent,

        entry,

        stop,

        direction = "long"

    }) {


        accountBalance =
            Number(accountBalance);


        riskPercent =
            Number(riskPercent);


        entry =
            Number(entry);


        stop =
            Number(stop);


        direction =
            String(direction)
                .toLowerCase();


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        let riskPerShare;


        if (direction === "short") {

            riskPerShare =
                stop - entry;

        }

        else {

            riskPerShare =
                entry - stop;

        }


        if (

            !accountBalance ||

            !entry ||

            !stop ||

            riskPercent <= 0 ||

            riskPerShare <= 0

        ) {

            return {

                valid:
                    false,


                error:
                    "Check account size, entry, stop, direction, and risk percentage."

            };

        }


        const shares =
            Math.floor(

                dollarRisk /
                riskPerShare

            );


        const positionValue =
            shares *
            entry;


        const actualRisk =
            shares *
            riskPerShare;


        const unusedRisk =
            dollarRisk -
            actualRisk;


        return {

            valid:
                true,


            instrument:
                "stock",


            riskMode:
                "STOCK_STOP",


            accountBalance,


            riskPercent,


            dollarRisk,


            entry,


            stop,


            direction,


            riskPerShare,


            shares,


            positionValue,


            actualRisk,


            unusedRisk

        };

    },


    /* =====================================================
       CRYPTO RISK

       Same mathematics as stock,
       but fractional quantity is allowed.
    ===================================================== */

    calculateCrypto({

        accountBalance,

        riskPercent,

        entry,

        stop,

        direction = "long"

    }) {


        accountBalance =
            Number(accountBalance);


        riskPercent =
            Number(riskPercent);


        entry =
            Number(entry);


        stop =
            Number(stop);


        direction =
            String(direction)
                .toLowerCase();


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        let riskPerUnit;


        if (direction === "short") {

            riskPerUnit =
                stop - entry;

        }

        else {

            riskPerUnit =
                entry - stop;

        }


        if (

            !accountBalance ||

            !entry ||

            !stop ||

            riskPercent <= 0 ||

            riskPerUnit <= 0

        ) {

            return {

                valid:
                    false,


                error:
                    "Check account size, entry, stop, direction, and risk percentage."

            };

        }


        const quantity =
            dollarRisk /
            riskPerUnit;


        const positionValue =
            quantity *
            entry;


        return {

            valid:
                true,


            instrument:
                "crypto",


            riskMode:
                "CRYPTO_STOP",


            accountBalance,


            riskPercent,


            dollarRisk,


            entry,


            stop,


            direction,


            riskPerUnit,


            quantity,


            positionValue,


            estimatedRisk:
                dollarRisk

        };

    },


    /* =====================================================
       OPTION + STOCK STOP RISK

       The STOCK determines the invalidation.

       Example:

       AAPL Stock Entry = $100
       Stock Stop        = $98

       Option Premium    = $0.50
       Delta             = 0.50

       Estimated option loss is based on:

       Stock Move × Delta × 100

       IMPORTANT:

       This is an estimate.

       Actual option price can also be affected by:
       - Gamma
       - Theta
       - Vega
       - Implied Volatility
       - Time
       - Liquidity
    ===================================================== */

    calculateOption({

        accountBalance,

        riskPercent,

        stockEntry,

        stockStop,

        optionPremium,

        optionDelta = 0,

        direction = "long",

        maxPremiumRisk = false

    }) {


        accountBalance =
            Number(accountBalance);


        riskPercent =
            Number(riskPercent);


        stockEntry =
            Number(stockEntry);


        stockStop =
            Number(stockStop);


        optionPremium =
            Number(optionPremium);


        optionDelta =
            Math.abs(
                Number(optionDelta)
            );


        direction =
            String(direction)
                .toLowerCase();


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        let stockMoveToStop;


        if (direction === "short") {

            stockMoveToStop =
                stockStop -
                stockEntry;

        }

        else {

            stockMoveToStop =
                stockEntry -
                stockStop;

        }


        if (

            !accountBalance ||

            !stockEntry ||

            !stockStop ||

            !optionPremium ||

            riskPercent <= 0 ||

            stockMoveToStop <= 0

        ) {

            return {

                valid:
                    false,


                error:
                    "Check stock entry, stock stop, option premium, direction, and risk."

            };

        }


        /* ---------------------------------------------
           STANDARD OPTION CONTRACT COST

           1 equity option contract = 100 shares
        --------------------------------------------- */

        const contractCost =
            optionPremium *
            100;


        /* ---------------------------------------------
           ESTIMATED OPTION LOSS

           Stock Move × Delta × 100

           Never allow estimated loss
           to exceed the total premium.
        --------------------------------------------- */

        let estimatedOptionLossPerContract;


        if (optionDelta > 0) {

            estimatedOptionLossPerContract =
                stockMoveToStop *
                optionDelta *
                100;


            estimatedOptionLossPerContract =
                Math.min(

                    estimatedOptionLossPerContract,

                    contractCost

                );

        }

        else {

            /*
               No delta supplied.

               Conservative assumption:
               entire premium could be lost.
            */

            estimatedOptionLossPerContract =
                contractCost;

        }


        /* ---------------------------------------------
           CONTRACT SIZING
        --------------------------------------------- */

        const riskPerContract =
            maxPremiumRisk

                ? contractCost

                : estimatedOptionLossPerContract;


        const contracts =
            Math.floor(

                dollarRisk /
                riskPerContract

            );


        const affordable =
            contracts >= 1;


        const estimatedTotalRisk =
            contracts *
            riskPerContract;


        const totalPremiumExposure =
            contracts *
            contractCost;


        return {

            valid:
                affordable,


            instrument:
                "option",


            riskMode:

                maxPremiumRisk

                    ? "OPTION_PREMIUM_RISK"

                    : "OPTION_STOCK_STOP",


            accountBalance,


            riskPercent,


            dollarRisk,


            stockEntry,


            stockStop,


            stockMoveToStop,


            optionPremium,


            optionDelta,


            contractCost,


            estimatedOptionLossPerContract,


            riskPerContract,


            contracts,


            estimatedTotalRisk,


            totalPremiumExposure,


            maxPremiumRisk,


            error:

                affordable

                    ? null

                    : "One contract exceeds your defined risk budget."

        };

    },


    /* =====================================================
       OPTION PREMIUM ONLY RISK

       For the trader who says:

       "I'm buying the Call."
       "I'm buying the Put."
       "My maximum loss is what I paid."

       NO STOCK STOP REQUIRED.

       Example:

       Account = $1,000
       Risk % = 5%

       Risk Budget = $50

       Option Premium = $0.50

       1 Contract Cost = $50

       Maximum Contracts = 1
    ===================================================== */

    calculateOptionPremiumRisk({

        accountBalance,

        riskPercent,

        optionPremium

    }) {


        accountBalance =
            Number(accountBalance);


        riskPercent =
            Number(riskPercent);


        optionPremium =
            Number(optionPremium);


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        const contractCost =
            optionPremium *
            100;


        if (

            accountBalance <= 0 ||

            riskPercent <= 0 ||

            optionPremium <= 0

        ) {

            return {

                valid:
                    false,


                error:
                    "Enter account size, risk percentage, and option premium."

            };

        }


        const contracts =
            Math.floor(

                dollarRisk /
                contractCost

            );


        const affordable =
            contracts >= 1;


        const totalPremiumExposure =
            contracts *
            contractCost;


        return {

            valid:
                affordable,


            instrument:
                "option",


            riskMode:
                "OPTION_PREMIUM_ONLY",


            accountBalance,


            riskPercent,


            dollarRisk,


            optionPremium,


            contractCost,


            maxLossPerContract:
                contractCost,


            contracts,


            totalPremiumExposure,


            maximumLoss:
                totalPremiumExposure,


            error:

                affordable

                    ? null

                    : "One contract costs more than your defined risk budget."

        };

    },


    /* =====================================================
       OPTION SPREAD RISK

       Defined risk options spreads.

       Example:

       Buy Call  = $2.00
       Sell Call = $1.20

       Net Debit = $0.80

       Maximum Risk = $80 per spread

       OR

       Credit Spread:

       Credit Received = $1.20

       Spread Width = $5.00

       Maximum Loss:

       ($5.00 - $1.20) × 100
       = $380
    ===================================================== */

    calculateOptionSpread({

        accountBalance,

        riskPercent,

        spreadType = "debit",

        longPremium,

        shortPremium,

        spreadWidth = 0

    }) {


        accountBalance =
            Number(accountBalance);


        riskPercent =
            Number(riskPercent);


        longPremium =
            Number(longPremium);


        shortPremium =
            Number(shortPremium);


        spreadWidth =
            Number(spreadWidth);


        spreadType =
            String(spreadType)
                .toLowerCase();


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        if (

            accountBalance <= 0 ||

            riskPercent <= 0

        ) {

            return {

                valid:
                    false,


                error:
                    "Enter a valid account size and risk percentage."

            };

        }


        let netDebitOrCredit = 0;

        let maxLossPerSpread = 0;

        let maxProfitPerSpread = null;


        /* ---------------------------------------------
           DEBIT SPREAD
        --------------------------------------------- */

        if (spreadType === "debit") {

            netDebitOrCredit =
                longPremium -
                shortPremium;


            if (netDebitOrCredit <= 0) {

                return {

                    valid:
                        false,


                    error:
                        "Debit spread must have a positive net debit."

                };

            }


            maxLossPerSpread =
                netDebitOrCredit *
                100;


            if (spreadWidth > 0) {

                maxProfitPerSpread =
                    (
                        spreadWidth -
                        netDebitOrCredit
                    )
                    *
                    100;

            }

        }


        /* ---------------------------------------------
           CREDIT SPREAD
        --------------------------------------------- */

        else if (
            spreadType === "credit"
        ) {

            netDebitOrCredit =
                shortPremium -
                longPremium;


            if (

                netDebitOrCredit <= 0 ||

                spreadWidth <= 0

            ) {

                return {

                    valid:
                        false,


                    error:
                        "Credit spread requires a positive credit and spread width."

                };

            }


            maxProfitPerSpread =
                netDebitOrCredit *
                100;


            maxLossPerSpread =
                (
                    spreadWidth -
                    netDebitOrCredit
                )
                *
                100;

        }


        else {

            return {

                valid:
                    false,


                error:
                    "Spread type must be debit or credit."

            };

        }


        const spreads =
            Math.floor(

                dollarRisk /
                maxLossPerSpread

            );


        const affordable =
            spreads >= 1;


        const totalMaximumRisk =
            spreads *
            maxLossPerSpread;


        const totalMaximumProfit =

            maxProfitPerSpread !== null

                ? spreads *
                  maxProfitPerSpread

                : null;


        return {

            valid:
                affordable,


            instrument:
                "option_spread",


            riskMode:
                spreadType === "debit"

                    ? "DEBIT_SPREAD"

                    : "CREDIT_SPREAD",


            accountBalance,


            riskPercent,


            dollarRisk,


            spreadType,


            longPremium,


            shortPremium,


            spreadWidth,


            netDebitOrCredit,


            maxLossPerSpread,


            maxProfitPerSpread,


            spreads,


            totalMaximumRisk,


            totalMaximumProfit,


            error:

                affordable

                    ? null

                    : "One spread exceeds your defined risk budget."

        };

    },


    /* =====================================================
       CALCULATE ACTUAL RISK %
    ===================================================== */

    calculateRiskPercent(

        accountBalance,

        dollarRisk

    ) {


        accountBalance =
            Number(accountBalance);


        dollarRisk =
            Number(dollarRisk);


        if (

            accountBalance <= 0 ||

            dollarRisk <= 0

        ) {

            return 0;

        }


        return (

            dollarRisk /
            accountBalance

        ) * 100;

    },


    /* =====================================================
       CALCULATE STOCK ROI
    ===================================================== */

    calculateStockROI(

        entry,

        target,

        direction = "long"

    ) {


        entry =
            Number(entry);


        target =
            Number(target);


        direction =
            String(direction)
                .toLowerCase();


        if (

            entry <= 0 ||

            target <= 0

        ) {

            return null;

        }


        if (direction === "short") {

            return (

                (
                    entry -
                    target
                )
                /
                entry

            ) * 100;

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
       CALCULATE OPTION ROI
    ===================================================== */

    calculateOptionROI(

        optionEntry,

        optionTarget

    ) {


        optionEntry =
            Number(optionEntry);


        optionTarget =
            Number(optionTarget);


        if (

            optionEntry <= 0 ||

            optionTarget <= 0

        ) {

            return null;

        }


        return (

            (
                optionTarget -
                optionEntry
            )
            /
            optionEntry

        ) * 100;

    },


    /* =====================================================
       CALCULATE RISK / REWARD
    ===================================================== */

    calculateRiskReward(

        entry,

        stop,

        target

    ) {


        entry =
            Number(entry);


        stop =
            Number(stop);


        target =
            Number(target);


        const risk =
            Math.abs(
                entry -
                stop
            );


        const reward =
            Math.abs(
                target -
                entry
            );


        if (

            risk <= 0 ||

            reward <= 0

        ) {

            return null;

        }


        return reward / risk;

    },


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    formatMoney(value) {

        return new Intl.NumberFormat(

            "en-US",

            {

                style:
                    "currency",

                currency:
                    "USD"

            }

        ).format(

            Number(value) || 0

        );

    },


    /* =====================================================
       FORMAT PERCENT
    ===================================================== */

    formatPercent(value) {

        if (

            value === null ||

            value === undefined ||

            isNaN(value)

        ) {

            return "N/A";

        }


        return (

            Number(value)
                .toFixed(2)

            + "%"

        );

    }

};


/* =========================================================
   GLOBAL ALIASES

   This makes the engine available to:

   app.js
   trade-planner.js
   index.html
========================================================= */

window.ROLyfeRiskEngine =
    ROLyfeRiskEngine;


/*
   Compatibility alias.
*/

window.RiskEngine =
    ROLyfeRiskEngine;
