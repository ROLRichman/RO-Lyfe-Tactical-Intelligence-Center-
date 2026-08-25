/* =========================================================
RO'LYFE TACTICAL INTELLIGENCE CENTER™
TRADE PLANNER ENGINE

FILE:
/js/trade-planner.js

PURPOSE:

Collect trade inputs and create ONE standardized trade plan.

FLOW:

INPUTS
↓
VALIDATE
↓
CALCULATE RISK BUDGET
↓
CALCULATE OPTIONAL MANUAL TARGETS
↓
RETURN STANDARDIZED PLAN
↓
app.js
↓
Risk Engine
↓
Position Sizing
↓
Ladder Engine
↓
Journal

========================================================= */

const TradePlanner = {

/* =====================================================
   CONFIGURATION
===================================================== */

config: {

    defaultRiskPercent: 2,

    maxRiskPercent: 100

},


/* =====================================================
   HELPERS
===================================================== */

getElementValue(id, fallback = "") {

    const element =
        document.getElementById(id);

    if (!element) {
        return fallback;
    }

    return element.value;

},


getNumber(id, fallback = 0) {

    const value =
        Number(
            this.getElementValue(
                id,
                fallback
            )
        );

    return Number.isFinite(value)
        ? value
        : Number(fallback) || 0;

},


getText(id, fallback = "") {

    return String(
        this.getElementValue(
            id,
            fallback
        ) || fallback
    ).trim();

},


normalizeInstrument(instrument = "Stock") {

    const value =
        String(instrument)
            .trim()
            .toLowerCase();

    if (value === "option" || value === "options") {
        return "Option";
    }

    if (value === "crypto" || value === "cryptocurrency") {
        return "Crypto";
    }

    if (value === "future" || value === "futures") {
        return "Futures";
    }

    return "Stock";

},


normalizeDirection(direction = "Long") {

    return String(direction)
        .trim()
        .toLowerCase() === "short"

        ? "Short"

        : "Long";

},


/* =====================================================
   FIND INPUT VALUE

   Supports multiple possible IDs.

   This makes the planner more flexible while we
   finish connecting the dashboard.
===================================================== */

getFirstValue(ids = [], fallback = "") {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (!element) {
            continue;
        }

        const value =
            String(
                element.value ?? ""
            ).trim();

        if (value !== "") {
            return value;
        }

    }

    return fallback;

},


getFirstNumber(ids = [], fallback = 0) {

    const value =
        Number(
            this.getFirstValue(
                ids,
                fallback
            )
        );

    return Number.isFinite(value)
        ? value
        : Number(fallback) || 0;

},


/* =====================================================
   READ ALL TRADE INPUTS
===================================================== */

getInputs() {

    const symbol =
        this.getFirstValue(
            [
                "symbol",
                "tradeSymbol",
                "marketSymbol"
            ],
            ""
        )
        .toUpperCase();


    const instrument =
        this.normalizeInstrument(

            this.getFirstValue(
                [
                    "instrument",
                    "tradeInstrument"
                ],
                "Stock"
            )

        );


    const direction =
        this.normalizeDirection(

            this.getFirstValue(
                [
                    "direction",
                    "tradeDirection"
                ],
                "Long"
            )

        );


    const accountSize =
        this.getFirstNumber(
            [
                "accountSize",
                "accountBalance"
            ],
            0
        );


    const riskPercent =
        this.getFirstNumber(
            [
                "riskPercent",
                "riskPercentage"
            ],
            this.config.defaultRiskPercent
        );


    const stockEntry =
        this.getFirstNumber(
            [
                "stockEntry",
                "entry",
                "entryPrice"
            ],
            0
        );


    const stockStop =
        this.getFirstNumber(
            [
                "stockStop",
                "stop",
                "stopPrice"
            ],
            0
        );


    const optionEntry =
        this.getFirstNumber(
            [
                "optionEntry",
                "optionPremium",
                "premium"
            ],
            0
        );


    const optionDelta =
        this.getFirstNumber(
            [
                "optionDelta",
                "delta"
            ],
            0
        );


    const desiredPosition =
        this.getFirstNumber(
            [
                "desiredContracts",
                "desiredPosition",
                "positionSize"
            ],
            1
        );


    const stockTarget1 =
        this.getFirstNumber(
            [
                "stockTarget1",
                "target1",
                "tp1"
            ],
            0
        );


    const stockTarget2 =
        this.getFirstNumber(
            [
                "stockTarget2",
                "target2",
                "tp2"
            ],
            0
        );


    const stockTarget3 =
        this.getFirstNumber(
            [
                "stockTarget3",
                "target3",
                "tp3"
            ],
            0
        );


    const expiration =
        this.getFirstValue(
            [
                "expiration",
                "optionExpiration"
            ],
            ""
        );


    const timeframe =
        this.getFirstValue(
            [
                "timeframe",
                "tradeTimeframe"
            ],
            ""
        );


    const notes =
        this.getFirstValue(
            [
                "tradeNotes",
                "notes",
                "journalNotes"
            ],
            ""
        );


    return {

        symbol,

        instrument,

        direction,

        accountSize,

        riskPercent,

        stockEntry,

        stockStop,

        optionEntry,

        optionDelta,

        desiredPosition,

        stockTarget1,

        stockTarget2,

        stockTarget3,

        expiration,

        timeframe,

        notes

    };

},


