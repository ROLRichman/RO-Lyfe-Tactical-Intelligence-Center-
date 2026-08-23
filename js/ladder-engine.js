/* =========================================================
   RO'LYFE RTIC™ — ADVANCED TRADE LADDER ENGINE
   js/ladder-engine.js

   PURPOSE:

   STOCK MAP → RISK → POSITION SIZE → ENTRY COST →
   AFFORDABILITY → PROFIT LADDER → CAPITAL PROTECTION

   Trade Smart.
   Stay Disciplined.
   Protect Your Capital.
   Trust the Process.

   =========================================================

   INTELLIGENT POSITION ALLOCATION

   RO'Lyfe automatically adapts the ladder to the size
   of the position.

   1 Contract:
   → Hold entire position as Runner

   2 Contracts:
   → TP1: 1
   → Runner: 1

   3 Contracts:
   → TP1: 1
   → TP2: 1
   → Runner: 1

   4 Contracts:
   → TP1: 1
   → TP2: 1
   → TP3: 1
   → Runner: 1

   5+ Contracts:
   → Uses percentage allocation:
      40% TP1
      30% TP2
      20% TP3
      10% Runner

   ========================================================= */

const ROLyfeLadderEngine = {

    /* =====================================================
       DEFAULT ALLOCATION
    ===================================================== */

    defaultAllocation: {

        tp1: 40,

        tp2: 30,

        tp3: 20,

        runner: 10

    },


    /* =====================================================
       NORMALIZE DIRECTION
    ===================================================== */

    normalizeDirection(direction = "long") {

        return String(direction)
            .toLowerCase() === "short"
                ? "short"
                : "long";

    },


    /* =====================================================
       CALCULATE R-MULTIPLE LEVELS

       LONG:

       Risk = Entry - Stop

       TP1 = Entry + 1R
       TP2 = Entry + 2R
       TP3 = Entry + 3R
       Runner = Entry + 4R

       SHORT:

       Risk = Stop - Entry

       TP1 = Entry - 1R
       TP2 = Entry - 2R
       TP3 = Entry - 3R
       Runner = Entry - 4R
    ===================================================== */

    calculateLevels({

        entry,

        stop,

        direction = "long",

        tp1R = 1,

        tp2R = 2,

        tp3R = 3,

        runnerR = 4

    }) {


        entry =
            Number(entry);


        stop =
            Number(stop);


        direction =
            this.normalizeDirection(
                direction
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

            !Number.isFinite(entry) ||
            !Number.isFinite(stop) ||
            entry <= 0 ||
            stop <= 0 ||
            riskPerUnit <= 0

        ) {

            return {

                valid: false,

                error:
                    "Check entry, stop, and direction."

            };

        }


        const calculateTarget =
            (rMultiple) => {

                if (direction === "short") {

                    return (
                        entry -
                        (
                            riskPerUnit *
                            rMultiple
                        )
                    );

                }


                return (

                    entry +
                    (
                        riskPerUnit *
                        rMultiple
                    )

                );

            };


        return {

            valid: true,

            entry,

            stop,

            direction,

            riskPerUnit,


            tp1: {

                r: Number(tp1R),

                price:
                    calculateTarget(tp1R)

            },


            tp2: {

                r: Number(tp2R),

                price:
                    calculateTarget(tp2R)

            },


            tp3: {

                r: Number(tp3R),

                price:
                    calculateTarget(tp3R)

            },


            runner: {

                r: Number(runnerR),

                price:
                    calculateTarget(runnerR)

            }

        };

    },


    /* =====================================================
       INTELLIGENT ALLOCATION ENGINE

       IMPORTANT:

       Small positions cannot realistically be divided
       using simple percentages.

       This function creates a practical ladder for
       1 contract, 2 contracts, 3 contracts, etc.
    ===================================================== */

    calculateAllocation({

        positionSize,

        allocation = null

    }) {


        positionSize =
            Math.floor(
                Number(positionSize)
            );


        if (

            !Number.isFinite(
                positionSize
            ) ||

            positionSize < 1

        ) {

            return {

                valid: false,

                error:
                    "Position size must be at least 1."

            };

        }


        const alloc =
            allocation ||
            this.defaultAllocation;


        let tp1 = 0;

        let tp2 = 0;

        let tp3 = 0;

        let runner = 0;

        let mode =
            "PERCENTAGE_ALLOCATION";


        /* =============================================
           1 UNIT

           Cannot split.

           Hold entire position.
        ============================================= */

        if (positionSize === 1) {

            runner = 1;

            mode =
                "SINGLE_POSITION";

        }


        /* =============================================
           2 UNITS

           Take partial profit.

           Keep one runner.
        ============================================= */

        else if (positionSize === 2) {

            tp1 = 1;

            runner = 1;

            mode =
                "SMALL_POSITION_2";

        }


        /* =============================================
           3 UNITS
        ============================================= */

        else if (positionSize === 3) {

            tp1 = 1;

            tp2 = 1;

            runner = 1;

            mode =
                "SMALL_POSITION_3";

        }


        /* =============================================
           4 UNITS

           One at every level.
        ============================================= */

        else if (positionSize === 4) {

            tp1 = 1;

            tp2 = 1;

            tp3 = 1;

            runner = 1;

            mode =
                "SMALL_POSITION_4";

        }


        /* =============================================
           5+ UNITS

           Use percentage allocation.
        ============================================= */

        else {


            tp1 =
                Math.floor(

                    positionSize *

                    (
                        Number(alloc.tp1) /
                        100
                    )

                );


            tp2 =
                Math.floor(

                    positionSize *

                    (
                        Number(alloc.tp2) /
                        100
                    )

                );


            tp3 =
                Math.floor(

                    positionSize *

                    (
                        Number(alloc.tp3) /
                        100
                    )

                );


            /*
               Everything remaining
               becomes the runner.
            */

            runner =

                positionSize -

                tp1 -

                tp2 -

                tp3;


            /*
               Make sure TP1 receives
               at least one unit.
            */

            if (tp1 < 1) {

                tp1 = 1;

                runner =
                    positionSize -

                    tp1 -

                    tp2 -

                    tp3;

            }

        }


        return {

            valid: true,

            positionSize,

            mode,

            allocation: {

                tp1,

                tp2,

                tp3,

                runner

            },


            percentages: {

                tp1:

                    (
                        tp1 /
                        positionSize
                    ) * 100,


                tp2:

                    (
                        tp2 /
                        positionSize
                    ) * 100,


                tp3:

                    (
                        tp3 /
                        positionSize
                    ) * 100,


                runner:

                    (
                        runner /
                        positionSize
                    ) * 100

            }

        };

    },


    /* =====================================================
       CALCULATE ENTRY COST

       STOCK:

       Shares × Entry

       OPTION:

       Contracts × Premium × 100
    ===================================================== */

    calculateEntryCost({

        instrument = "stock",

        quantity,

        entryPrice

    }) {


        quantity =
            Number(quantity);


        entryPrice =
            Number(entryPrice);


        instrument =
            String(instrument)
                .toLowerCase();


        if (

            quantity <= 0 ||

            entryPrice <= 0

        ) {

            return 0;

        }


        const multiplier =

            instrument === "option"

                ? 100

                : 1;


        return (

            quantity *

            entryPrice *

            multiplier

        );

    },


    /* =====================================================
       CALCULATE AFFORDABILITY

       THIS IS THE ACCOUNT PROTECTION LAYER.

       RO'Lyfe determines:

       1. How many units the trader can afford
       2. How much cash the selected position requires
       3. Whether the trade exceeds the account
       4. Maximum affordable position

       Example:

       Account = $1,000
       Option Premium = $2.00

       Contract Cost = $200

       Maximum Cash Contracts = 5
    ===================================================== */

    calculateAffordability({

        accountBalance,

        instrument = "stock",

        entryPrice,

        requestedSize = null,

        reservePercent = 0

    }) {


        accountBalance =
            Number(accountBalance);


        entryPrice =
            Number(entryPrice);


        reservePercent =
            Number(reservePercent);


        instrument =
            String(instrument)
                .toLowerCase();


        if (

            accountBalance <= 0 ||

            entryPrice <= 0

        ) {

            return {

                valid: false,

                error:
                    "Enter a valid account balance and entry price."

            };

        }


        reservePercent =
            Math.max(

                0,

                Math.min(
                    reservePercent,
                    99
                )

            );


        const reserveAmount =

            accountBalance *

            (
                reservePercent /
                100
            );


        const availableCapital =

            accountBalance -

            reserveAmount;


        const multiplier =

            instrument === "option"

                ? 100

                : 1;


        const unitCost =

            entryPrice *

            multiplier;


        const maxAffordableUnits =

            Math.floor(

                availableCapital /

                unitCost

            );


        let requestedUnits =

            requestedSize !== null &&
            requestedSize !== undefined

                ? Math.floor(
                    Number(requestedSize)
                )

                : null;


        let requestedCost = 0;

        let exceedsAccount = false;

        let exceedsAvailableCapital = false;


        if (

            requestedUnits !== null &&

            requestedUnits > 0

        ) {

            requestedCost =

                requestedUnits *

                unitCost;


            exceedsAccount =

                requestedCost >

                accountBalance;


            exceedsAvailableCapital =

                requestedCost >

                availableCapital;

        }


        return {

            valid: true,

            instrument,

            accountBalance,

            reservePercent,

            reserveAmount,

            availableCapital,

            entryPrice,

            multiplier,

            unitCost,

            maxAffordableUnits,

            requestedUnits,

            requestedCost,

            exceedsAccount,

            exceedsAvailableCapital,

            affordable:

                requestedUnits === null

                    ? maxAffordableUnits >= 1

                    : !exceedsAvailableCapital,


            capitalRemaining:

                requestedUnits !== null

                    ? Math.max(

                        0,

                        availableCapital -

                        requestedCost

                    )

                    : availableCapital

        };

    },


    /* =====================================================
       PROFIT CALCULATOR

       STOCK / CRYPTO:

       Price Move × Quantity

       OPTION:

       Estimated Option Move × Contracts × 100

       IMPORTANT:

       Option profit requires actual option prices
       to be accurate.

       Stock-based option ladder targets are
       structural guidance, not guaranteed option
       profit prices.
    ===================================================== */

    calculateProfit({

        instrument = "stock",

        entry,

        target,

        quantity,

        direction = "long"

    }) {


        entry =
            Number(entry);


        target =
            Number(target);


        quantity =
            Number(quantity);


        direction =
            this.normalizeDirection(
                direction
            );


        if (

            !Number.isFinite(entry) ||
            !Number.isFinite(target) ||
            !Number.isFinite(quantity) ||
            quantity <= 0

        ) {

            return 0;

        }


        let priceMove;


        if (direction === "short") {

            priceMove =
                entry -
                target;

        }

        else {

            priceMove =
                target -
                entry;

        }


        const multiplier =

            String(instrument)
                .toLowerCase() === "option"

                ? 100

                : 1;


        return (

            priceMove *

            quantity *

            multiplier

        );

    },


    /* =====================================================
       CALCULATE TOTAL LADDER PROFIT

       Adds all estimated target profits.
    ===================================================== */

    calculateTotalLadderProfit(
        targets
    ) {


        if (!targets) {

            return 0;

        }


        return (

            Number(
                targets.tp1
                    ?.estimatedProfit || 0
            ) +

            Number(
                targets.tp2
                    ?.estimatedProfit || 0
            ) +

            Number(
                targets.tp3
                    ?.estimatedProfit || 0
            ) +

            Number(
                targets.runner
                    ?.estimatedProfit || 0
            )

        );

    },


    /* =====================================================
       STOCK / CRYPTO TRADE LADDER
    ===================================================== */

    buildStockLadder({

        entry,

        stop,

        positionSize,

        direction = "long",

        instrument = "stock",

        allocation = null,

        accountBalance = null

    }) {


        const levels =

            this.calculateLevels({

                entry,

                stop,

                direction

            });


        if (!levels.valid) {

            return levels;

        }


        const allocationResult =

            this.calculateAllocation({

                positionSize,

                allocation

            });


        if (!allocationResult.valid) {

            return allocationResult;

        }


        const entryCost =

            this.calculateEntryCost({

                instrument,

                quantity:
                    allocationResult.positionSize,

                entryPrice:
                    entry

            });


        const affordability =

            accountBalance

                ? this.calculateAffordability({

                    accountBalance,

                    instrument,

                    entryPrice:
                        entry,

                    requestedSize:
                        allocationResult.positionSize

                })

                : null;


        const targets = {


            tp1: {

                price:
                    levels.tp1.price,

                r:
                    levels.tp1.r,

                quantity:
                    allocationResult.allocation.tp1,

                estimatedProfit:

                    this.calculateProfit({

                        instrument,

                        entry,

                        target:
                            levels.tp1.price,

                        quantity:
                            allocationResult.allocation.tp1,

                        direction

                    })

            },


            tp2: {

                price:
                    levels.tp2.price,

                r:
                    levels.tp2.r,

                quantity:
                    allocationResult.allocation.tp2,

                estimatedProfit:

                    this.calculateProfit({

                        instrument,

                        entry,

                        target:
                            levels.tp2.price,

                        quantity:
                            allocationResult.allocation.tp2,

                        direction

                    })

            },


            tp3: {

                price:
                    levels.tp3.price,

                r:
                    levels.tp3.r,

                quantity:
                    allocationResult.allocation.tp3,

                estimatedProfit:

                    this.calculateProfit({

                        instrument,

                        entry,

                        target:
                            levels.tp3.price,

                        quantity:
                            allocationResult.allocation.tp3,

                        direction

                    })

            },


            runner: {

                price:
                    levels.runner.price,

                r:
                    levels.runner.r,

                quantity:
                    allocationResult.allocation.runner,

                estimatedProfit:

                    this.calculateProfit({

                        instrument,

                        entry,

                        target:
                            levels.runner.price,

                        quantity:
                            allocationResult.allocation.runner,

                        direction

                    })

            }

        };


        return {

            valid: true,

            instrument,

            direction,

            levels,

            allocation:
                allocationResult,

            entryCost,

            affordability,

            targets,

            estimatedTotalProfit:

                this.calculateTotalLadderProfit(
                    targets
                )

        };

    },


    /* =====================================================
       OPTION CONTRACT LADDER

       IMPORTANT:

       Stock structure determines:

       Entry
       Stop
       1R
       2R
       3R
       Runner

       The option is the execution vehicle.

       ALSO CALCULATES:

       Premium per contract
       Total entry cost
       Maximum affordable contracts
       Account warning
    ===================================================== */

    buildOptionLadder({

        stockEntry,

        stockStop,

        contracts,

        optionPremium = null,

        accountBalance = null,

        direction = "long",

        allocation = null

    }) {


        const levels =

            this.calculateLevels({

                entry:
                    stockEntry,

                stop:
                    stockStop,

                direction

            });


        if (!levels.valid) {

            return levels;

        }


        const allocationResult =

            this.calculateAllocation({

                positionSize:
                    contracts,

                allocation

            });


        if (!allocationResult.valid) {

            return allocationResult;

        }


        let contractCost = null;

        let totalEntryCost = null;

        let affordability = null;


        if (

            optionPremium !== null &&

            Number(optionPremium) > 0

        ) {

            contractCost =

                Number(optionPremium) *

                100;


            totalEntryCost =

                contractCost *

                allocationResult.positionSize;


            if (

                accountBalance !== null &&

                Number(accountBalance) > 0

            ) {

                affordability =

                    this.calculateAffordability({

                        accountBalance,

                        instrument:
                            "option",

                        entryPrice:
                            optionPremium,

                        requestedSize:
                            allocationResult.positionSize

                    });

            }

        }


        return {

            valid: true,

            instrument:
                "option",

            direction,

            stockLevels:
                levels,

            allocation:
                allocationResult,


            contracts:
                allocationResult.positionSize,


            optionPremium:
                optionPremium !== null

                    ? Number(optionPremium)

                    : null,


            contractCost,


            totalEntryCost,


            affordability,


            targets: {


                tp1: {

                    stockPrice:
                        levels.tp1.price,

                    r:
                        levels.tp1.r,

                    contracts:
                        allocationResult.allocation.tp1

                },


                tp2: {

                    stockPrice:
                        levels.tp2.price,

                    r:
                        levels.tp2.r,

                    contracts:
                        allocationResult.allocation.tp2

                },


                tp3: {

                    stockPrice:
                        levels.tp3.price,

                    r:
                        levels.tp3.r,

                    contracts:
                        allocationResult.allocation.tp3

                },


                runner: {

                    stockPrice:
                        levels.runner.price,

                    r:
                        levels.runner.r,

                    contracts:
                        allocationResult.allocation.runner

                }

            }

        };

    },


    /* =====================================================
       POSITION SIZE RECOMMENDATION

       Compares:

       Risk-Based Maximum

       vs.

       Cash-Based Maximum

       The trader should never be shown a size that
       requires more cash than the account can fund.
    ===================================================== */

    calculateSafePosition({

        riskBasedSize,

        accountBalance,

        instrument,

        entryPrice,

        reservePercent = 0

    }) {


        const affordability =

            this.calculateAffordability({

                accountBalance,

                instrument,

                entryPrice,

                reservePercent

            });


        if (!affordability.valid) {

            return affordability;

        }


        riskBasedSize =

            Math.floor(
                Number(riskBasedSize)
            );


        const maxByRisk =

            Math.max(
                0,
                riskBasedSize
            );


        const maxByCash =

            affordability.maxAffordableUnits;


        const safeSize =

            Math.min(

                maxByRisk,

                maxByCash

            );


        let limitingFactor =
            "RISK";


        if (

            maxByCash <

            maxByRisk

        ) {

            limitingFactor =
                "ACCOUNT_CAPITAL";

        }


        return {

            valid:
                safeSize >= 1,


            riskBasedSize:
                maxByRisk,


            cashBasedSize:
                maxByCash,


            safeSize,


            limitingFactor,


            affordability,


            warning:

                safeSize < 1

                    ? "Your account cannot safely fund one unit at the current settings."

                    : maxByCash < maxByRisk

                        ? "Account capital limits the position size below the risk-based maximum."

                        : null

        };

    },


    /* =====================================================
       BREAK-EVEN / PROTECTION ENGINE
    ===================================================== */

    calculateProtection({

        entry,

        stop,

        direction = "long",

        mode = "breakeven"

    }) {


        entry =
            Number(entry);


        stop =
            Number(stop);


        direction =
            this.normalizeDirection(
                direction
            );


        let risk;


        if (direction === "short") {

            risk =
                stop -
                entry;

        }

        else {

            risk =
                entry -
                stop;

        }


        if (

            !Number.isFinite(risk) ||

            risk <= 0

        ) {

            return {

                valid: false,

                error:
                    "Invalid entry and stop."

            };

        }


        let protectedStop =
            stop;


        if (mode === "breakeven") {

            protectedStop =
                entry;

        }


        else if (mode === "halfR") {

            protectedStop =

                direction === "short"

                    ? entry -
                      (
                          risk * 0.5
                      )

                    : entry +
                      (
                          risk * 0.5
                      );

        }


        else if (mode === "oneR") {

            protectedStop =

                direction === "short"

                    ? entry -
                      risk

                    : entry +
                      risk;

        }


        return {

            valid: true,

            mode,

            protectedStop,

            originalStop:
                stop,

            entry,

            riskPerUnit:
                risk

        };

    },


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    formatPrice(value) {


        const number =
            Number(value);


        if (

            !Number.isFinite(
                number
            )

        ) {

            return "—";

        }


        if (

            Math.abs(number) < 1

        ) {

            return number.toFixed(4);

        }


        if (

            Math.abs(number) < 10

        ) {

            return number.toFixed(3);

        }


        return number.toFixed(2);

    },


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    formatMoney(value) {


        const number =
            Number(value);


        if (

            !Number.isFinite(
                number
            )

        ) {

            return "$0.00";

        }


        return new Intl.NumberFormat(

            "en-US",

            {

                style:
                    "currency",

                currency:
                    "USD"

            }

        ).format(number);

    }

};


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.ROLyfeLadderEngine =
    ROLyfeLadderEngine;


/* =========================================================
   COMPATIBILITY ALIAS
========================================================= */

window.LadderEngine =
    ROLyfeLadderEngine;
