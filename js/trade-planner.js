/* =========================================================
RO'LYFE TACTICAL INTELLIGENCE CENTER™
MASTER TRADE PLANNER

PURPOSE:

THE INTELLIGENCE BRIDGE BETWEEN:

• User Trade Inputs
• RO'LYFE Risk Engine
• RO'LYFE Ladder Engine
• Trade Controller
• Trade Journal

FLOW:

SYMBOL
↓
ENTRY + STOP
↓
RISK ENGINE
↓
CAPITAL AFFORDABILITY
↓
USER DESIRED POSITION
↓
POSITION LIMIT CHECK
↓
LADDER ENGINE
↓
MASTER TRADE PLAN
↓
JOURNAL

========================================================= */

const TradePlanner = {

/* =====================================================
   CONFIGURATION
===================================================== */

config: {

    defaultInstrument:
        "stock",

    defaultDirection:
        "long",

    defaultRiskPercent:
        2,

    defaultOptionDelta:
        0,

    defaultCapitalAllocationPercent:
        100,

    defaultReserveCashPercent:
        0,

    autoUseRecommendedSize:
        true

},


/* =====================================================
   STATE
===================================================== */

state: {

    activePlan:
        null,

    lastPlan:
        null,

    planHistory:
        []

},


/* =====================================================
   SAFE NUMBER
===================================================== */

safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

},


/* =====================================================
   NORMALIZE INSTRUMENT
===================================================== */