/* =====================================================
   VALIDATE INPUTS
===================================================== */

validate(inputs) {

    const errors = [];


    if (!inputs.symbol) {

        errors.push(
            "Enter a trading symbol."
        );

    }


    if (
        inputs.accountSize <= 0
    ) {

        errors.push(
            "Account size must be greater than zero."
        );

    }


    if (
        inputs.riskPercent <= 0
    ) {

        errors.push(
            "Risk percentage must be greater than zero."
        );

    }


    if (
        inputs.riskPercent >
        this.config.maxRiskPercent
    ) {

        errors.push(
            `Risk percentage cannot exceed ${this.config.maxRiskPercent}%.`
        );

    }


    if (
        inputs.stockEntry <= 0
    ) {

        errors.push(
            "Enter a valid stock entry price."
        );

    }


    if (
        inputs.stockStop <= 0
    ) {

        errors.push(
            "Enter a valid stop price."
        );

    }


    /*
       LONG:
       Stop must be BELOW entry.

       SHORT:
       Stop must be ABOVE entry.
    */

    if (

        inputs.direction === "Long" &&

        inputs.stockStop >=
        inputs.stockEntry

    ) {

        errors.push(
            "For a Long trade, the stop must be below the entry."
        );

    }


    if (

        inputs.direction === "Short" &&

        inputs.stockStop <=
        inputs.stockEntry

    ) {

        errors.push(
            "For a Short trade, the stop must be above the entry."
        );

    }


    /*
       OPTIONS REQUIRE PREMIUM
    */

    if (

        inputs.instrument === "Option" &&

        inputs.optionEntry <= 0

    ) {

        errors.push(
            "Enter a valid option premium."
        );

    }


    return {

        valid:
            errors.length === 0,

        errors

    };

},


/* =====================================================
   CALCULATE BASIC TRADE METRICS
===================================================== */

calculateMetrics(inputs) {

    const direction =
        inputs.direction === "Short"
            ? "short"
            : "long";


    const riskPerShare =
        direction === "short"

            ? (
                inputs.stockStop -
                inputs.stockEntry
            )

            : (
                inputs.stockEntry -
                inputs.stockStop
            );


    const riskAmount =
        inputs.accountSize *
        (
            inputs.riskPercent / 100
        );


    /*
       Basic manual target calculation.

       These are fallback targets.

       The Ladder Engine remains the
       official ladder generator.
    */

    const target1 =
        inputs.stockTarget1 > 0

            ? inputs.stockTarget1

            : direction === "short"

                ? inputs.stockEntry -
                  riskPerShare

                : inputs.stockEntry +
                  riskPerShare;


    const target2 =
        inputs.stockTarget2 > 0

            ? inputs.stockTarget2

            : direction === "short"

                ? inputs.stockEntry -
                  (riskPerShare * 2)

                : inputs.stockEntry +
                  (riskPerShare * 2);


    const target3 =
        inputs.stockTarget3 > 0

            ? inputs.stockTarget3

            : direction === "short"

                ? inputs.stockEntry -
                  (riskPerShare * 3)

                : inputs.stockEntry +
                  (riskPerShare * 3);


    return {

        direction,

        riskPerShare,

        riskAmount,

        stockTarget1:
            target1,

        stockTarget2:
            target2,

        stockTarget3:
            target3

    };

},


