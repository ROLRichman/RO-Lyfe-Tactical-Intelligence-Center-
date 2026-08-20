/* =========================================
   RO'LYFE RTIC — TRADE LADDER ENGINE
   TP1 • TP2 • TP3 • RUNNER

   Trade Smart. Stay Disciplined.
   Protect Your Capital. Trust the Process.
========================================= */

const ROLyfeLadderEngine = {

  /* =========================================
     DEFAULT LADDER ALLOCATION

     40% → TP1
     30% → TP2
     20% → TP3
     10% → RUNNER
  ========================================= */

  defaultAllocation: {
    tp1: 40,
    tp2: 30,
    tp3: 20,
    runner: 10
  },


  /* =========================================
     CALCULATE R-MULTIPLE LADDER

     LONG:
     Risk = Entry - Stop

     TP1 = Entry + 1R
     TP2 = Entry + 2R
     TP3 = Entry + 3R
     TP4 = Entry + 4R

     SHORT:
     Risk = Stop - Entry

     TP1 = Entry - 1R
     TP2 = Entry - 2R
     TP3 = Entry - 3R
     TP4 = Entry - 4R
  ========================================= */

  calculateLevels({
    entry,
    stop,
    direction = "long",
    tp1R = 1,
    tp2R = 2,
    tp3R = 3,
    runnerR = 4
  }) {

    entry = Number(entry);
    stop = Number(stop);

    let riskPerUnit;

    if (direction === "short") {
      riskPerUnit = stop - entry;
    } else {
      riskPerUnit = entry - stop;
    }

    if (
      !entry ||
      !stop ||
      riskPerUnit <= 0
    ) {
      return {
        valid: false,
        error: "Check entry, stop, and direction."
      };
    }

    const calculateTarget = (rMultiple) => {

      if (direction === "short") {
        return entry - (riskPerUnit * rMultiple);
      }

      return entry + (riskPerUnit * rMultiple);
    };

    return {
      valid: true,

      entry,
      stop,
      direction,

      riskPerUnit,

      tp1: {
        r: tp1R,
        price: calculateTarget(tp1R)
      },

      tp2: {
        r: tp2R,
        price: calculateTarget(tp2R)
      },

      tp3: {
        r: tp3R,
        price: calculateTarget(tp3R)
      },

      runner: {
        r: runnerR,
        price: calculateTarget(runnerR)
      }
    };
  },


  /* =========================================
     ALLOCATION ENGINE

     Takes a position size and breaks it into:

     TP1
     TP2
     TP3
     RUNNER

     Works with shares or option contracts.
  ========================================= */

  calculateAllocation({
    positionSize,
    allocation = null
  }) {

    positionSize = Math.floor(Number(positionSize));

    if (
      !positionSize ||
      positionSize < 1
    ) {
      return {
        valid: false,
        error: "Position size must be at least 1."
      };
    }

    const alloc =
      allocation ||
      this.defaultAllocation;


    /*
      Calculate initial whole units.
    */

    let tp1 = Math.floor(
      positionSize *
      (Number(alloc.tp1) / 100)
    );

    let tp2 = Math.floor(
      positionSize *
      (Number(alloc.tp2) / 100)
    );

    let tp3 = Math.floor(
      positionSize *
      (Number(alloc.tp3) / 100)
    );


    /*
      Everything left becomes the runner.

      This guarantees the total always
      equals the original position size.
    */

    let runner =
      positionSize -
      tp1 -
      tp2 -
      tp3;


    return {
      valid: true,

      positionSize,

      allocation: alloc,

      tp1,
      tp2,
      tp3,
      runner
    };
  },


  /* =========================================
     PROFIT CALCULATOR

     STOCK / CRYPTO:
     Profit = Price Move × Quantity

     OPTIONS:
     Profit = Price Move × Contracts × 100

     This calculates the estimated profit
     at each target.
  ========================================= */

  calculateProfit({
    instrument = "stock",
    entry,
    target,
    quantity,
    direction = "long"
  }) {

    entry = Number(entry);
    target = Number(target);
    quantity = Number(quantity);

    if (
      !entry ||
      target === undefined ||
      target === null ||
      !quantity
    ) {
      return 0;
    }

    let priceMove;

    if (direction === "short") {
      priceMove = entry - Number(target);
    } else {
      priceMove = Number(target) - entry;
    }

    let multiplier = 1;

    if (instrument === "option") {
      multiplier = 100;
    }

    return (
      priceMove *
      quantity *
      multiplier
    );
  },


  /* =========================================
     STOCK / CRYPTO TRADE LADDER

     Uses chart entry and chart stop.
  ========================================= */

  buildStockLadder({
    entry,
    stop,
    positionSize,
    direction = "long",
    instrument = "stock",
    allocation = null
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

    return {
      valid: true,

      instrument,
      direction,

      levels,

      allocation: allocationResult,

      targets: {

        tp1: {
          price: levels.tp1.price,
          r: levels.tp1.r,
          quantity: allocationResult.tp1,
          estimatedProfit:
            this.calculateProfit({
              instrument,
              entry,
              target: levels.tp1.price,
              quantity: allocationResult.tp1,
              direction
            })
        },

        tp2: {
          price: levels.tp2.price,
          r: levels.tp2.r,
          quantity: allocationResult.tp2,
          estimatedProfit:
            this.calculateProfit({
              instrument,
              entry,
              target: levels.tp2.price,
              quantity: allocationResult.tp2,
              direction
            })
        },

        tp3: {
          price: levels.tp3.price,
          r: levels.tp3.r,
          quantity: allocationResult.tp3,
          estimatedProfit:
            this.calculateProfit({
              instrument,
              entry,
              target: levels.tp3.price,
              quantity: allocationResult.tp3,
              direction
            })
        },

        runner: {
          price: levels.runner.price,
          r: levels.runner.r,
          quantity: allocationResult.runner,
          estimatedProfit:
            this.calculateProfit({
              instrument,
              entry,
              target: levels.runner.price,
              quantity: allocationResult.runner,
              direction
            })
        }
      }
    };
  },


  /* =========================================
     OPTION LADDER

     IMPORTANT:

     The STOCK CHART determines:

     Entry
     Stop
     1R
     2R
     3R
     Runner

     The option is the VEHICLE.

     This function creates an option
     contract allocation ladder.

     Example:

     10 contracts

     TP1 → 4 contracts
     TP2 → 3 contracts
     TP3 → 2 contracts
     Runner → 1 contract
  ========================================= */

  buildOptionLadder({
    stockEntry,
    stockStop,
    contracts,
    direction = "long",
    allocation = null
  }) {

    const levels =
      this.calculateLevels({
        entry: stockEntry,
        stop: stockStop,
        direction
      });

    if (!levels.valid) {
      return levels;
    }

    const allocationResult =
      this.calculateAllocation({
        positionSize: contracts,
        allocation
      });

    if (!allocationResult.valid) {
      return allocationResult;
    }

    return {
      valid: true,

      instrument: "option",

      direction,

      stockLevels: levels,

      allocation: allocationResult,

      targets: {

        tp1: {
          stockPrice: levels.tp1.price,
          r: levels.tp1.r,
          contracts: allocationResult.tp1
        },

        tp2: {
          stockPrice: levels.tp2.price,
          r: levels.tp2.r,
          contracts: allocationResult.tp2
        },

        tp3: {
          stockPrice: levels.tp3.price,
          r: levels.tp3.r,
          contracts: allocationResult.tp3
        },

        runner: {
          stockPrice: levels.runner.price,
          r: levels.runner.r,
          contracts: allocationResult.runner
        }
      }
    };
  },


  /* =========================================
     BREAK-EVEN / PROTECTION ENGINE

     After TP1, trader may move stop:

     "none"      → Keep original stop
     "breakeven" → Move to entry
     "halfR"     → Lock 0.5R
     "oneR"      → Lock 1R

     This only calculates a suggested level.
     It does NOT place a broker order.
  ========================================= */

  calculateProtection({
    entry,
    stop,
    direction = "long",
    mode = "breakeven"
  }) {

    entry = Number(entry);
    stop = Number(stop);

    let risk;

    if (direction === "short") {
      risk = stop - entry;
    } else {
      risk = entry - stop;
    }

    if (risk <= 0) {
      return {
        valid: false,
        error: "Invalid entry and stop."
      };
    }

    let protectedStop = stop;

    if (mode === "breakeven") {
      protectedStop = entry;
    }

    if (mode === "halfR") {

      protectedStop =
        direction === "short"
          ? entry - (risk * 0.5)
          : entry + (risk * 0.5);
    }

    if (mode === "oneR") {

      protectedStop =
        direction === "short"
          ? entry - risk
          : entry + risk;
    }

    return {
      valid: true,
      mode,
      protectedStop,
      originalStop: stop
    };
  },


  /* =========================================
     FORMATTER
  ========================================= */

  formatPrice(value) {

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    /*
      More decimal precision for
      lower-priced stocks / crypto.
    */

    if (Math.abs(number) < 1) {
      return number.toFixed(4);
    }

    if (Math.abs(number) < 10) {
      return number.toFixed(3);
    }

    return number.toFixed(2);
  }

};


/* =========================================
   GLOBAL ACCESS
========================================= */

window.ROLyfeLadderEngine =
  ROLyfeLadderEngine;
