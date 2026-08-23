/* =========================================================
   RO'LYFE RTIC™ — ADVANCED RISK ENGINE
   Trade Smart. Stay Disciplined.
   Protect Your Capital. Trust the Process.

   =========================================================
   CORE PRINCIPLE
   =========================================================

   RO'LYFE DOES NOT JUST ANSWER:

   "How many contracts should I trade?"

   IT ALSO ANSWERS:

   1. How many contracts can I afford?
   2. How many contracts does my risk budget allow?
   3. How many contracts do I want to trade?
   4. How much will those contracts cost?
   5. Will that exceed my account?
   6. Will that exceed my risk limit?
   7. How much cash remains after entry?

   =========================================================
   RISK MODES
   =========================================================

   1. STOCK MAP
      Entry → Stop → Risk → Position Size

   2. CRYPTO MAP
      Entry → Stop → Risk → Quantity

   3. OPTION + STOCK STOP
      Stock Map → Option Risk Estimate → Contract Size

   4. OPTION PREMIUM RISK
      Premium Cost → Risk Budget → Contract Size

   5. OPTION SPREAD
      Defined Risk Spread → Max Loss → Spread Size

   6. CONTRACT AFFORDABILITY
      Account Size → Contract Cost → Maximum Affordable

========================================================= */


