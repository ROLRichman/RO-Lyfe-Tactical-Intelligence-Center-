/* =====================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MASTER APPLICATION CONTROLLER

   FILE:
   /js/app.js
===================================== */


/* =====================================
   GLOBAL APPLICATION STATE
===================================== */

window.currentTradePlan = null;


/* =====================================
   PAGE NAVIGATION
===================================== */

function showSection(sectionId) {

    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const selected =
        document.getElementById(sectionId);


    if (!selected) {

        console.error(
            `Section not found: ${sectionId}`
        );

        return;

    }


    selected.classList.add(
        "active-section"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================
   MONEY FORMATTER
===================================== */

function formatMoney(value) {

    const number =
        Number(value);


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


/* =====================================
   NUMBER FORMATTER
===================================== */

function formatNumber(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return "0";

    }


    return number.toLocaleString();

}


/* =====================================
   POSITION SIZING ENGINE
===================================== */

function calculatePositionSize(
    plan,
    riskResult
) {


    const accountSize =
        Number(plan.accountSize) || 0;


    const allocationPercent =
        Math.min(
            100,
            Math.max(
                1,
                Number(
                    document.getElementById(
                        "capitalAllocationPercent"
                    )?.value
                ) || 25
            )
        );


    const personalMax =
        Number(
            document.getElementById(
                "personalMaxPosition"
            )?.value
        ) || 0;


    const allocatedCapital =
        accountSize *
        (
            allocationPercent / 100
        );


    let desiredPosition = 1;

    let unitCost = 0;

    let unitLabel = "Units";

    let riskLimit = Infinity;

    let maxAffordable = 0;

    let maxAllocation = 0;



    /* =====================================
       OPTION
    ====================================== */

    if (
        plan.instrument === "Option"
    ) {


        desiredPosition =
            Math.max(

                1,

                Math.floor(
                    Number(
                        document.getElementById(
                            "desiredContracts"
                        )?.value
                    ) || 1
                )

            );


        const premium =
            Number(plan.optionEntry) || 0;


        unitCost =
            premium * 100;


        unitLabel =
            "Contracts";


        maxAffordable =
            unitCost > 0

                ? Math.floor(
                    accountSize /
                    unitCost
                )

                : 0;


        maxAllocation =
            unitCost > 0

                ? Math.floor(
                    allocatedCapital /
                    unitCost
                )

                : 0;


        riskLimit =
            Number(riskResult?.contracts) > 0

                ? Math.floor(
                    Number(
                        riskResult.contracts
                    )
                )

                : Infinity;

    }



    /* =====================================
       STOCK
    ====================================== */

    else if (
        plan.instrument === "Stock"
    ) {


        unitCost =
            Number(plan.stockEntry) || 0;


        unitLabel =
            "Shares";


        desiredPosition =
            Math.max(

                1,

                Math.floor(
                    Number(
                        document.getElementById(
                            "desiredContracts"
                        )?.value
                    ) || 1
                )

            );


        maxAffordable =
            unitCost > 0

                ? Math.floor(
                    accountSize /
                    unitCost
                )

                : 0;


        maxAllocation =
            unitCost > 0

                ? Math.floor(
                    allocatedCapital /
                    unitCost
                )

                : 0;


        riskLimit =
            Number(riskResult?.shares) > 0

                ? Math.floor(
                    Number(
                        riskResult.shares
                    )
                )

                : Infinity;

    }



    /* =====================================
       CRYPTO
    ====================================== */

    else if (
        plan.instrument === "Crypto"
    ) {


        unitCost =
            Number(plan.stockEntry) || 0;


        unitLabel =
            "Units";


        desiredPosition =
            Math.max(

                1,

                Number(
                    document.getElementById(
                        "desiredContracts"
                    )?.value
                ) || 1

            );


        maxAffordable =
            unitCost > 0

                ? accountSize /
                    unitCost

                : 0;


        maxAllocation =
            unitCost > 0

                ? allocatedCapital /
                    unitCost

                : 0;


        riskLimit =
            Number(riskResult?.quantity) > 0

                ? Number(
                    riskResult.quantity
                )

                : Infinity;

    }



    /* =====================================
       FUTURES
    ====================================== */

    else if (
        plan.instrument === "Futures"
    ) {


        unitCost =
            Number(plan.stockEntry) || 0;


        unitLabel =
            "Contracts";


        desiredPosition =
            Math.max(

                1,

                Math.floor(
                    Number(
                        document.getElementById(
                            "desiredContracts"
                        )?.value
                    ) || 1
                )

            );


        maxAffordable =
            unitCost > 0

                ? Math.floor(
                    accountSize /
                    unitCost
                )

                : 0;


        maxAllocation =
            unitCost > 0

                ? Math.floor(
                    allocatedCapital /
                    unitCost
                )

                : 0;


        riskLimit =
            Number(riskResult?.contracts) > 0

                ? Math.floor(
                    Number(
                        riskResult.contracts
                    )
                )

                : Infinity;

    }



    /* =====================================
       PERSONAL LIMIT
    ====================================== */

    const personalLimit =
        personalMax > 0

            ? personalMax

            : Infinity;



    /* =====================================
       LOWEST SAFE NUMBER WINS
    ====================================== */

    const recommendedPosition =
        Math.max(

            0,

            Math.min(

                maxAffordable,

                maxAllocation,

                riskLimit,

                personalLimit

            )

        );



    /* =====================================
       POSITION COST
    ====================================== */

    const desiredPositionCost =
        desiredPosition *
        unitCost;


    const recommendedPositionCost =
        recommendedPosition *
        unitCost;



    /* =====================================
       CASH REMAINING
    ====================================== */

    const remainingCash =
        accountSize -
        recommendedPositionCost;



    /* =====================================
       ACCOUNT USAGE
    ====================================== */

    const desiredAccountUsage =
        accountSize > 0

            ? (
                desiredPositionCost /
                accountSize
            ) * 100

            : 0;


    const recommendedAccountUsage =
        accountSize > 0

            ? (
                recommendedPositionCost /
                accountSize
            ) * 100

            : 0;



    /* =====================================
       WARNINGS
    ====================================== */

    const warnings = [];


    if (
        desiredPosition >
        maxAffordable
    ) {

        warnings.push({

            level: "danger",

            message:
                `🚨 INSUFFICIENT CAPITAL: You requested ${formatNumber(desiredPosition)} ${unitLabel}, but your account can only afford ${formatNumber(maxAffordable)}.`

        });

    }


    if (
        desiredPosition >
        maxAllocation
    ) {

        warnings.push({

            level: "warning",

            message:
                `⚠️ CAPITAL ALLOCATION LIMIT: Your ${allocationPercent}% account allocation allows approximately ${formatNumber(maxAllocation)} ${unitLabel}.`

        });

    }


    if (
        desiredPosition >
        riskLimit
    ) {

        warnings.push({

            level: "danger",

            message:
                `🛡 RISK LIMIT EXCEEDED: The RO'Lyfe Risk Engine allows approximately ${formatNumber(riskLimit)} ${unitLabel}.`

        });

    }


    if (
        desiredPosition >
        personalLimit
    ) {

        warnings.push({

            level: "warning",

            message:
                `⚠️ PERSONAL LIMIT EXCEEDED: Your maximum position setting is ${formatNumber(personalLimit)} ${unitLabel}.`

        });

    }


    if (
        recommendedPosition <= 0
    ) {

        warnings.push({

            level: "danger",

            message:
                "🚨 NO SAFE POSITION SIZE AVAILABLE. Review your account size, entry price, premium, stop, and risk settings."

        });

    }


    if (
        warnings.length === 0
    ) {

        warnings.push({

            level: "safe",

            message:
                "🟢 POSITION SIZE IS WITHIN YOUR CURRENT RO'LYFE ACCOUNT, CAPITAL, RISK, AND PERSONAL LIMITS."

        });

    }



    /* =====================================
       STATUS
    ====================================== */

    let status =
        "SAFE 🟢";


    if (
        desiredPosition >
        recommendedPosition
    ) {

        status =
            "LIMIT EXCEEDED ⚠️";

    }


    if (
        desiredPosition >
        maxAffordable
    ) {

        status =
            "DO NOT ENTER 🚨";

    }



    return {

        valid:
            accountSize > 0 &&
            unitCost > 0,

        status,

        instrument:
            plan.instrument,

        unitLabel,

        accountSize,

        allocationPercent,

        allocatedCapital,

        unitCost,

        desiredPosition,

        desiredPositionCost,

        desiredAccountUsage,

        maxAffordable,

        maxAllocation,

        riskLimit,

        personalLimit,

        recommendedPosition,

        recommendedPositionCost,

        recommendedAccountUsage,

        remainingCash,

        warnings

    };

}


/* =====================================
   BUILD COMPLETE TRADE PLAN
===================================== */

function buildTradePlan() {


    if (
        typeof TradePlanner ===
        "undefined"
    ) {

        alert(
            "Trade Planner engine not loaded."
        );

        return;

    }


    const plan =
        TradePlanner.createPlan();


    if (!plan) {

        return;

    }


    const direction =
        plan.direction === "Short"
            ? "short"
            : "long";


    let riskResult =
        null;


    let ladderResult =
        null;


    let positionResult =
        null;



    /* =====================================
       RUN RISK ENGINE
    ====================================== */

    if (

        typeof ROLyfeRiskEngine ===
        "undefined"

    ) {

        console.error(
            "ROLyfeRiskEngine not loaded."
        );

    }

    else {


        if (
            plan.instrument === "Option"
        ) {

            riskResult =
                ROLyfeRiskEngine
                    .calculateOption({

                        accountBalance:
                            plan.accountSize,

                        riskPercent:
                            plan.riskPercent,

                        stockEntry:
                            plan.stockEntry,

                        stockStop:
                            plan.stockStop,

                        optionPremium:
                            plan.optionEntry,

                        optionDelta:
                            0,

                        direction:
                            direction,

                        maxPremiumRisk:
                            true

                    });

        }


        else if (
            plan.instrument === "Crypto"
        ) {

            riskResult =
                ROLyfeRiskEngine
                    .calculateCrypto({

                        accountBalance:
                            plan.accountSize,

                        riskPercent:
                            plan.riskPercent,

                        entry:
                            plan.stockEntry,

                        stop:
                            plan.stockStop,

                        direction:
                            direction

                    });

        }


        else {

            riskResult =
                ROLyfeRiskEngine
                    .calculateStock({

                        accountBalance:
                            plan.accountSize,

                        riskPercent:
                            plan.riskPercent,

                        entry:
                            plan.stockEntry,

                        stop:
                            plan.stockStop,

                        direction:
                            direction

                    });

        }


        console.log(
            "🛡 RO'LYFE Risk Engine:",
            riskResult
        );

    }



    /* =====================================
       RUN POSITION SIZING ENGINE
    ====================================== */

    positionResult =
        calculatePositionSize(

            plan,

            riskResult

        );


    console.log(
        "🎯 RO'LYFE Position Sizing Engine:",
        positionResult
    );



    /* =====================================
       RUN LADDER ENGINE
    ====================================== */

    if (

        typeof ROLyfeLadderEngine ===
        "undefined"

    ) {

        console.error(
            "ROLyfeLadderEngine not loaded."
        );

    }

    else if (

        riskResult &&
        riskResult.valid

    ) {


        if (
            plan.instrument === "Option"
        ) {

            ladderResult =
                ROLyfeLadderEngine
                    .buildOptionLadder({

                        stockEntry:
                            plan.stockEntry,

                        stockStop:
                            plan.stockStop,

                        contracts:
                            positionResult
                                .recommendedPosition,

                        direction:
                            direction

                    });

        }


        else if (
            plan.instrument === "Crypto"
        ) {

            ladderResult =
                ROLyfeLadderEngine
                    .buildStockLadder({

                        entry:
                            plan.stockEntry,

                        stop:
                            plan.stockStop,

                        positionSize:
                            positionResult
                                .recommendedPosition,

                        direction:
                            direction,

                        instrument:
                            "crypto"

                    });

        }


        else {

            ladderResult =
                ROLyfeLadderEngine
                    .buildStockLadder({

                        entry:
                            plan.stockEntry,

                        stop:
                            plan.stockStop,

                        positionSize:
                            positionResult
                                .recommendedPosition,

                        direction:
                            direction,

                        instrument:
                            plan.instrument
                                .toLowerCase()

                    });

        }


        console.log(
            "🪜 RO'LYFE Ladder Engine:",
            ladderResult
        );

    }



    /* =====================================
       ATTACH ENGINE RESULTS
    ====================================== */

    plan.riskEngine =
        riskResult;


    plan.positionSizing =
        positionResult;


    plan.ladderEngine =
        ladderResult;


    window.currentTradePlan =
        plan;



    /* =====================================
       UPDATE DISPLAYS
    ====================================== */

    updateTradePlanDisplay(
        plan
    );


    updatePositionSizingDisplay(
        plan,
        positionResult
    );


    updateRiskDisplay(
        plan,
        riskResult
    );


    updateLadderDisplay(
        plan,
        ladderResult
    );


    console.log(
        "🎯 COMPLETE RO'LYFE TRADE PLAN:",
        plan
    );


    alert(
        "RO'Lyfe Complete Trade Plan Built! 🎯"
    );

}


/* =====================================
   TRADE PLAN DISPLAY
===================================== */

function updateTradePlanDisplay(plan) {

    const output =
        document.getElementById(
            "tradePlanOutput"
        );


    if (!output) {

        return;

    }


    const targets = [];


    if (plan.stockTarget1) {

        targets.push(
            `TP1: ${formatMoney(plan.stockTarget1)}`
        );

    }


    if (plan.stockTarget2) {

        targets.push(
            `TP2: ${formatMoney(plan.stockTarget2)}`
        );

    }


    if (plan.stockTarget3) {

        targets.push(
            `TP3: ${formatMoney(plan.stockTarget3)}`
        );

    }


    const sizing =
        plan.positionSizing;


    output.innerHTML = `

        <div class="trade-plan-card">

            <h3>
                🎯 RO'LYFE COMPLETE TRADE PLAN
            </h3>

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

            <hr>

            <p>
                <strong>Account Size:</strong>
                ${formatMoney(plan.accountSize)}
            </p>

            <p>
                <strong>Risk Budget:</strong>
                ${formatMoney(plan.riskAmount)}
            </p>

            <p>
                <strong>Position Status:</strong>
                ${sizing?.status || "CALCULATING"}
            </p>

            <hr>

            <p>
                <strong>Entry:</strong>
                ${formatMoney(plan.stockEntry)}
            </p>

            <p>
                <strong>Stop:</strong>
                ${formatMoney(plan.stockStop)}
            </p>

            <p>
                <strong>Targets:</strong>
                ${targets.length
                    ? targets.join(" • ")
                    : "Engine Generated"
                }
            </p>

        </div>

    `;

}


/* =====================================
   POSITION SIZING DISPLAY
===================================== */

function updatePositionSizingDisplay(
    plan,
    sizing
) {


    const output =
        document.getElementById(
            "positionSizingOutput"
        );


    if (!output) {

        return;

    }


    if (
        !sizing ||
        !sizing.valid
    ) {

        output.innerHTML = `

            <div class="risk-error">

                <h3>
                    ⚠️ Position Sizing Engine
                </h3>

                <p>
                    Unable to calculate
                    a safe position size.
                </p>

            </div>

        `;

        return;

    }


    output.innerHTML = `

        <div class="position-sizing-card">

            <h3>
                🎯 RO'LYFE POSITION SIZING ENGINE
            </h3>

            <div class="risk-status">
                ${sizing.status}
            </div>

            <div class="risk-grid">

                <div class="risk-item">
                    <span>Account Size</span>
                    <strong>
                        ${formatMoney(sizing.accountSize)}
                    </strong>
                </div>

                <div class="risk-item">
                    <span>Unit Cost</span>
                    <strong>
                        ${formatMoney(sizing.unitCost)}
                    </strong>
                </div>

                <div class="risk-item">
                    <span>Account Can Afford</span>
                    <strong>
                        ${formatNumber(sizing.maxAffordable)}
                        ${sizing.unitLabel}
                    </strong>
                </div>

                <div class="risk-item">
                    <span>
                        ${sizing.allocationPercent}% Capital Limit
                    </span>
                    <strong>
                        ${formatNumber(sizing.maxAllocation)}
                        ${sizing.unitLabel}
                    </strong>
                </div>

                <div class="risk-item highlight">
                    <span>
                        RO'Lyfe Recommends
                    </span>
                    <strong>
                        ${formatNumber(sizing.recommendedPosition)}
                        ${sizing.unitLabel}
                    </strong>
                </div>

                <div class="risk-item">
                    <span>
                        Position Cost
                    </span>
                    <strong>
                        ${formatMoney(sizing.recommendedPositionCost)}
                    </strong>
                </div>

                <div class="risk-item">
                    <span>
                        Cash Remaining
                    </span>
                    <strong>
                        ${formatMoney(sizing.remainingCash)}
                    </strong>
                </div>

            </div>

            <div class="contract-warnings">

                ${sizing.warnings
                    .map(warning => `

                        <p class="warning-${warning.level}">
                            ${warning.message}
                        </p>

                    `)
                    .join("")
                }

            </div>

        </div>

    `;

}


/* =====================================
   RISK ENGINE DISPLAY
===================================== */

function updateRiskDisplay(
    plan,
    riskResult
) {


    const output =
        document.getElementById(
            "riskEngineOutput"
        );


    if (!output) {

        return;

    }


    if (
        !riskResult ||
        !riskResult.valid
    ) {

        output.innerHTML = `

            <div class="risk-error">

                <h3>
                    ⚠️ Risk Engine
                </h3>

                <p>
                    Unable to calculate
                    position sizing.
                </p>

            </div>

        `;

        return;

    }


    let positionLabel =
        "Position Size";


    let positionSize =
        0;


    if (
        plan.instrument === "Option"
    ) {

        positionLabel =
            "Risk-Based Contracts";

        positionSize =
            riskResult.contracts || 0;

    }

    else if (
        plan.instrument === "Crypto"
    ) {

        positionLabel =
            "Risk-Based Quantity";

        positionSize =
            riskResult.quantity || 0;

    }

    else {

        positionLabel =
            "Risk-Based Shares";

        positionSize =
            riskResult.shares || 0;

    }


    const maxLoss =
        riskResult.maxLoss ||
        riskResult.totalRisk ||
        riskResult.riskAmount ||
        plan.riskAmount ||
        0;


    output.innerHTML = `

        <div class="risk-engine-card">

            <h3>
                🛡 RO'LYFE RISK ENGINE
            </h3>

            <div class="risk-grid">

                <div class="risk-item">
                    <span>Symbol</span>
                    <strong>${plan.symbol}</strong>
                </div>

                <div class="risk-item">
                    <span>Instrument</span>
                    <strong>${plan.instrument}</strong>
                </div>

                <div class="risk-item">
                    <span>Risk Budget</span>
                    <strong>
                        ${formatMoney(plan.riskAmount)}
                    </strong>
                </div>

                <div class="risk-item highlight">
                    <span>${positionLabel}</span>
                    <strong>
                        ${formatNumber(positionSize)}
                    </strong>
                </div>

                <div class="risk-item danger">
                    <span>Maximum Loss</span>
                    <strong>
                        ${formatMoney(maxLoss)}
                    </strong>
                </div>

            </div>

        </div>

    `;

}


/* =====================================
   LADDER ENGINE DISPLAY
===================================== */

function updateLadderDisplay(
    plan,
    ladderResult
) {


    const output =
        document.getElementById(
            "ladderOutput"
        );


    if (!output) {

        return;

    }


    if (
        !ladderResult ||
        !ladderResult.valid
    ) {

        output.innerHTML = `

            <div class="ladder-error">

                <h3>
                    🪜 RO'LYFE TRADE LADDER
                </h3>

                <p>
                    Ladder could not be generated.
                </p>

            </div>

        `;

        return;

    }


    const targets =
        ladderResult.targets || {};


    const getTargetPrice =
        target =>

            target?.price ||
            target?.stockPrice ||
            target?.target ||
            0;


    const getQuantity =
        target =>

            target?.quantity ||
            target?.contracts ||
            0;


    const getR =
        target =>

            target?.r || 0;


    const tp1 =
        targets.tp1 || {};


    const tp2 =
        targets.tp2 || {};


    const tp3 =
        targets.tp3 || {};


    const runner =
        targets.runner || {};


    output.innerHTML = `

        <div class="ladder-card">

            <h3>
                🪜 RO'LYFE PROFIT LADDER
            </h3>

            <p>
                <strong>${plan.symbol}</strong>
                • ${plan.instrument}
                • ${plan.direction}
            </p>

            <hr>

            <div class="ladder-level">

                <strong>
                    🟢 TAKE PROFIT 1
                </strong>

                <p>
                    Target:
                    ${formatMoney(getTargetPrice(tp1))}
                </p>

                <p>
                    ${getR(tp1)}R
                </p>

                <p>
                    Sell:
                    ${getQuantity(tp1)}
                </p>

            </div>

            <div class="ladder-level">

                <strong>
                    🟢 TAKE PROFIT 2
                </strong>

                <p>
                    Target:
                    ${formatMoney(getTargetPrice(tp2))}
                </p>

                <p>
                    ${getR(tp2)}R
                </p>

                <p>
                    Sell:
                    ${getQuantity(tp2)}
                </p>

            </div>

            <div class="ladder-level">

                <strong>
                    🚀 TAKE PROFIT 3
                </strong>

                <p>
                    Target:
                    ${formatMoney(getTargetPrice(tp3))}
                </p>

                <p>
                    ${getR(tp3)}R
                </p>

                <p>
                    Sell:
                    ${getQuantity(tp3)}
                </p>

            </div>

            <div class="ladder-level runner">

                <strong>
                    🏃 RUNNER
                </strong>

                <p>
                    Target:
                    ${formatMoney(getTargetPrice(runner))}
                </p>

                <p>
                    ${getR(runner)}R
                </p>

                <p>
                    Keep:
                    ${getQuantity(runner)}
                </p>

                <p>
                    Trail With Structure
                </p>

            </div>

        </div>

    `;

}


/* =====================================
   ADD PLAN TO JOURNAL
===================================== */

function addPlanToJournal() {


    if (!window.currentTradePlan) {

        alert(
            "Build a trade plan first."
        );

        return;

    }


    if (
        typeof TradeJournal ===
        "undefined"
    ) {

        alert(
            "Journal engine not loaded."
        );

        return;

    }


    TradeJournal.addTrade();


    showSection(
        "journal-section"
    );

}


/* =====================================
   INSTRUMENT UI CONTROL
===================================== */

function updateInstrumentUI() {


    const instrument =
        document.getElementById(
            "instrument"
        )?.value;


    const optionSection =
        document.getElementById(
            "optionExecutionSection"
        );


    const expirationSection =
        document.getElementById(
            "expirationSection"
        );


    const isOption =
        instrument === "Option";


    if (optionSection) {

        optionSection.style.display =
            isOption
                ? "block"
                : "none";

    }


    if (expirationSection) {

        expirationSection.style.display =
            isOption
                ? "block"
                : "none";

    }

}


/* =====================================
   TRADINGVIEW MAIN CHART
===================================== */

function loadMainChart() {


    const symbolElement =
        document.getElementById(
            "marketSymbol"
        );


    const timeframeElement =
        document.getElementById(
            "timeframe"
        );


    const chartContainer =
        document.getElementById(
            "tradingview_chart"
        );


    if (
        !symbolElement ||
        !timeframeElement ||
        !chartContainer
    ) {

        return;

    }


    const symbol =
        symbolElement.value;


    const interval =
        timeframeElement.value;


    chartContainer.innerHTML =
        "";


    if (
        typeof TradingView ===
        "undefined"
    ) {

        chartContainer.innerHTML = `

            <p>
                TradingView is loading...
            </p>

        `;

        return;

    }


    new TradingView.widget({

        container_id:
            "tradingview_chart",

        width:
            "100%",

        height:
            550,

        symbol:
            symbol,

        interval:
            interval,

        theme:
            "dark",

        style:
            "1",

        locale:
            "en",

        toolbar_bg:
            "#0b0f1a",

        allow_symbol_change:
            true,

        studies: [

            "MASimple@tv-basicstudies",

            "MASimple@tv-basicstudies",

            "RSI@tv-basicstudies",

            "MACD@tv-basicstudies",

            "Stochastic@tv-basicstudies"

        ]

    });

}


/* =====================================
   DATE FORMATTER
===================================== */

function formatDateForInput(date) {


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =====================================
   EXPIRATION SHORTCUTS
===================================== */

function setExpiration(type) {


    const input =
        document.getElementById(
            "expiration"
        );


    if (!input) {

        return;

    }


    const today =
        new Date();


    let selectedDate =
        new Date(today);


    if (
        type === "tomorrow"
    ) {

        selectedDate.setDate(
            selectedDate.getDate() + 1
        );

    }


    else if (
        type === "thisFriday"
    ) {

        const day =
            today.getDay();


        const daysUntilFriday =
            (5 - day + 7) % 7;


        selectedDate.setDate(

            today.getDate() +
            daysUntilFriday

        );

    }


    else if (
        type === "nextFriday"
    ) {

        const day =
            today.getDay();


        let daysUntilFriday =
            (5 - day + 7) % 7;


        if (
            daysUntilFriday === 0
        ) {

            daysUntilFriday =
                7;

        }

        else {

            daysUntilFriday +=
                7;

        }


        selectedDate.setDate(

            today.getDate() +
            daysUntilFriday

        );

    }


    input.value =
        formatDateForInput(
            selectedDate
        );

}


/* =====================================
   APPLICATION STARTUP
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        updateInstrumentUI();


        setTimeout(
            loadMainChart,
            300
        );


        console.log(
            "🔥 RO'LYFE RTIC ONLINE"
        );


        console.log(
            "Risk Engine:",
            typeof ROLyfeRiskEngine !==
            "undefined"

                ? "ONLINE 🟢"

                : "OFFLINE 🔴"
        );


        console.log(
            "Ladder Engine:",
            typeof ROLyfeLadderEngine !==
            "undefined"

                ? "ONLINE 🟢"

                : "OFFLINE 🔴"
        );


        console.log(
            "Trade Planner:",
            typeof TradePlanner !==
            "undefined"

                ? "ONLINE 🟢"

                : "OFFLINE 🔴"
        );


        console.log(
            "Trade Controller:",
            typeof TradeController !==
            "undefined"

                ? "ONLINE 🟢"

                : "OFFLINE 🔴"
        );


        console.log(
            "Trade Journal:",
            typeof TradeJournal !==
            "undefined"

                ? "ONLINE 🟢"

                : "OFFLINE 🔴"
        );


        console.log(
            "Watchlist:",
            typeof ROLyfeWatchlist !==
            "undefined"

                ? "ONLINE 🟢"

                : "OFFLINE 🔴"
        );


        console.log(
            "🎯 Position Sizing Engine: ONLINE 🟢"
        );

    }

);

/* =========================================================
RO'LYFE ALERT POPUP
========================================================= */

.rolyfe-alert-popup {

position: fixed;

top: 20px;

right: 20px;

width: min(360px, calc(100vw - 40px));

padding: 16px;

border-radius: 16px;

background: rgba(12, 18, 30, 0.98);

border: 2px solid #38bdf8;

box-shadow:
    0 15px 45px
    rgba(0, 0, 0, 0.45);

color: white;

z-index: 999999;

animation:
    roLyfeAlertSlideIn
    0.35s ease;

}

.rolyfe-alert-popup.warning {

border-color: #facc15;

}

.rolyfe-alert-popup.danger {

border-color: #ef4444;

}

.rolyfe-alert-popup.success {

border-color: #22c55e;

}

.rolyfe-alert-header {

display: flex;

justify-content: space-between;

align-items: center;

font-weight: 800;

margin-bottom: 12px;

}

.rolyfe-alert-close {

border: none;

background: transparent;

color: white;

font-size: 28px;

cursor: pointer;

}

.rolyfe-alert-symbol {

font-size: 28px;

font-weight: 900;

margin-bottom: 8px;

}

.rolyfe-alert-message {

line-height: 1.5;

opacity: 0.9;

margin-bottom: 14px;

}

.rolyfe-alert-chart {

width: 100%;

border: none;

border-radius: 10px;

padding: 12px;

font-weight: 800;

cursor: pointer;

}

@keyframes roLyfeAlertSlideIn {

from {

    opacity: 0;

    transform:
        translateX(100px);

}


to {

    opacity: 1;

    transform:
        translateX(0);

}

   }
