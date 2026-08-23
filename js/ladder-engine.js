const ROLyfeLadderEngine = {

defaultAllocation: {
    tp1: 40,
    tp2: 30,
    tp3: 20,
    runner: 10
},

normalizeDirection(direction = "long") {
    return String(direction).toLowerCase() === "short"
        ? "short"
        : "long";
},

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
    direction = this.normalizeDirection(direction);

    const riskPerUnit = direction === "short"
        ? stop - entry
        : entry - stop;

    if (
        !Number.isFinite(entry) ||
        !Number.isFinite(stop) ||
        entry <= 0 ||
        stop <= 0 ||
        riskPerUnit <= 0
    ) {
        return {
            valid: false,
            error: "Check entry, stop, and direction."
        };
    }

    const target = (r) =>
        direction === "short"
            ? entry - (riskPerUnit * r)
            : entry + (riskPerUnit * r);

    return {
        valid: true,
        entry,
        stop,
        direction,
        riskPerUnit,

        tp1: {
            r: Number(tp1R),
            price: target(tp1R)
        },

        tp2: {
            r: Number(tp2R),
            price: target(tp2R)
        },

        tp3: {
            r: Number(tp3R),
            price: target(tp3R)
        },

        runner: {
            r: Number(runnerR),
            price: target(runnerR)
        }
    };
},

calculateAllocation({
    positionSize,
    allocation = null
}) {

    positionSize = Math.floor(Number(positionSize));

    if (
        !Number.isFinite(positionSize) ||
        positionSize < 1
    ) {
        return {
            valid: false,
            error: "Position size must be at least 1."
        };
    }

    const alloc = allocation || this.defaultAllocation;

    let tp1 = 0;
    let tp2 = 0;
    let tp3 = 0;
    let runner = 0;

    let mode = "PERCENTAGE_ALLOCATION";

    if (positionSize === 1) {

        runner = 1;
        mode = "SINGLE_POSITION";

    } else if (positionSize === 2) {

        tp1 = 1;
        runner = 1;
        mode = "SMALL_POSITION_2";

    } else if (positionSize === 3) {

        tp1 = 1;
        tp2 = 1;
        runner = 1;
        mode = "SMALL_POSITION_3";

    } else if (positionSize === 4) {

        tp1 = 1;
        tp2 = 1;
        tp3 = 1;
        runner = 1;
        mode = "SMALL_POSITION_4";

    } else {

        tp1 = Math.floor(positionSize * Number(alloc.tp1) / 100);
        tp2 = Math.floor(positionSize * Number(alloc.tp2) / 100);
        tp3 = Math.floor(positionSize * Number(alloc.tp3) / 100);

        if (tp1 < 1) {
            tp1 = 1;
        }

        runner = positionSize - tp1 - tp2 - tp3;

        if (runner < 0) {
            runner = 0;
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
            tp1: tp1 / positionSize * 100,
            tp2: tp2 / positionSize * 100,
            tp3: tp3 / positionSize * 100,
            runner: runner / positionSize * 100
        }
    };
},

calculateEntryCost({
    instrument = "stock",
    quantity,
    entryPrice
}) {

    quantity = Number(quantity);
    entryPrice = Number(entryPrice);

    if (quantity <= 0 || entryPrice <= 0) {
        return 0;
    }

    const multiplier =
        String(instrument).toLowerCase().includes("option")
            ? 100
            : 1;

    return quantity * entryPrice * multiplier;
},

calculateAffordability({
    accountBalance,
    instrument = "stock",
    entryPrice,
    requestedSize = null,
    reservePercent = 0
}) {

    accountBalance = Number(accountBalance);
    entryPrice = Number(entryPrice);
    reservePercent = Number(reservePercent);

    if (
        accountBalance <= 0 ||
        entryPrice <= 0
    ) {
        return {
            valid: false,
            error: "Enter a valid account balance and entry price."
        };
    }

    reservePercent = Math.max(
        0,
        Math.min(reservePercent, 99)
    );

    const reserveAmount =
        accountBalance * reservePercent / 100;

    const availableCapital =
        accountBalance - reserveAmount;

    const multiplier =
        String(instrument).toLowerCase().includes("option")
            ? 100
            : 1;

    const unitCost =
        entryPrice * multiplier;

    const maxAffordableUnits =
        Math.floor(
            availableCapital / unitCost
        );

    const requestedUnits =
        requestedSize !== null &&
        requestedSize !== undefined
            ? Math.floor(Number(requestedSize))
            : null;

    const requestedCost =
        requestedUnits !== null && requestedUnits > 0
            ? requestedUnits * unitCost
            : 0;

    const exceedsAvailableCapital =
        requestedCost > availableCapital;

    return {
        valid: true,
        accountBalance,
        instrument,
        reservePercent,
        reserveAmount,
        availableCapital,
        multiplier,
        unitCost,
        maxAffordableUnits,
        requestedUnits,
        requestedCost,
        exceedsAvailableCapital,

        affordable:
            requestedUnits === null
                ? maxAffordableUnits >= 1
                : !exceedsAvailableCapital,

        capitalRemaining:
            requestedUnits !== null
                ? Math.max(
                    0,
                    availableCapital - requestedCost
                )
                : availableCapital
    };
},

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

    const maxByRisk =
        Math.max(
            0,
            Math.floor(Number(riskBasedSize))
        );

    const maxByCash =
        affordability.maxAffordableUnits;

    const safeSize =
        Math.min(maxByRisk, maxByCash);

    return {
        valid: safeSize >= 1,
        riskBasedSize: maxByRisk,
        cashBasedSize: maxByCash,
        safeSize,

        limitingFactor:
            maxByCash < maxByRisk
                ? "ACCOUNT_CAPITAL"
                : "RISK",

        affordability,

        warning:
            safeSize < 1
                ? "Account cannot safely fund one unit."
                : maxByCash < maxByRisk
                    ? "Account capital limits position size."
                    : null
    };
},