const ROLyfeRiskEngine = {


    /* =====================================================
       SAFE NUMBER
    ===================================================== */

    safeNumber(value, fallback = 0) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;

    },


    /* =====================================================
       CLAMP NUMBER
    ===================================================== */

    clamp(value, min, max) {

        value =
            this.safeNumber(value);

        return Math.min(
            Math.max(value, min),
            max
        );

    },


    /* =====================================================
       CONTRACT AFFORDABILITY ENGINE
    =====================================================

       THIS IS THE NEW CORE FEATURE.

       Example:

       Account:
       $1,000

       Option Premium:
       $2.00

       Contract Cost:
       $2.00 × 100
       =
       $200

       Maximum Affordable:
       $1,000 ÷ $200
       =
       5 Contracts

       If user wants:
       10 Contracts

       RO'LYFE warns:

       ❌ You need $2,000
       ❌ Your account only has $1,000

    ===================================================== */

    calculateContractAffordability({

        accountBalance,

        optionPremium,

        desiredContracts = 0,

        capitalAllocationPercent = 100,

        reserveCashPercent = 0

    }) {


        accountBalance =
            this.safeNumber(accountBalance);


        optionPremium =
            this.safeNumber(optionPremium);


        desiredContracts =
            Math.floor(
                this.safeNumber(desiredContracts)
            );


        capitalAllocationPercent =
            this.clamp(
                capitalAllocationPercent,
                0,
                100
            );


        reserveCashPercent =
            this.clamp(
                reserveCashPercent,
                0,
                100
            );


        if (
            accountBalance <= 0
        ) {

            return {

                valid:
                    false,

                error:
                    "Enter a valid account balance."

            };

        }


        if (
            optionPremium <= 0
        ) {

            return {

                valid:
                    false,

                error:
                    "Enter a valid option premium."

            };

        }


        /* ---------------------------------------------
           STANDARD EQUITY OPTION MULTIPLIER
        --------------------------------------------- */

        const contractMultiplier =
            100;


        /* ---------------------------------------------
           COST OF ONE CONTRACT
        --------------------------------------------- */

        const contractCost =
            optionPremium *
            contractMultiplier;


        /* ---------------------------------------------
           CAPITAL AVAILABLE FOR TRADING

           Example:

           Account:
           $1,000

           Capital Allocation:
           80%

           Available:
           $800
        --------------------------------------------- */

        const grossTradingCapital =
            accountBalance *
            (
                capitalAllocationPercent / 100
            );


        /* ---------------------------------------------
           CASH RESERVE

           Example:

           Available Capital:
           $800

           Reserve:
           10%

           Reserve Amount:
           $80

           Usable Capital:
           $720
        --------------------------------------------- */

        const reserveAmount =
            grossTradingCapital *
            (
                reserveCashPercent / 100
            );


        const usableTradingCapital =
            Math.max(

                0,

                grossTradingCapital -
                reserveAmount

            );


        /* ---------------------------------------------
           MAXIMUM AFFORDABLE CONTRACTS
        --------------------------------------------- */

        const maximumAffordableContracts =
            Math.floor(

                usableTradingCapital /
                contractCost

            );


        /* ---------------------------------------------
           COST OF DESIRED CONTRACTS
        --------------------------------------------- */

        const desiredContractCost =
            desiredContracts *
            contractCost;


        /* ---------------------------------------------
           ACCOUNT CASH REMAINING
        --------------------------------------------- */

        const remainingAccountCash =
            accountBalance -
            desiredContractCost;


        /* ---------------------------------------------
           USABLE TRADING CASH REMAINING
        --------------------------------------------- */

        const remainingTradingCapital =
            usableTradingCapital -
            desiredContractCost;


        /* ---------------------------------------------
           AFFORDABILITY STATUS
        --------------------------------------------- */

        let affordabilityStatus =
            "NO_SELECTION";


        let affordabilityLevel =
            "neutral";


        let warning =
            null;


        if (
            desiredContracts > 0
        ) {


            if (
                desiredContracts >
                maximumAffordableContracts
            ) {

                affordabilityStatus =
                    "EXCEEDS_ACCOUNT_LIMIT";


                affordabilityLevel =
                    "danger";


                const shortage =
                    desiredContractCost -
                    usableTradingCapital;


                warning =
                    `⚠️ CONTRACT LIMIT EXCEEDED: ` +
                    `You want ${desiredContracts.toLocaleString()} contract(s), ` +
                    `which would cost ${this.formatMoney(desiredContractCost)}. ` +
                    `Your available trading capital supports only ` +
                    `${maximumAffordableContracts.toLocaleString()} contract(s). ` +
                    `Additional capital needed: ${this.formatMoney(shortage)}.`;

            }


            else if (
                desiredContracts ===
                maximumAffordableContracts
            ) {

                affordabilityStatus =
                    "MAXIMUM_CAPITAL_USED";


                affordabilityLevel =
                    "warning";


                warning =
                    `⚠️ MAXIMUM CAPITAL DEPLOYED: ` +
                    `You are using nearly all of your available trading capital. ` +
                    `RO'LYFE recommends leaving a capital cushion.`;

            }


            else {

                affordabilityStatus =
                    "AFFORDABLE";


                affordabilityLevel =
                    "safe";


                warning =
                    `🟢 AFFORDABLE: ` +
                    `${desiredContracts.toLocaleString()} contract(s) fit within your available trading capital.`;

            }

        }


        return {

            valid:
                maximumAffordableContracts >= 1,


            instrument:
                "option",


            contractMultiplier,


            accountBalance,


            optionPremium,


            contractCost,


            capitalAllocationPercent,


            reserveCashPercent,


            grossTradingCapital,


            reserveAmount,


            usableTradingCapital,


            maximumAffordableContracts,


            desiredContracts,


            desiredContractCost,


            remainingAccountCash,


            remainingTradingCapital,


            affordabilityStatus,


            affordabilityLevel,


            warning,


            error:

                maximumAffordableContracts >= 1

                    ? null

                    : `Your available trading capital is not enough to purchase one contract at ${this.formatMoney(contractCost)}.`

        };

    },


    /* =====================================================
       POSITION LIMIT COMPARISON
    =====================================================

       THIS COMPARES THREE NUMBERS:

       1. RISK LIMIT
       2. ACCOUNT AFFORDABILITY LIMIT
       3. USER DESIRED CONTRACTS

       Example:

       Risk Allows:
       5 Contracts

       Account Can Afford:
       20 Contracts

       User Wants:
       10 Contracts

       Result:

       ⚠️ AFFORDABLE BUT EXCEEDS RISK LIMIT

    ===================================================== */

    compareContractLimits({

        riskAllowedContracts = 0,

        affordableContracts = 0,

        desiredContracts = 0,

        contractCost = 0,

        accountBalance = 0

    }) {


        riskAllowedContracts =
            Math.max(
                0,
                Math.floor(
                    this.safeNumber(
                        riskAllowedContracts
                    )
                )
            );


        affordableContracts =
            Math.max(
                0,
                Math.floor(
                    this.safeNumber(
                        affordableContracts
                    )
                )
            );


        desiredContracts =
            Math.max(
                0,
                Math.floor(
                    this.safeNumber(
                        desiredContracts
                    )
                )
            );


        contractCost =
            this.safeNumber(
                contractCost
            );


        accountBalance =
            this.safeNumber(
                accountBalance
            );


        const recommendedContracts =
            Math.min(

                riskAllowedContracts,

                affordableContracts

            );


        const desiredPositionCost =
            desiredContracts *
            contractCost;


        const exceedsRisk =
            desiredContracts >
            riskAllowedContracts;


        const exceedsCapital =
            desiredContracts >
            affordableContracts;


        const exceedsRecommended =
            desiredContracts >
            recommendedContracts;


        let status =
            "NO_SELECTION";


        let level =
            "neutral";


        let message =
            "Enter the number of contracts you want to trade.";


        /* ---------------------------------------------
           NO CONTRACTS SELECTED
        --------------------------------------------- */

        if (
            desiredContracts <= 0
        ) {

            status =
                "NO_SELECTION";


            level =
                "neutral";


            message =
                `RO'LYFE recommends up to ${recommendedContracts.toLocaleString()} contract(s) based on your current account and risk limits.`;

        }


        /* ---------------------------------------------
           EXCEEDS BOTH
        --------------------------------------------- */

        else if (

            exceedsRisk &&

            exceedsCapital

        ) {

            status =
                "EXCEEDS_RISK_AND_CAPITAL";


            level =
                "danger";


            message =
                `🚨 STOP: ${desiredContracts.toLocaleString()} contract(s) exceed BOTH your risk limit and your available capital. ` +
                `RO'LYFE maximum recommended position: ${recommendedContracts.toLocaleString()} contract(s).`;

        }


        /* ---------------------------------------------
           EXCEEDS CAPITAL ONLY
        --------------------------------------------- */

        else if (
            exceedsCapital
        ) {

            status =
                "EXCEEDS_CAPITAL";


            level =
                "danger";


            message =
                `🚨 INSUFFICIENT CAPITAL: ${desiredContracts.toLocaleString()} contract(s) cost ${this.formatMoney(desiredPositionCost)}, ` +
                `which exceeds your available buying power.`;

        }


        /* ---------------------------------------------
           EXCEEDS RISK ONLY
        --------------------------------------------- */

        else if (
            exceedsRisk
        ) {

            status =
                "EXCEEDS_RISK_LIMIT";


            level =
                "warning";


            message =
                `⚠️ RISK WARNING: You can afford ${desiredContracts.toLocaleString()} contract(s), ` +
                `but your current risk settings recommend no more than ${riskAllowedContracts.toLocaleString()} contract(s).`;

        }


        /* ---------------------------------------------
           EXACTLY AT RECOMMENDED LIMIT
        --------------------------------------------- */

        else if (
            desiredContracts ===
            recommendedContracts
        ) {

            status =
                "AT_RECOMMENDED_LIMIT";


            level =
                "warning";


            message =
                `🟡 LIMIT REACHED: You are trading the maximum position currently allowed by your RO'LYFE limits.`;

        }


        /* ---------------------------------------------
           SAFE
        --------------------------------------------- */

        else {

            status =
                "WITHIN_LIMITS";


            level =
                "safe";


            message =
                `🟢 POSITION WITHIN LIMITS: ${desiredContracts.toLocaleString()} contract(s) are within both your capital and risk limits.`;

        }


        return {

            valid:
                true,


            riskAllowedContracts,


            affordableContracts,


            recommendedContracts,


            desiredContracts,


            contractCost,


            desiredPositionCost,


            accountBalance,


            exceedsRisk,


            exceedsCapital,


            exceedsRecommended,


            status,


            level,


            message

        };

    },


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
            this.safeNumber(
                accountBalance
            );


        riskPercent =
            this.safeNumber(
                riskPercent
            );


        entry =
            this.safeNumber(
                entry
            );


        stop =
            this.safeNumber(
                stop
            );


        direction =
            String(direction)
                .toLowerCase();


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        let riskPerShare;


        if (
            direction === "short"
        ) {

            riskPerShare =
                stop - entry;

        }

        else {

            riskPerShare =
                entry - stop;

        }


        if (

            accountBalance <= 0 ||

            entry <= 0 ||

            stop <= 0 ||

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


        const maximumAffordableShares =
            Math.floor(
                accountBalance / entry
            );


        const recommendedShares =
            Math.min(
                shares,
                maximumAffordableShares
            );


        return {

            valid:
                recommendedShares >= 1,


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


            shares:
                recommendedShares,


            riskAllowedShares:
                shares,


            maximumAffordableShares,


            recommendedShares,


            positionValue:
                recommendedShares * entry,


            actualRisk:
                recommendedShares * riskPerShare,


            unusedRisk,


            error:

                recommendedShares >= 1

                    ? null

                    : "Your account or risk budget does not support one share."

        };

    },


    /* =====================================================
       CRYPTO RISK
    ===================================================== */

    calculateCrypto({

        accountBalance,

        riskPercent,

        entry,

        stop,

        direction = "long"

    }) {


        accountBalance =
            this.safeNumber(
                accountBalance
            );


        riskPercent =
            this.safeNumber(
                riskPercent
            );


        entry =
            this.safeNumber(
                entry
            );


        stop =
            this.safeNumber(
                stop
            );


        direction =
            String(direction)
                .toLowerCase();


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        let riskPerUnit;


        if (
            direction === "short"
        ) {

            riskPerUnit =
                stop - entry;

        }

        else {

            riskPerUnit =
                entry - stop;

        }


        if (

            accountBalance <= 0 ||

            entry <= 0 ||

            stop <= 0 ||

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
    ===================================================== */

    calculateOption({

        accountBalance,

        riskPercent,

        stockEntry,

        stockStop,

        optionPremium,

        optionDelta = 0,

        direction = "long",

        maxPremiumRisk = false,

        desiredContracts = 0,

        capitalAllocationPercent = 100,

        reserveCashPercent = 0

    }) {


        accountBalance =
            this.safeNumber(
                accountBalance
            );


        riskPercent =
            this.safeNumber(
                riskPercent
            );


        stockEntry =
            this.safeNumber(
                stockEntry
            );


        stockStop =
            this.safeNumber(
                stockStop
            );


        optionPremium =
            this.safeNumber(
                optionPremium
            );


        optionDelta =
            Math.abs(
                this.safeNumber(
                    optionDelta
                )
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


        if (
            direction === "short"
        ) {

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

            accountBalance <= 0 ||

            stockEntry <= 0 ||

            stockStop <= 0 ||

            optionPremium <= 0 ||

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


        const contractMultiplier =
            100;


        const contractCost =
            optionPremium *
            contractMultiplier;


        let estimatedOptionLossPerContract;


        if (
            optionDelta > 0
        ) {

            estimatedOptionLossPerContract =
                stockMoveToStop *
                optionDelta *
                contractMultiplier;


            estimatedOptionLossPerContract =
                Math.min(

                    estimatedOptionLossPerContract,

                    contractCost

                );

        }

        else {

            estimatedOptionLossPerContract =
                contractCost;

        }


        const riskPerContract =
            maxPremiumRisk

                ? contractCost

                : estimatedOptionLossPerContract;


        const riskAllowedContracts =
            Math.floor(

                dollarRisk /
                riskPerContract

            );


        /* ---------------------------------------------
           AFFORDABILITY ENGINE
        --------------------------------------------- */

        const affordability =
            this.calculateContractAffordability({

                accountBalance,

                optionPremium,

                desiredContracts,

                capitalAllocationPercent,

                reserveCashPercent

            });


        const affordableContracts =
            affordability.valid

                ? affordability.maximumAffordableContracts

                : 0;


        /* ---------------------------------------------
           FINAL RO'LYFE RECOMMENDATION

           The trader can NEVER be recommended
           more contracts than:

           1. Risk allows
           2. Account can afford
        --------------------------------------------- */

        const recommendedContracts =
            Math.min(

                riskAllowedContracts,

                affordableContracts

            );


        const comparison =
            this.compareContractLimits({

                riskAllowedContracts,

                affordableContracts,

                desiredContracts,

                contractCost,

                accountBalance

            });


        const selectedContracts =
            desiredContracts > 0

                ? desiredContracts

                : recommendedContracts;


        const selectedPositionCost =
            selectedContracts *
            contractCost;


        const selectedEstimatedRisk =
            selectedContracts *
            riskPerContract;


        const affordable =
            recommendedContracts >= 1;


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


            contractMultiplier,


            contractCost,


            estimatedOptionLossPerContract,


            riskPerContract,


            /* RISK LIMIT */

            riskAllowedContracts,


            /* CAPITAL LIMIT */

            affordableContracts,


            /* FINAL RO'LYFE LIMIT */

            recommendedContracts,


            /* USER CHOICE */

            desiredContracts,


            selectedContracts,


            selectedPositionCost,


            selectedEstimatedRisk,


            /* AFFORDABILITY DETAILS */

            affordability,


            /* POSITION COMPARISON */

            positionCheck:
                comparison,


            /* BACKWARD COMPATIBILITY */

            contracts:
                recommendedContracts,


            estimatedTotalRisk:
                recommendedContracts *
                riskPerContract,


            totalPremiumExposure:
                recommendedContracts *
                contractCost,


            maxPremiumRisk,


            error:

                affordable

                    ? null

                    : "Your current account and risk settings do not support one contract."

        };

    },


    /* =====================================================
       OPTION PREMIUM ONLY RISK
    ===================================================== */

    calculateOptionPremiumRisk({

        accountBalance,

        riskPercent,

        optionPremium,

        desiredContracts = 0,

        capitalAllocationPercent = 100,

        reserveCashPercent = 0

    }) {


        accountBalance =
            this.safeNumber(
                accountBalance
            );


        riskPercent =
            this.safeNumber(
                riskPercent
            );


        optionPremium =
            this.safeNumber(
                optionPremium
            );


        const dollarRisk =
            accountBalance *
            (
                riskPercent / 100
            );


        const contractMultiplier =
            100;


        const contractCost =
            optionPremium *
            contractMultiplier;


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


        const riskAllowedContracts =
            Math.floor(

                dollarRisk /
                contractCost

            );


        const affordability =
            this.calculateContractAffordability({

                accountBalance,

                optionPremium,

                desiredContracts,

                capitalAllocationPercent,

                reserveCashPercent

            });


        const affordableContracts =
            affordability.maximumAffordableContracts ||
            0;


        const recommendedContracts =
            Math.min(

                riskAllowedContracts,

                affordableContracts

            );


        const comparison =
            this.compareContractLimits({

                riskAllowedContracts,

                affordableContracts,

                desiredContracts,

                contractCost,

                accountBalance

            });


        const affordable =
            recommendedContracts >= 1;


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


            contractMultiplier,


            contractCost,


            maxLossPerContract:
                contractCost,


            riskAllowedContracts,


            affordableContracts,


            recommendedContracts,


            desiredContracts,


            affordability,


            positionCheck:
                comparison,


            /* BACKWARD COMPATIBILITY */

            contracts:
                recommendedContracts,


            totalPremiumExposure:
                recommendedContracts *
                contractCost,


            maximumLoss:
                recommendedContracts *
                contractCost,


            error:

                affordable

                    ? null

                    : "One contract exceeds your current RO'LYFE risk or capital limits."

        };

    },


    /* =====================================================
       OPTION SPREAD RISK
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
            this.safeNumber(
                accountBalance
            );


        riskPercent =
            this.safeNumber(
                riskPercent
            );


        longPremium =
            this.safeNumber(
                longPremium
            );


        shortPremium =
            this.safeNumber(
                shortPremium
            );


        spreadWidth =
            this.safeNumber(
                spreadWidth
            );


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


        let netDebitOrCredit =
            0;


        let maxLossPerSpread =
            0;


        let maxProfitPerSpread =
            null;


        if (
            spreadType === "debit"
        ) {

            netDebitOrCredit =
                longPremium -
                shortPremium;


            if (
                netDebitOrCredit <= 0
            ) {

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


            if (
                spreadWidth > 0
            ) {

                maxProfitPerSpread =
                    (
                        spreadWidth -
                        netDebitOrCredit
                    )
                    *
                    100;

            }

        }


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


        const riskAllowedSpreads =
            Math.floor(

                dollarRisk /
                maxLossPerSpread

            );


        const maximumAffordableSpreads =
            Math.floor(

                accountBalance /
                maxLossPerSpread

            );


        const recommendedSpreads =
            Math.min(

                riskAllowedSpreads,

                maximumAffordableSpreads

            );


        const affordable =
            recommendedSpreads >= 1;


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


            riskAllowedSpreads,


            maximumAffordableSpreads,


            recommendedSpreads,


            /* BACKWARD COMPATIBILITY */

            spreads:
                recommendedSpreads,


            totalMaximumRisk:
                recommendedSpreads *
                maxLossPerSpread,


            totalMaximumProfit:

                maxProfitPerSpread !== null

                    ? recommendedSpreads *
                      maxProfitPerSpread

                    : null,


            error:

                affordable

                    ? null

                    : "One spread exceeds your current RO'LYFE risk or capital limits."

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
            this.safeNumber(
                accountBalance
            );


        dollarRisk =
            this.safeNumber(
                dollarRisk
            );


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
            this.safeNumber(
                entry
            );


        target =
            this.safeNumber(
                target
            );


        direction =
            String(direction)
                .toLowerCase();


        if (

            entry <= 0 ||

            target <= 0

        ) {

            return null;

        }


        if (
            direction === "short"
        ) {

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
            this.safeNumber(
                optionEntry
            );


        optionTarget =
            this.safeNumber(
                optionTarget
            );


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
            this.safeNumber(
                entry
            );


        stop =
            this.safeNumber(
                stop
            );


        target =
            this.safeNumber(
                target
            );


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

            this.safeNumber(value)

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
   GLOBAL EXPORTS
========================================================= */

window.ROLyfeRiskEngine =
    ROLyfeRiskEngine;


window.RiskEngine =
    ROLyfeRiskEngine;


/* =========================================================
   STARTUP CHECK
========================================================= */

console.log(
    "🛡 RO'LYFE ADVANCED RISK ENGINE ONLINE"
);