/* =====================================================
   CREATE PLAN
===================================================== */

createPlan() {

    console.log(
        "🎯 RO'LYFE TRADE PLANNER: Reading inputs..."
    );


    const inputs =
        this.getInputs();


    console.log(
        "📥 Trade Inputs:",
        inputs
    );


    const validation =
        this.validate(
            inputs
        );


    if (!validation.valid) {

        console.warn(
            "⚠️ Trade Plan Validation Failed:",
            validation.errors
        );


        alert(

            "Please fix the following:\n\n• " +

            validation.errors.join(
                "\n• "
            )

        );


        return null;

    }


    const metrics =
        this.calculateMetrics(
            inputs
        );


    /* =================================================
       STANDARDIZED MASTER PLAN

       IMPORTANT:

       These property names match app.js:

       plan.symbol
       plan.instrument
       plan.direction
       plan.accountSize
       plan.riskPercent
       plan.riskAmount
       plan.stockEntry
       plan.stockStop
       plan.optionEntry
       plan.stockTarget1
       plan.stockTarget2
       plan.stockTarget3
    ================================================= */

    const plan = {

        id:
            `ROLYFE-${Date.now()}`,


        createdAt:
            new Date()
                .toISOString(),


        status:
            "PLANNED",


        symbol:
            inputs.symbol,


        instrument:
            inputs.instrument,


        direction:
            inputs.direction,


        accountSize:
            inputs.accountSize,


        riskPercent:
            inputs.riskPercent,


        riskAmount:
            metrics.riskAmount,


        stockEntry:
            inputs.stockEntry,


        stockStop:
            inputs.stockStop,


        riskPerShare:
            metrics.riskPerShare,


        optionEntry:
            inputs.optionEntry,


        optionDelta:
            inputs.optionDelta,


        desiredPosition:
            inputs.desiredPosition,


        expiration:
            inputs.expiration,


        timeframe:
            inputs.timeframe,


        notes:
            inputs.notes,


        /* =============================================
           INITIAL TARGETS

           These are fallback/manual targets.

           The Ladder Engine will later attach:

           plan.ladderEngine
        ============================================= */

        stockTarget1:
            metrics.stockTarget1,


        stockTarget2:
            metrics.stockTarget2,


        stockTarget3:
            metrics.stockTarget3,


        /* =============================================
           ENGINE PLACEHOLDERS
        ============================================= */

        riskEngine:
            null,


        positionSizing:
            null,


        ladderEngine:
            null

    };


    /*
       SAVE GLOBAL ACTIVE PLAN
    */

    window.currentTradePlan =
        plan;


    window.activeTradePlan =
        plan;


    /*
       BROADCAST EVENT

       TradeController and other systems
       can listen for this.
    */

    window.dispatchEvent(

        new CustomEvent(

            "roLyfeTradePlanCreated",

            {

                detail:
                    plan

            }

        )

    );


    console.log(
        "✅ RO'LYFE TRADE PLAN CREATED:",
        plan
    );


    return plan;

},


/* =====================================================
   GET CURRENT PLAN
===================================================== */

getCurrentPlan() {

    return (
        window.currentTradePlan ||
        window.activeTradePlan ||
        null
    );

},


/* =====================================================
   CLEAR PLAN
===================================================== */

clearPlan() {

    window.currentTradePlan =
        null;


    window.activeTradePlan =
        null;


    console.log(
        "🗑 RO'LYFE Trade Plan cleared."
    );


    return true;

}

};

/* =========================================================
GLOBAL EXPORTS
========================================================= */

window.TradePlanner =
TradePlanner;

/* =========================================================
SYSTEM READY
========================================================= */

console.log(
"🎯 RO'LYFE TRADE PLANNER ONLINE"
);