calculateProtection({
    entry,
    stop,
    direction = "long",
    mode = "breakeven"
}) {

    entry = Number(entry);
    stop = Number(stop);
    direction = this.normalizeDirection(direction);

    const risk =
        direction === "short"
            ? stop - entry
            : entry - stop;

    if (
        !Number.isFinite(risk) ||
        risk <= 0
    ) {
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
                ? entry - risk * 0.5
                : entry + risk * 0.5;
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
        originalStop: stop,
        entry,
        riskPerUnit: risk
    };
},

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
    direction = this.normalizeDirection(direction);

    if (
        !Number.isFinite(entry) ||
        !Number.isFinite(target) ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        return 0;
    }

    const priceMove =
        direction === "short"
            ? entry - target
            : target - entry;

    const multiplier =
        String(instrument).toLowerCase().includes("option")
            ? 100
            : 1;

    return priceMove * quantity * multiplier;
},

calculateTotalLadderProfit(targets) {

    if (!targets) {
        return 0;
    }

    return (
        Number(targets.tp1?.estimatedProfit || 0) +
        Number(targets.tp2?.estimatedProfit || 0) +
        Number(targets.tp3?.estimatedProfit || 0) +
        Number(targets.runner?.estimatedProfit || 0)
    );
},

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

    const targets = {};

    ["tp1", "tp2", "tp3", "runner"].forEach(key => {

        targets[key] = {
            price: levels[key].price,
            r: levels[key].r,
            quantity:
                allocationResult.allocation[key],

            estimatedProfit:
                this.calculateProfit({
                    instrument,
                    entry,
                    target: levels[key].price,
                    quantity:
                        allocationResult.allocation[key],
                    direction
                })
        };

    });

    return {
        valid: true,
        instrument,
        direction,
        levels,
        allocation: allocationResult,

        entryCost:
            this.calculateEntryCost({
                instrument,
                quantity:
                    allocationResult.positionSize,
                entryPrice: entry
            }),

        affordability:
            accountBalance
                ? this.calculateAffordability({
                    accountBalance,
                    instrument,
                    entryPrice: entry,
                    requestedSize:
                        allocationResult.positionSize
                })
                : null,

        targets,

        estimatedTotalProfit:
            this.calculateTotalLadderProfit(targets)
    };
},

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

    const contractCost =
        optionPremium !== null &&
        Number(optionPremium) > 0
            ? Number(optionPremium) * 100
            : null;

    const totalEntryCost =
        contractCost !== null
            ? contractCost *
              allocationResult.positionSize
            : null;

    const affordability =
        accountBalance !== null &&
        Number(accountBalance) > 0 &&
        optionPremium !== null
            ? this.calculateAffordability({
                accountBalance,
                instrument: "option",
                entryPrice: optionPremium,
                requestedSize:
                    allocationResult.positionSize
            })
            : null;

    return {
        valid: true,
        instrument: "option",
        direction,
        stockLevels: levels,
        allocation: allocationResult,
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
                stockPrice: levels.tp1.price,
                r: levels.tp1.r,
                contracts:
                    allocationResult.allocation.tp1
            },

            tp2: {
                stockPrice: levels.tp2.price,
                r: levels.tp2.r,
                contracts:
                    allocationResult.allocation.tp2
            },

            tp3: {
                stockPrice: levels.tp3.price,
                r: levels.tp3.r,
                contracts:
                    allocationResult.allocation.tp3
            },

            runner: {
                stockPrice: levels.runner.price,
                r: levels.runner.r,
                contracts:
                    allocationResult.allocation.runner
            }
        }
    };
},

formatPrice(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    if (Math.abs(number) < 1) {
        return number.toFixed(4);
    }

    if (Math.abs(number) < 10) {
        return number.toFixed(3);
    }

    return number.toFixed(2);
},

formatMoney(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "$0.00";
    }

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(number);
}

};

window.ROLyfeLadderEngine = ROLyfeLadderEngine;
window.LadderEngine = ROLyfeLadderEngine;
