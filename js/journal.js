/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   ADVANCED TRADE JOURNAL ENGINE
   js/journal.js

   PLAN → ENTER → MANAGE → EXIT → REVIEW → LEARN

   CONNECTED SYSTEMS:
   - TradePlanner
   - ROLyfeRiskEngine
   - ROLyfeLadderEngine

========================================================= */

const TradeJournal = {

    /* =====================================================
       STORAGE
    ===================================================== */

    storageKey:
        "roLyfeTradeJournal",


    getTrades() {

        try {

            return JSON.parse(

                localStorage.getItem(
                    this.storageKey
                ) || "[]"

            );

        }

        catch (error) {

            console.error(
                "RO'Lyfe Journal Load Error:",
                error
            );

            return [];

        }

    },


    saveTrades(trades) {

        localStorage.setItem(

            this.storageKey,

            JSON.stringify(
                trades
            )

        );

    },


    /* =====================================================
       HELPERS
    ===================================================== */

    money(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {

            return "—";

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

    },


    number(value, decimals = 2) {

        const numeric =
            Number(value);


        if (!Number.isFinite(numeric)) {

            return "—";

        }


        return numeric.toFixed(
            decimals
        );

    },


    percent(value) {

        const numeric =
            Number(value);


        if (!Number.isFinite(numeric)) {

            return "—";

        }


        return (
            numeric.toFixed(2)
            + "%"
        );

    },


    escapeHTML(value) {

        if (

            value === null ||

            value === undefined

        ) {

            return "";

        }


        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(value);


        return div.innerHTML;

    },


    /* =====================================================
       FIND TRADE
    ===================================================== */

    findTrade(journalId) {

        const trades =
            this.getTrades();


        return trades.find(

            trade =>

                Number(trade.journalId) ===
                Number(journalId)

        );

    },


    /* =====================================================
       CREATE JOURNAL TRADE FROM PLAN
    ===================================================== */

    addTrade() {

        const plan =
            window.currentTradePlan;


        if (!plan) {

            alert(
                "Create a Trade Plan first."
            );

            return;

        }


        const trades =
            this.getTrades();


        /*
           Prevent accidental duplicate
           journal entries from the same plan.
        */

        const alreadyExists =
            trades.some(

                trade =>

                    Number(trade.planId) ===
                    Number(plan.id)

            );


        if (alreadyExists) {

            const addAgain =
                confirm(

                    `${plan.symbol} is already in your Trade Journal.\n\nAdd another journal entry anyway?`

                );


            if (!addAgain) {

                return;

            }

        }


        const instrument =
            String(

                plan.instrument ||
                "Stock"

            ).toLowerCase();


        /*
           Position size priority:

           1. Explicit position size
           2. Shares
           3. Contracts
           4. Ladder position size
        */

        let positionSize =
            Number(

                plan.positionSize ||
                plan.shares ||
                plan.contracts ||
                0

            );


        if (

            !positionSize &&

            plan.ladderData &&

            plan.ladderData.allocation

        ) {

            positionSize =
                Number(

                    plan.ladderData
                        .allocation
                        .positionSize

                ) || 0;

        }


        /*
           Determine multiplier.

           Equity options normally use 100.

           Stocks / crypto use 1.
        */

        let multiplier = 1;


        if (

            instrument.includes("option")

        ) {

            multiplier = 100;

        }


        /*
           Risk amount.

           Prefer actual calculated risk.

           Fall back to planned risk budget.
        */

        const plannedRisk =

            Number(

                plan.actualRisk ||
                plan.estimatedTotalRisk ||
                plan.totalMaximumRisk ||
                plan.riskAmount ||
                plan.dollarRisk ||
                0

            );


        /*
           Create journal record.
        */

        const trade = {

            /* =============================
               IDENTIFIERS
            ============================= */

            journalId:
                Date.now(),


            planId:
                plan.id ||
                null,


            /* =============================
               STATUS
            ============================= */

            status:
                "OPEN",


            /* =============================
               TIME
            ============================= */

            createdDate:
                new Date()
                    .toLocaleString(),


            entryDate:
                new Date()
                    .toLocaleString(),


            exitDate:
                null,


            /* =============================
               BASIC TRADE INFO
            ============================= */

            symbol:
                plan.symbol ||
                "UNKNOWN",


            instrument:
                plan.instrument ||
                "Stock",


            direction:
                plan.direction ||
                "Long",


            /* =============================
               ACCOUNT / RISK
            ============================= */

            accountSize:

                Number(
                    plan.accountSize
                ) || 0,


            riskPercent:

                Number(
                    plan.riskPercent
                ) || 0,


            riskAmount:
                plannedRisk,


            dollarRisk:

                Number(
                    plan.dollarRisk ||
                    plannedRisk
                ) || 0,


            actualRisk:

                Number(
                    plan.actualRisk ||
                    plannedRisk
                ) || 0,


            /* =============================
               STOCK MAP
            ============================= */

            entry:

                Number(
                    plan.entry ||
                    plan.stockEntry
                ) || 0,


            stop:

                Number(
                    plan.stop ||
                    plan.stockStop
                ) || 0,


            target1:

                plan.target1 ??
                plan.stockTarget1 ??
                null,


            target2:

                plan.target2 ??
                plan.stockTarget2 ??
                null,


            target3:

                plan.target3 ??
                plan.stockTarget3 ??
                null,


            riskPerUnit:

                Number(
                    plan.riskPerUnit ||
                    plan.stockRiskPerShare
                ) || 0,


            /* =============================
               POSITION
            ============================= */

            positionSize,


            shares:

                Number(
                    plan.shares
                ) || 0,


            contracts:

                Number(
                    plan.contracts
                ) || 0,


            multiplier,


            /* =============================
               OPTION INFORMATION
            ============================= */

            optionType:

                plan.optionType ||
                null,


            strike:

                plan.strike ??
                null,


            expiration:

                plan.expiration ||
                null,


            optionEntry:

                plan.optionEntry ??
                null,


            optionPremium:

                plan.optionPremium ??
                plan.optionEntry ??
                null,


            optionDelta:

                plan.optionDelta ??
                null,


            optionTarget1:

                plan.optionTarget1 ??
                null,


            optionTarget2:

                plan.optionTarget2 ??
                null,


            optionTarget3:

                plan.optionTarget3 ??
                null,


            /* =============================
               LADDER
            ============================= */

            ladder:

                plan.ladder ||
                {

                    target1Percent: 40,

                    target2Percent: 30,

                    target3Percent: 20,

                    runnerPercent: 10

                },


            ladderData:

                plan.ladderData ||
                plan.stockLadder ||
                plan.optionLadder ||
                null,


            /* =============================
               PROBABILITY
            ============================= */

            probability:

                plan.probability ??
                null,


            probabilityResult:

                plan.probabilityResult ||
                null,


            impliedVolatility:

                plan.impliedVolatility ??
                null,


            /* =============================
               EXECUTION
            ============================= */

            exitPrice:
                null,


            exitQuantity:
                positionSize,


            profitLoss:
                null,


            profitLossPercent:
                null,


            rMultiple:
                null,


            /* =============================
               MANAGEMENT
            ============================= */

            protectionMode:
                "none",


            protectedStop:
                null,


            tp1Hit:
                false,


            tp2Hit:
                false,


            tp3Hit:
                false,


            runnerActive:
                false,


            /* =============================
               REVIEW
            ============================= */

            notes:
                "",


            mistakes:
                "",


            lessons:
                "",


            rating:
                null


        };


        trades.push(
            trade
        );


        this.saveTrades(
            trades
        );


        alert(

            `🎯 ${trade.symbol} added to your RO'LYFE Trade Journal.`

        );


        this.renderJournal();

    },


    /* =====================================================
       CALCULATE P/L

       STOCK:
       Price Move × Shares

       CRYPTO:
       Price Move × Quantity

       OPTIONS:
       Premium Move × Contracts × 100
    ===================================================== */

    calculateProfitLoss({

        trade,

        exitPrice,

        exitQuantity = null

    }) {

        const direction =
            String(

                trade.direction ||
                "Long"

            ).toLowerCase();


        const instrument =
            String(

                trade.instrument ||
                "Stock"

            ).toLowerCase();


        /*
           Determine quantity.
        */

        let quantity =
            Number(

                exitQuantity ||
                trade.exitQuantity ||
                trade.positionSize ||
                trade.shares ||
                trade.contracts ||
                1

            );


        /*
           Prevent invalid quantity.
        */

        if (

            !Number.isFinite(quantity) ||

            quantity <= 0

        ) {

            quantity = 1;

        }


        /*
           OPTIONS
        */

        if (

            instrument.includes("option")

        ) {

            const entry =
                Number(

                    trade.optionEntry ||
                    trade.optionPremium ||
                    0

                );


            const exit =
                Number(exitPrice);


            if (

                entry <= 0 ||

                !Number.isFinite(exit)

            ) {

                return {

                    valid:
                        false,

                    profitLoss:
                        0,

                    error:
                        "Invalid option entry or exit price."

                };

            }


            const priceMove =
                exit - entry;


            const profitLoss =
                priceMove *
                quantity *
                100;


            const percentReturn =
                (

                    priceMove /
                    entry

                ) * 100;


            return {

                valid:
                    true,

                quantity,

                multiplier:
                    100,

                entry,

                exit,

                priceMove,

                profitLoss,

                percentReturn

            };

        }


        /*
           STOCK / CRYPTO
        */

        const entry =
            Number(

                trade.entry ||
                trade.stockEntry ||
                0

            );


        const exit =
            Number(exitPrice);


        if (

            entry <= 0 ||

            !Number.isFinite(exit)

        ) {

            return {

                valid:
                    false,

                profitLoss:
                    0,

                error:
                    "Invalid trade entry or exit price."

            };

        }


        let priceMove;


        if (

            direction === "short"

        ) {

            priceMove =
                entry -
                exit;

        }

        else {

            priceMove =
                exit -
                entry;

        }


        const profitLoss =
            priceMove *
            quantity;


        const percentReturn =
            (

                priceMove /
                entry

            ) * 100;


        return {

            valid:
                true,

            quantity,

            multiplier:
                1,

            entry,

            exit,

            priceMove,

            profitLoss,

            percentReturn

        };

    },


    /* =====================================================
       CLOSE TRADE
    ===================================================== */

    closeTrade(journalId) {

        const trades =
            this.getTrades();


        const trade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!trade) {

            alert(
                "Trade not found."
            );

            return;

        }


        const instrument =
            String(
                trade.instrument
            ).toLowerCase();


        const exitLabel =

            instrument.includes("option")

                ? "option exit premium"

                : "exit price";


        const exitPriceInput =
            prompt(

                `Enter ${exitLabel} for ${trade.symbol}:`

            );


        if (

            exitPriceInput === null ||

            exitPriceInput === "" ||

            isNaN(exitPriceInput)

        ) {

            return;

        }


        const defaultQuantity =
            Number(

                trade.positionSize ||
                trade.shares ||
                trade.contracts ||
                1

            );


        const quantityInput =
            prompt(

                `How many ${
                    instrument.includes("option")

                        ? "contracts"

                        : "shares / units"

                } are being closed?`,

                defaultQuantity

            );


        if (

            quantityInput === null ||

            quantityInput === "" ||

            isNaN(quantityInput)

        ) {

            return;

        }


        const exitPrice =
            Number(exitPriceInput);


        const exitQuantity =
            Number(quantityInput);


        const result =
            this.calculateProfitLoss({

                trade,

                exitPrice,

                exitQuantity

            });


        if (!result.valid) {

            alert(
                result.error ||
                "Unable to calculate trade result."
            );

            return;

        }


        /*
           R-MULTIPLE

           Profit ÷ original planned risk.
        */

        const riskAmount =
            Number(

                trade.actualRisk ||
                trade.riskAmount ||
                trade.dollarRisk ||
                0

            );


        let rMultiple =
            null;


        if (

            riskAmount > 0

        ) {

            rMultiple =
                result.profitLoss /
                riskAmount;

        }


        /*
           UPDATE TRADE
        */

        trade.exitPrice =
            exitPrice;


        trade.exitQuantity =
            exitQuantity;


        trade.profitLoss =
            result.profitLoss;


        trade.profitLossPercent =
            result.percentReturn;


        trade.rMultiple =
            rMultiple;


        trade.exitDate =
            new Date()
                .toLocaleString();


        /*
           STATUS
        */

        if (

            result.profitLoss > 0

        ) {

            trade.status =
                "WIN";

        }

        else if (

            result.profitLoss < 0

        ) {

            trade.status =
                "LOSS";

        }

        else {

            trade.status =
                "BREAKEVEN";

        }


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       MARK TARGET HIT
    ===================================================== */

    markTargetHit(

        journalId,

        target

    ) {

        const trades =
            this.getTrades();


        const trade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!trade) {

            return;

        }


        if (

            target === 1

        ) {

            trade.tp1Hit =
                true;

        }


        if (

            target === 2

        ) {

            trade.tp2Hit =
                true;

        }


        if (

            target === 3

        ) {

            trade.tp3Hit =
                true;

        }


        if (

            target === "runner"

        ) {

            trade.runnerActive =
                true;

        }


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       APPLY PROTECTION
    ===================================================== */

    applyProtection(

        journalId

    ) {

        const trade =
            this.findTrade(
                journalId
            );


        if (!trade) {

            return;

        }


        const mode =
            prompt(

                `Protection mode for ${trade.symbol}:\n\nnone\nbreakeven\nhalfR\noneR`,

                trade.protectionMode ||
                "breakeven"

            );


        if (

            mode === null

        ) {

            return;

        }


        const normalizedMode =
            String(mode)
                .trim();


        if (

            ![
                "none",
                "breakeven",
                "halfR",
                "oneR"
            ].includes(
                normalizedMode
            )

        ) {

            alert(
                "Invalid protection mode."
            );

            return;

        }


        let result;


        if (

            window.ROLyfeLadderEngine

        ) {

            result =
                window.ROLyfeLadderEngine
                    .calculateProtection({

                        entry:
                            trade.entry,


                        stop:
                            trade.stop,


                        direction:
                            String(
                                trade.direction
                            ).toLowerCase(),


                        mode:
                            normalizedMode

                    });

        }


        const trades =
            this.getTrades();


        const storedTrade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!storedTrade) {

            return;

        }


        storedTrade.protectionMode =
            normalizedMode;


        if (

            result &&
            result.valid

        ) {

            storedTrade.protectedStop =
                result.protectedStop;

        }


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       ADD NOTES
    ===================================================== */

    addNotes(journalId) {

        const trades =
            this.getTrades();


        const trade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!trade) {

            return;

        }


        const notes =
            prompt(

                `Trade notes for ${trade.symbol}:`,

                trade.notes || ""

            );


        if (

            notes === null

        ) {

            return;

        }


        trade.notes =
            notes;


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       ADD MISTAKES
    ===================================================== */

    addMistakes(journalId) {

        const trades =
            this.getTrades();


        const trade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!trade) {

            return;

        }


        const mistakes =
            prompt(

                `What mistakes were made on ${trade.symbol}?`,

                trade.mistakes || ""

            );


        if (

            mistakes === null

        ) {

            return;

        }


        trade.mistakes =
            mistakes;


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       ADD LESSONS
    ===================================================== */

    addLessons(journalId) {

        const trades =
            this.getTrades();


        const trade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!trade) {

            return;

        }


        const lessons =
            prompt(

                `What did you learn from ${trade.symbol}?`,

                trade.lessons || ""

            );


        if (

            lessons === null

        ) {

            return;

        }


        trade.lessons =
            lessons;


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       RATE TRADE
    ===================================================== */

    rateTrade(journalId) {

        const trades =
            this.getTrades();


        const trade =
            trades.find(

                item =>

                    Number(item.journalId) ===
                    Number(journalId)

            );


        if (!trade) {

            return;

        }


        const rating =
            prompt(

                `Rate this trade from 1 to 5:`,

                trade.rating || ""

            );


        if (

            rating === null

        ) {

            return;

        }


        const numericRating =
            Number(rating);


        if (

            numericRating < 1 ||

            numericRating > 5 ||

            !Number.isFinite(
                numericRating
            )

        ) {

            alert(
                "Rating must be between 1 and 5."
            );

            return;

        }


        trade.rating =
            numericRating;


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       DELETE TRADE
    ===================================================== */

    deleteTrade(journalId) {

        const confirmDelete =
            confirm(

                "Delete this trade from the RO'Lyfe Trade Journal?"

            );


        if (!confirmDelete) {

            return;

        }


        let trades =
            this.getTrades();


        trades =
            trades.filter(

                trade =>

                    Number(trade.journalId) !==
                    Number(journalId)

            );


        this.saveTrades(
            trades
        );


        this.renderJournal();

    },


    /* =====================================================
       CLEAR JOURNAL
    ===================================================== */

    clearJournal() {

        const confirmClear =
            confirm(

                "Clear the entire RO'Lyfe Trade Journal?\n\nThis cannot be undone."

            );


        if (!confirmClear) {

            return;

        }


        localStorage.removeItem(
            this.storageKey
        );


        this.renderJournal();

    },


    /* =====================================================
       CALCULATE ADVANCED STATS
    ===================================================== */

    calculateStats() {

        const trades =
            this.getTrades();


        const closedTrades =
            trades.filter(

                trade =>

                    [

                        "WIN",
                        "LOSS",
                        "BREAKEVEN"

                    ].includes(
                        trade.status
                    )

            );


        const wins =
            closedTrades.filter(

                trade =>

                    trade.status ===
                    "WIN"

            );


        const losses =
            closedTrades.filter(

                trade =>

                    trade.status ===
                    "LOSS"

            );


        const breakevens =
            closedTrades.filter(

                trade =>

                    trade.status ===
                    "BREAKEVEN"

            );


        const totalPL =
            closedTrades.reduce(

                (

                    total,

                    trade

                ) =>

                    total +

                    (

                        Number(
                            trade.profitLoss
                        ) || 0

                    ),

                0

            );


        const grossProfit =
            wins.reduce(

                (

                    total,

                    trade

                ) =>

                    total +

                    (

                        Number(
                            trade.profitLoss
                        ) || 0

                    ),

                0

            );


        const grossLoss =
            Math.abs(

                losses.reduce(

                    (

                        total,

                        trade

                    ) =>

                        total +

                        (

                            Number(
                                trade.profitLoss
                            ) || 0

                        ),

                    0

                )

            );


        const winRate =
            closedTrades.length > 0

                ? (

                    wins.length /
                    closedTrades.length

                ) * 100

                : 0;


        const averageWin =
            wins.length

                ? grossProfit /
                  wins.length

                : 0;


        const averageLoss =
            losses.length

                ? grossLoss /
                  losses.length

                : 0;


        const profitFactor =

            grossLoss > 0

                ? grossProfit /
                  grossLoss

                : grossProfit > 0

                    ? Infinity

                    : 0;


        const totalR =
            closedTrades.reduce(

                (

                    total,

                    trade

                ) =>

                    total +

                    (

                        Number(
                            trade.rMultiple
                        ) || 0

                    ),

                0

            );


        const averageR =
            closedTrades.length

                ? totalR /
                  closedTrades.length

                : 0;


        const expectancy =

            closedTrades.length

                ? totalPL /
                  closedTrades.length

                : 0;


        return {

            totalTrades:
                trades.length,


            closedTrades:
                closedTrades.length,


            openTrades:

                trades.filter(

                    trade =>

                        trade.status ===
                        "OPEN"

                ).length,


            wins:
                wins.length,


            losses:
                losses.length,


            breakevens:
                breakevens.length,


            winRate,


            totalPL,


            grossProfit,


            grossLoss,


            averageWin,


            averageLoss,


            profitFactor,


            totalR,


            averageR,


            expectancy

        };

    },


    /* =====================================================
       RENDER STATS
    ===================================================== */

    renderStats() {

        const stats =
            this.calculateStats();


        const statsContainer =
            document.getElementById(
                "journalStats"
            );


        if (!statsContainer) {

            return;

        }


        const profitFactorDisplay =

            stats.profitFactor === Infinity

                ? "∞"

                : Number(
                    stats.profitFactor
                ).toFixed(2);


        statsContainer.innerHTML = `

            <div class="journal-stats-grid">

                <div class="stat-card">
                    <span>Total Trades</span>
                    <strong>
                        ${stats.totalTrades}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Open</span>
                    <strong>
                        ${stats.openTrades}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Wins</span>
                    <strong>
                        ${stats.wins}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Losses</span>
                    <strong>
                        ${stats.losses}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Breakeven</span>
                    <strong>
                        ${stats.breakevens}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Win Rate</span>
                    <strong>
                        ${stats.winRate.toFixed(1)}%
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Net P/L</span>
                    <strong>
                        ${stats.totalPL >= 0 ? "+" : ""}
                        ${this.money(stats.totalPL)}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Profit Factor</span>
                    <strong>
                        ${profitFactorDisplay}
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Total R</span>
                    <strong>
                        ${stats.totalR >= 0 ? "+" : ""}
                        ${stats.totalR.toFixed(2)}R
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Average R</span>
                    <strong>
                        ${stats.averageR.toFixed(2)}R
                    </strong>
                </div>


                <div class="stat-card">
                    <span>Expectancy</span>
                    <strong>
                        ${this.money(stats.expectancy)}
                    </strong>
                </div>

            </div>

        `;

    },


    /* =====================================================
       RENDER LADDER STATUS
    ===================================================== */

    renderLadderStatus(trade) {

        return `

            <div class="journal-ladder">

                <div class="ladder-title">

                    📊 TRADE LADDER

                </div>


                <div class="ladder-status-grid">

                    <button

                        class="ladder-status-button ${
                            trade.tp1Hit
                                ? "hit"
                                : ""
                        }"

                        onclick="
                            TradeJournal.markTargetHit(
                                ${trade.journalId},
                                1
                            )
                        "

                    >

                        TP1

                        ${

                            trade.tp1Hit

                                ? " ✓"

                                : ""

                        }

                    </button>


                    <button

                        class="ladder-status-button ${
                            trade.tp2Hit
                                ? "hit"
                                : ""
                        }"

                        onclick="
                            TradeJournal.markTargetHit(
                                ${trade.journalId},
                                2
                            )
                        "

                    >

                        TP2

                        ${

                            trade.tp2Hit

                                ? " ✓"

                                : ""

                        }

                    </button>


                    <button

                        class="ladder-status-button ${
                            trade.tp3Hit
                                ? "hit"
                                : ""
                        }"

                        onclick="
                            TradeJournal.markTargetHit(
                                ${trade.journalId},
                                3
                            )
                        "

                    >

                        TP3

                        ${

                            trade.tp3Hit

                                ? " ✓"

                                : ""

                        }

                    </button>


                    <button

                        class="ladder-status-button ${
                            trade.runnerActive
                                ? "hit"
                                : ""
                        }"

                        onclick="
                            TradeJournal.markTargetHit(
                                ${trade.journalId},
                                'runner'
                            )
                        "

                    >

                        RUNNER

                        ${

                            trade.runnerActive

                                ? " 🏃"

                                : ""

                        }

                    </button>

                </div>

            </div>

        `;

    },


    /* =====================================================
       RENDER JOURNAL
    ===================================================== */

    renderJournal() {

        const container =
            document.getElementById(
                "tradeJournal"
            );


        if (!container) {

            return;

        }


        const trades =
            this.getTrades();


        /*
           EMPTY JOURNAL
        */

        if (

            trades.length === 0

        ) {

            container.innerHTML = `

                <div class="empty-journal">

                    <h3>
                        📓 RO'LYFE TRADE JOURNAL
                    </h3>


                    <p>
                        No trades recorded yet.
                    </p>


                    <p>
                        Plan the trade.
                        Execute the trade.
                        Review the trade.
                        Improve the trader.
                    </p>

                </div>

            `;


            this.renderStats();


            return;

        }


        /*
           TRADE CARDS
        */

        container.innerHTML =

            trades

                .slice()

                .reverse()

                .map(

                    trade => {

                        const entry =
                            Number(

                                trade.entry

                            );


                        const stop =
                            Number(

                                trade.stop

                            );


                        const exit =
                            trade.exitPrice !== null

                                ? Number(
                                    trade.exitPrice
                                )

                                : null;


                        const pl =
                            trade.profitLoss !== null

                                ? Number(
                                    trade.profitLoss
                                )

                                : null;


                        return `

                            <div class="
                                journal-trade
                                ${String(
                                    trade.status
                                ).toLowerCase()}
                            ">


                                <!-- HEADER -->

                                <div class="journal-header">

                                    <div>

                                        <h3>

                                            ${this.escapeHTML(
                                                trade.symbol
                                            )}

                                        </h3>


                                        <span>

                                            ${this.escapeHTML(
                                                trade.instrument
                                            )}

                                            •

                                            ${this.escapeHTML(
                                                trade.direction
                                            )}

                                        </span>

                                    </div>


                                    <div class="trade-status">

                                        ${this.escapeHTML(
                                            trade.status
                                        )}

                                    </div>

                                </div>


                                <!-- TRADE DETAILS -->

                                <div class="journal-details">


                                    <div>

                                        <span>
                                            Entry
                                        </span>

                                        <strong>

                                            ${this.money(
                                                entry
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Stop
                                        </span>

                                        <strong>

                                            ${this.money(
                                                stop
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Exit
                                        </span>

                                        <strong>

                                            ${

                                                exit !== null

                                                    ? this.money(
                                                        exit
                                                    )

                                                    : "OPEN"

                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Position
                                        </span>

                                        <strong>

                                            ${

                                                trade.positionSize ||
                                                trade.shares ||
                                                trade.contracts ||
                                                "—"

                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            P/L
                                        </span>

                                        <strong>

                                            ${

                                                pl !== null

                                                    ? (

                                                        pl >= 0
                                                            ? "+"
                                                            : ""

                                                    )

                                                    + this.money(pl)

                                                    : "—"

                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            R Multiple
                                        </span>

                                        <strong>

                                            ${

                                                trade.rMultiple !== null

                                                    ? Number(
                                                        trade.rMultiple
                                                    ).toFixed(2)

                                                    + "R"

                                                    : "—"

                                            }

                                        </strong>

                                    </div>


                                </div>


                                <!-- RISK -->

                                <div class="journal-risk-info">

                                    <span>

                                        Risk:

                                        <strong>

                                            ${this.money(

                                                trade.actualRisk ||
                                                trade.riskAmount ||
                                                trade.dollarRisk

                                            )}

                                        </strong>

                                    </span>


                                    <span>

                                        Risk %:

                                        <strong>

                                            ${this.percent(
                                                trade.riskPercent
                                            )}

                                        </strong>

                                    </span>

                                </div>


                                <!-- LADDER -->

                                ${

                                    trade.status === "OPEN"

                                        ? this.renderLadderStatus(
                                            trade
                                        )

                                        : ""

                                }


                                <!-- PROTECTION -->

                                <div class="journal-protection">

                                    <span>

                                        🛡 Protection:

                                        <strong>

                                            ${

                                                trade.protectionMode ||
                                                "none"

                                            }

                                        </strong>

                                    </span>


                                    ${

                                        trade.protectedStop !== null

                                            ? `

                                                <span>

                                                    Protected Stop:

                                                    <strong>

                                                        ${this.money(
                                                            trade.protectedStop
                                                        )}

                                                    </strong>

                                                </span>

                                            `

                                            : ""

                                    }

                                </div>


                                <!-- META -->

                                <div class="journal-meta">

                                    <small>

                                        Entered:

                                        ${this.escapeHTML(
                                            trade.entryDate
                                        )}

                                    </small>


                                    ${

                                        trade.exitDate

                                            ? `

                                                <small>

                                                    Closed:

                                                    ${this.escapeHTML(
                                                        trade.exitDate
                                                    )}

                                                </small>

                                            `

                                            : ""

                                    }

                                </div>


                                <!-- NOTES -->

                                ${

                                    trade.notes

                                        ? `

                                            <div class="journal-notes">

                                                <strong>

                                                    📝 Notes:

                                                </strong>

                                                <p>

                                                    ${this.escapeHTML(
                                                        trade.notes
                                                    )}

                                                </p>

                                            </div>

                                        `

                                        : ""

                                }


                                <!-- MISTAKES -->

                                ${

                                    trade.mistakes

                                        ? `

                                            <div class="journal-mistakes">

                                                <strong>

                                                    ⚠️ Mistakes:

                                                </strong>

                                                <p>

                                                    ${this.escapeHTML(
                                                        trade.mistakes
                                                    )}

                                                </p>

                                            </div>

                                        `

                                        : ""

                                }


                                <!-- LESSONS -->

                                ${

                                    trade.lessons

                                        ? `

                                            <div class="journal-lessons">

                                                <strong>

                                                    💡 Lesson:

                                                </strong>

                                                <p>

                                                    ${this.escapeHTML(
                                                        trade.lessons
                                                    )}

                                                </p>

                                            </div>

                                        `

                                        : ""

                                }


                                <!-- RATING -->

                                ${

                                    trade.rating

                                        ? `

                                            <div class="journal-rating">

                                                ⭐ Trade Rating:

                                                ${"⭐".repeat(
                                                    Number(
                                                        trade.rating
                                                    )
                                                )}

                                            </div>

                                        `

                                        : ""

                                }


                                <!-- ACTIONS -->

                                <div class="journal-actions">


                                    ${

                                        trade.status === "OPEN"

                                            ? `

                                                <button

                                                    onclick="
                                                        TradeJournal.closeTrade(
                                                            ${trade.journalId}
                                                        )
                                                    "

                                                >

                                                    🔒 Close Trade

                                                </button>


                                                <button

                                                    onclick="
                                                        TradeJournal.applyProtection(
                                                            ${trade.journalId}
                                                        )
                                                    "

                                                >

                                                    🛡 Protect

                                                </button>

                                            `

                                            : ""

                                    }


                                    <button

                                        onclick="
                                            TradeJournal.addNotes(
                                                ${trade.journalId}
                                            )
                                        "

                                    >

                                        📝 Notes

                                    </button>


                                    <button

                                        onclick="
                                            TradeJournal.addMistakes(
                                                ${trade.journalId}
                                            )
                                        "

                                    >

                                        ⚠️ Mistakes

                                    </button>


                                    <button

                                        onclick="
                                            TradeJournal.addLessons(
                                                ${trade.journalId}
                                            )
                                        "

                                    >

                                        💡 Lesson

                                    </button>


                                    <button

                                        onclick="
                                            TradeJournal.rateTrade(
                                                ${trade.journalId}
                                            )
                                        "

                                    >

                                        ⭐ Rate

                                    </button>


                                    <button

                                        onclick="
                                            TradeJournal.deleteTrade(
                                                ${trade.journalId}
                                            )
                                        "

                                    >

                                        🗑 Delete

                                    </button>


                                </div>


                            </div>

                        `;

                    }

                )

                .join("");


        this.renderStats();

    }

};


/* =========================================================
   AUTO LOAD JOURNAL
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        TradeJournal.renderJournal();

    }

);


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.TradeJournal =
    TradeJournal;