normalizeInstrument(
    instrument = "stock"
) {

    instrument =
        String(instrument)
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


/* =====================================================
   NORMALIZE DIRECTION
===================================================== */

normalizeDirection(
    direction = "long"
) {

    return String(direction)
        .toLowerCase()
        .trim() === "short"

            ? "short"

            : "long";

},


/* =====================================================
   GENERATE TRADE ID
===================================================== */

generateTradeId(
    symbol = "TRADE"
) {

    const timestamp =
        Date.now();


    const random =
        Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase();


    return `ROLYFE-${symbol}-${timestamp}-${random}`;

},


/* =====================================================
   READ INPUT

   Supports:

   <input id="accountBalance">

   OR:

   <input data-field="accountBalance">

===================================================== */

getInputValue(
    ids = [],
    fallback = null
) {

    if (
        !Array.isArray(ids)
    ) {

        ids =
            [ids];

    }


    for (
        const id of ids
    ) {

        const element =

            document.getElementById(id) ||

            document.querySelector(
                `[data-field="${id}"]`
            );


        if (!element) {
            continue;
        }


        if (
            element.type === "checkbox"
        ) {

            return element.checked;

        }


        if (
            element.type === "radio"
        ) {

            const selected =
                document.querySelector(
                    `input[name="${element.name}"]:checked`
                );


            if (selected) {

                return selected.value;

            }

        }


        if (
            element.value !== undefined
        ) {

            return element.value;

        }

    }


    return fallback;

},


/* =====================================================
   READ CHECKBOX
===================================================== */

getCheckboxValue(
    ids = [],
    fallback = false
) {

    if (
        !Array.isArray(ids)
    ) {

        ids =
            [ids];

    }


    for (
        const id of ids
    ) {

        const element =

            document.getElementById(id) ||

            document.querySelector(
                `[data-field="${id}"]`
            );


        if (
            element &&
            element.type === "checkbox"
        ) {

            return element.checked;

        }

    }


    return fallback;

},


/* =====================================================
   COLLECT TRADE INPUTS

   THIS SUPPORTS MULTIPLE ID NAMES
   SO IT IS MORE FLEXIBLE WITH YOUR UI.

===================================================== */

collectInputs() {

    const currentSymbol =

        window.TradeController?.state
            ?.currentSymbol ||

        window.activeTradePlan
            ?.symbol ||

        null;


    const symbol =
        String(

            this.getInputValue(

                [
                    "symbol",
                    "tradeSymbol",
                    "ticker"
                ],

                currentSymbol || ""

            )

        )
        .trim()
        .toUpperCase();


    const instrument =
        this.normalizeInstrument(

            this.getInputValue(

                [
                    "instrument",
                    "tradeInstrument",
                    "instrumentType"
                ],

                this.config.defaultInstrument

            )

        );


    const direction =
        this.normalizeDirection(

            this.getInputValue(

                [
                    "direction",
                    "tradeDirection"
                ],

                this.config.defaultDirection

            )

        );


    const accountBalance =
        this.safeNumber(

            this.getInputValue(

                [
                    "accountBalance",
                    "accountSize",
                    "balance"
                ],

                0

            )

        );


    const riskPercent =
        this.safeNumber(

            this.getInputValue(

                [
                    "riskPercent",
                    "risk",
                    "riskPercentage"
                ],

                this.config.defaultRiskPercent

            )

        );


    const entry =
        this.safeNumber(

            this.getInputValue(

                [
                    "entry",
                    "entryPrice",
                    "stockEntry"
                ],

                0

            )

        );


    const stop =
        this.safeNumber(

            this.getInputValue(

                [
                    "stop",
                    "stopPrice",
                    "stockStop"
                ],

                0

            )

        );


    const target =
        this.safeNumber(

            this.getInputValue(

                [
                    "target",
                    "targetPrice",
                    "stockTarget"
                ],

                0

            )

        );


    const optionPremium =
        this.safeNumber(

            this.getInputValue(

                [
                    "optionPremium",
                    "premium",
                    "optionEntry"
                ],

                0

            )

        );


    const optionDelta =
        Math.abs(

            this.safeNumber(

                this.getInputValue(

                    [
                        "optionDelta",
                        "delta"
                    ],

                    this.config.defaultOptionDelta

                )

            )

        );


    const desiredContracts =
        Math.max(

            0,

            Math.floor(

                this.safeNumber(

                    this.getInputValue(

                        [
                            "desiredContracts",
                            "contracts",
                            "positionSize",
                            "quantity"
                        ],

                        0

                    )

                )

            )

        );


    const capitalAllocationPercent =
        this.safeNumber(

            this.getInputValue(

                [
                    "capitalAllocationPercent",
                    "capitalAllocation",
                    "allocationPercent"
                ],

                this.config
                    .defaultCapitalAllocationPercent

            )

        );


    const reserveCashPercent =
        this.safeNumber(

            this.getInputValue(

                [
                    "reserveCashPercent",
                    "reservePercent",
                    "cashReserve"
                ],

                this.config
                    .defaultReserveCashPercent

            )

        );


    const maxPremiumRisk =
        this.getCheckboxValue(

            [
                "maxPremiumRisk",
                "premiumRisk"
            ],

            false

        );


    return {

        symbol,

        instrument,

        direction,

        accountBalance,

        riskPercent,

        entry,

        stop,

        target,

        optionPremium,

        optionDelta,

        desiredContracts,

        capitalAllocationPercent,

        reserveCashPercent,

        maxPremiumRisk

    };

},


/* =====================================================
   VALIDATE BASE TRADE
===================================================== */

validateInputs(
    inputs
) {

    if (
        !inputs.symbol
    ) {

        return {

            valid:
                false,

            error:
                "Enter a stock or crypto symbol."

        };

    }


    if (
        inputs.accountBalance <= 0
    ) {

        return {

            valid:
                false,

            error:
                "Enter a valid account balance."

        };

    }


    if (
        inputs.riskPercent <= 0
    ) {

        return {

            valid:
                false,

            error:
                "Enter a valid risk percentage."

        };

    }


    if (
        inputs.entry <= 0
    ) {

        return {

            valid:
                false,

            error:
                "Enter a valid entry price."

        };

    }


    if (
        inputs.stop <= 0
    ) {

        return {

            valid:
                false,

            error:
                "Enter a valid stop price."

        };

    }


    return {

        valid:
            true,

        error:
            null

    };

},


/* =====================================================
   CALCULATE STOCK PLAN
===================================================== */

calculateStockPlan(
    inputs
) {

    if (
        !window.ROLyfeRiskEngine
    ) {

        return {

            valid:
                false,

            error:
                "RO'LYFE Risk Engine is not loaded."

        };

    }


    const risk =

        window.ROLyfeRiskEngine
            .calculateStock({

                accountBalance:
                    inputs.accountBalance,

                riskPercent:
                    inputs.riskPercent,

                entry:
                    inputs.entry,

                stop:
                    inputs.stop,

                direction:
                    inputs.direction

            });


    if (
        !risk.valid
    ) {

        return risk;

    }


    return {

        valid:
            true,

        risk,

        recommendedSize:
            risk.recommendedShares,

        selectedSize:

            inputs.desiredContracts > 0

                ? inputs.desiredContracts

                : risk.recommendedShares

    };

},


/* =====================================================
   CALCULATE CRYPTO PLAN
===================================================== */

calculateCryptoPlan(
    inputs
) {

    if (
        !window.ROLyfeRiskEngine
    ) {

        return {

            valid:
                false,

            error:
                "RO'LYFE Risk Engine is not loaded."

        };

    }


    const risk =

        window.ROLyfeRiskEngine
            .calculateCrypto({

                accountBalance:
                    inputs.accountBalance,

                riskPercent:
                    inputs.riskPercent,

                entry:
                    inputs.entry,

                stop:
                    inputs.stop,

                direction:
                    inputs.direction

            });


    if (
        !risk.valid
    ) {

        return risk;

    }


    return {

        valid:
            true,

        risk,

        recommendedSize:
            risk.quantity,

        selectedSize:

            inputs.desiredContracts > 0

                ? inputs.desiredContracts

                : risk.quantity

    };

},


/* =====================================================
   CALCULATE OPTION PLAN
===================================================== */

calculateOptionPlan(
    inputs
) {

    if (
        !window.ROLyfeRiskEngine
    ) {

        return {

            valid:
                false,

            error:
                "RO'LYFE Risk Engine is not loaded."

        };

    }


    if (
        inputs.optionPremium <= 0
    ) {

        return {

            valid:
                false,

            error:
                "Enter a valid option premium."

        };

    }


    const risk =

        window.ROLyfeRiskEngine
            .calculateOption({

                accountBalance:
                    inputs.accountBalance,

                riskPercent:
                    inputs.riskPercent,

                stockEntry:
                    inputs.entry,

                stockStop:
                    inputs.stop,

                optionPremium:
                    inputs.optionPremium,

                optionDelta:
                    inputs.optionDelta,

                direction:
                    inputs.direction,

                maxPremiumRisk:
                    inputs.maxPremiumRisk,

                desiredContracts:
                    inputs.desiredContracts,

                capitalAllocationPercent:
                    inputs.capitalAllocationPercent,

                reserveCashPercent:
                    inputs.reserveCashPercent

            });


    if (
        !risk.valid
    ) {

        return risk;

    }


    return {

        valid:
            true,

        risk,

        recommendedSize:
            risk.recommendedContracts,

        selectedSize:

            inputs.desiredContracts > 0

                ? inputs.desiredContracts

                : risk.recommendedContracts

    };

},


/* =====================================================
   BUILD LADDER
===================================================== */

buildLadder(
    inputs,
    positionData
) {

    if (
        !window.ROLyfeLadderEngine
    ) {

        return {

            valid:
                false,

            error:
                "RO'LYFE Ladder Engine is not loaded."

        };

    }


    const size =
        positionData.selectedSize;


    if (
        inputs.instrument === "option"
    ) {

        return window
            .ROLyfeLadderEngine
            .buildOptionLadder({

                stockEntry:
                    inputs.entry,

                stockStop:
                    inputs.stop,

                contracts:
                    size,

                optionPremium:
                    inputs.optionPremium,

                accountBalance:
                    inputs.accountBalance,

                direction:
                    inputs.direction

            });

    }


    if (
        inputs.instrument === "stock"
    ) {

        return window
            .ROLyfeLadderEngine
            .buildStockLadder({

                entry:
                    inputs.entry,

                stop:
                    inputs.stop,

                positionSize:
                    size,

                direction:
                    inputs.direction,

                instrument:
                    "stock",

                accountBalance:
                    inputs.accountBalance

            });

    }


    return {

        valid:
            false,

        error:
            "Ladder is currently supported for stock and options."

    };

},


/* =====================================================
   CALCULATE TRADE QUALITY
===================================================== */

calculateTradeQuality(
    inputs,
    risk,
    ladder
) {

    let score =
        100;


    const warnings =
        [];


    /*
       RISK PERCENTAGE
    */

    if (
        inputs.riskPercent > 5
    ) {

        score -=
            30;


        warnings.push(
            "High account risk percentage."
        );

    }

    else if (
        inputs.riskPercent > 3
    ) {

        score -=
            15;


        warnings.push(
            "Elevated account risk percentage."
        );

    }


    /*
       POSITION CHECK
    */

    if (
        risk?.positionCheck
            ?.exceedsRisk
    ) {

        score -=
            35;


        warnings.push(
            "Selected position exceeds risk limit."
        );

    }


    if (
        risk?.positionCheck
            ?.exceedsCapital
    ) {

        score -=
            40;


        warnings.push(
            "Selected position exceeds available capital."
        );

    }


    /*
       LADDER CHECK
    */

    if (
        !ladder ||
        !ladder.valid
    ) {

        score -=
            20;


        warnings.push(
            "Profit ladder could not be built."
        );

    }


    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    let grade =
        "A";


    let level =
        "safe";


    if (
        score < 50
    ) {

        grade =
            "F";


        level =
            "danger";

    }

    else if (
        score < 65
    ) {

        grade =
            "D";


        level =
            "danger";

    }

    else if (
        score < 75
    ) {

        grade =
            "C";


        level =
            "warning";

    }

    else if (
        score < 90
    ) {

        grade =
            "B";


        level =
            "good";

    }


    return {

        score,

        grade,

        level,

        warnings

    };

},


/* =====================================================
   BUILD MASTER TRADE PLAN
===================================================== */

buildMasterPlan(
    inputs,
    positionData,
    ladder
) {

    const risk =
        positionData.risk;


    const tradeId =
        this.generateTradeId(
            inputs.symbol
        );


    const stockRiskPerUnit =
        Math.abs(
            inputs.entry -
            inputs.stop
        );


    const riskReward =
        inputs.target > 0 &&
        window.ROLyfeRiskEngine

            ? window
                .ROLyfeRiskEngine
                .calculateRiskReward(

                    inputs.entry,

                    inputs.stop,

                    inputs.target

                )

            : null;


    const quality =
        this.calculateTradeQuality(

            inputs,

            risk,

            ladder

        );


    const plan = {

        /* =============================================
           IDENTITY
        ============================================= */

        id:
            tradeId,


        createdAt:
            new Date()
                .toISOString(),


        status:
            "PLANNED",


        /* =============================================
           TRADE
        ============================================= */

        symbol:
            inputs.symbol,


        instrument:
            inputs.instrument,


        direction:
            inputs.direction,


        /* =============================================
           SETUP
        ============================================= */

        setup: {

            entry:
                inputs.entry,

            stop:
                inputs.stop,

            target:
                inputs.target || null,

            riskPerUnit:
                stockRiskPerUnit,

            riskReward

        },


        /* =============================================
           ACCOUNT
        ============================================= */

        account: {

            balance:
                inputs.accountBalance,

            riskPercent:
                inputs.riskPercent,

            dollarRisk:
                risk.dollarRisk ||

                (
                    inputs.accountBalance *
                    inputs.riskPercent /
                    100
                ),

            capitalAllocationPercent:
                inputs.capitalAllocationPercent,

            reserveCashPercent:
                inputs.reserveCashPercent

        },


        /* =============================================
           POSITION
        ============================================= */

        position: {

            recommendedSize:
                positionData.recommendedSize,


            desiredSize:
                inputs.desiredContracts,


            selectedSize:
                positionData.selectedSize,


            status:

                risk.positionCheck
                    ?.status ||

                "RISK_CALCULATED",


            level:

                risk.positionCheck
                    ?.level ||

                "neutral"

        },


        /* =============================================
           FULL RISK ENGINE OUTPUT
        ============================================= */

        risk,


        /* =============================================
           LADDER
        ============================================= */

        ladder,


        /* =============================================
           QUALITY SCORE
        ============================================= */

        quality,


        /* =============================================
           JOURNAL DATA
        ============================================= */

        journal: {

            status:
                "PLANNED",

            openedAt:
                null,

            closedAt:
                null,

            notes:
                "",

            realizedProfit:
                0,

            realizedLoss:
                0

        }

    };


    return plan;

},


/* =====================================================
   CREATE TRADE PLAN

   MAIN FUNCTION CALLED BY:

   TradeController.createTradePlan()

===================================================== */

createPlan(
    suppliedInputs = null
) {

    console.log(
        "🧠 RO'LYFE MASTER TRADE PLANNER STARTING..."
    );


    const inputs =

        suppliedInputs ||

        this.collectInputs();


    console.log(
        "📥 TRADE INPUTS:",
        inputs
    );


    /*
       VALIDATE
    */

    const validation =
        this.validateInputs(
            inputs
        );


    if (
        !validation.valid
    ) {

        console.error(
            "❌ TRADE PLAN ERROR:",
            validation.error
        );


        this.showMessage(
            validation.error,
            "danger"
        );


        return null;

    }


    /*
       SELECT RISK MODEL
    */

    let positionData;


    if (
        inputs.instrument === "crypto"
    ) {

        positionData =
            this.calculateCryptoPlan(
                inputs
            );

    }


    else if (
        inputs.instrument === "option"
    ) {

        positionData =
            this.calculateOptionPlan(
                inputs
            );

    }


    else {

        positionData =
            this.calculateStockPlan(
                inputs
            );

    }


    /*
       CHECK RISK RESULT
    */

    if (
        !positionData.valid
    ) {

        console.error(
            "❌ POSITION CALCULATION ERROR:",
            positionData.error
        );


        this.showMessage(
            positionData.error ||
            "Unable to calculate position.",
            "danger"
        );


        return null;

    }


    /*
       BUILD LADDER
    */

    const ladder =
        this.buildLadder(

            inputs,

            positionData

        );


    /*
       BUILD MASTER PLAN
    */

    const plan =
        this.buildMasterPlan(

            inputs,

            positionData,

            ladder

        );


    /*
       SAVE STATE
    */

    this.state.activePlan =
        plan;


    this.state.lastPlan =
        plan;


    this.state.planHistory.push(
        plan
    );


    /*
       GLOBAL ACTIVE PLAN
    */

    window.activeTradePlan =
        plan;


    /*
       UPDATE CURRENT SYMBOL
    */

    if (
        window.TradeController
    ) {

        window.TradeController
            .state
            .currentSymbol =
                plan.symbol;

    }


    /*
       UPDATE UI
    */

    this.renderPlan(
        plan
    );


    /*
       DISPATCH EVENT
    */

    window.dispatchEvent(

        new CustomEvent(

            "roLyfeTradePlanBuilt",

            {

                detail:
                    plan

            }

        )

    );


    /*
       SUCCESS MESSAGE
    */

    this.showMessage(

        `🧠 MASTER TRADE PLAN CREATED: ${plan.symbol}`,

        "success"

    );


    console.log(
        "✅ RO'LYFE MASTER TRADE PLAN:",
        plan
    );


    return plan;

},


/* =====================================================
   RENDER PLAN TO UI

   Optional containers:

   #tradePlanOutput
   #tradePlanResults
   #planResults

===================================================== */

renderPlan(
    plan
) {

    const container =

        document.getElementById(
            "tradePlanOutput"
        ) ||

        document.getElementById(
            "tradePlanResults"
        ) ||

        document.getElementById(
            "planResults"
        );


    if (
        !container
    ) {

        return;

    }


    const positionCheck =
        plan.risk
            ?.positionCheck;


    const ladder =
        plan.ladder;


    container.innerHTML = `

        <div class="rolyfe-master-plan">

            <h3>
                🎯 RO'LYFE MASTER TRADE PLAN
            </h3>

            <div>
                <strong>Symbol:</strong>
                ${plan.symbol}
            </div>

            <div>
                <strong>Instrument:</strong>
                ${plan.instrument}
            </div>

            <div>
                <strong>Direction:</strong>
                ${plan.direction.toUpperCase()}
            </div>

            <hr>

            <div>
                <strong>Entry:</strong>
                ${this.formatMoney(plan.setup.entry)}
            </div>

            <div>
                <strong>Stop:</strong>
                ${this.formatMoney(plan.setup.stop)}
            </div>

            <div>
                <strong>Risk Per Unit:</strong>
                ${this.formatMoney(plan.setup.riskPerUnit)}
            </div>

            <div>
                <strong>Account Risk:</strong>
                ${this.formatMoney(plan.account.dollarRisk)}
            </div>

            <hr>

            <div>
                <strong>Recommended Size:</strong>
                ${this.formatSize(plan.position.recommendedSize)}
            </div>

            <div>
                <strong>Selected Size:</strong>
                ${this.formatSize(plan.position.selectedSize)}
            </div>

            <div>
                <strong>Position Status:</strong>
                ${plan.position.status}
            </div>

            <hr>

            <div>
                <strong>Trade Quality:</strong>
                ${plan.quality.score}/100
                (${plan.quality.grade})
            </div>

            ${this.renderLadderHTML(ladder)}

            <hr>

            <div>
                ${positionCheck?.message || ""}
            </div>

        </div>

    `;

},


/* =====================================================
   RENDER LADDER HTML
===================================================== */

renderLadderHTML(
    ladder
) {

    if (
        !ladder ||
        !ladder.valid
    ) {

        return `

            <div>
                ⚠️ Ladder unavailable.
            </div>

        `;

    }


    /*
       OPTION LADDER
    */

    if (
        ladder.instrument === "option"
    ) {

        return `

            <h4>
                🪜 EXIT LADDER
            </h4>

            <div>
                TP1:
                ${this.formatMoney(
                    ladder.targets.tp1.stockPrice
                )}
                •
                ${ladder.targets.tp1.contracts}
                Contract(s)
            </div>

            <div>
                TP2:
                ${this.formatMoney(
                    ladder.targets.tp2.stockPrice
                )}
                •
                ${ladder.targets.tp2.contracts}
                Contract(s)
            </div>

            <div>
                TP3:
                ${this.formatMoney(
                    ladder.targets.tp3.stockPrice
                )}
                •
                ${ladder.targets.tp3.contracts}
                Contract(s)
            </div>

            <div>
                RUNNER:
                ${this.formatMoney(
                    ladder.targets.runner.stockPrice
                )}
                •
                ${ladder.targets.runner.contracts}
                Contract(s)
            </div>

        `;

    }


    /*
       STOCK LADDER
    */

    if (
        ladder.targets
    ) {

        return `

            <h4>
                🪜 EXIT LADDER
            </h4>

            <div>
                TP1:
                ${this.formatMoney(
                    ladder.targets.tp1.price
                )}
                •
                ${ladder.targets.tp1.quantity}
                Units
            </div>

            <div>
                TP2:
                ${this.formatMoney(
                    ladder.targets.tp2.price
                )}
                •
                ${ladder.targets.tp2.quantity}
                Units
            </div>

            <div>
                TP3:
                ${this.formatMoney(
                    ladder.targets.tp3.price
                )}
                •
                ${ladder.targets.tp3.quantity}
                Units
            </div>

            <div>
                RUNNER:
                ${this.formatMoney(
                    ladder.targets.runner.price
                )}
                •
                ${ladder.targets.runner.quantity}
                Units
            </div>

        `;

    }


    return "";

},


/* =====================================================
   SHOW MESSAGE
===================================================== */

showMessage(
    message,
    level = "info"
) {

    const element =

        document.getElementById(
            "tradePlanMessage"
        ) ||

        document.querySelector(
            "[data-role='trade-plan-message']"
        );


    if (
        element
    ) {

        element.textContent =
            message;


        element.className =
            `rolyfe-message ${level}`;

    }


    console.log(
        `RO'LYFE ${level.toUpperCase()}:`,
        message
    );

},


/* =====================================================
   GET ACTIVE PLAN
===================================================== */

getActivePlan() {

    return this.state.activePlan;

},


/* =====================================================
   CLEAR ACTIVE PLAN
===================================================== */

clearPlan() {

    this.state.activePlan =
        null;


    window.activeTradePlan =
        null;


    console.log(
        "🗑 RO'LYFE active trade plan cleared."
    );

},


/* =====================================================
   FORMAT MONEY
===================================================== */

formatMoney(
    value
) {

    return new Intl.NumberFormat(

        "en-US",

        {

            style:
                "currency",

            currency:
                "USD"

        }

    ).format(

        this.safeNumber(
            value
        )

    );

},


/* =====================================================
   FORMAT SIZE
===================================================== */

formatSize(
    value
) {

    const number =
        this.safeNumber(
            value
        );


    return number
        .toLocaleString(

            "en-US",

            {

                maximumFractionDigits:
                    4

            }

        );

}

};

/* =========================================================
GLOBAL EXPORT
========================================================= */

window.TradePlanner =
TradePlanner;

/* =========================================================
SYSTEM READY
========================================================= */

console.log(
"🧠 RO'LYFE MASTER TRADE PLANNER ONLINE"
);
