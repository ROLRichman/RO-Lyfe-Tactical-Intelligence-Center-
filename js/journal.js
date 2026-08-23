const TradeJournal = {

storageKey: "roLyfeTradeJournal",

getTrades() {

    try {
        return JSON.parse(
            localStorage.getItem(this.storageKey) || "[]"
        );
    } catch (error) {
        console.error("Journal Load Error:", error);
        return [];
    }

},

saveTrades(trades) {

    localStorage.setItem(
        this.storageKey,
        JSON.stringify(trades)
    );

},

money(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(number);

},

percent(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number.toFixed(2) + "%"
        : "—";

},

escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent =
        value === null || value === undefined
            ? ""
            : String(value);

    return div.innerHTML;

},

findTrade(journalId) {

    return this.getTrades().find(
        trade =>
            Number(trade.journalId) ===
            Number(journalId)
    );

},

addTrade() {

    const plan = window.currentTradePlan;

    if (!plan) {
        alert("Create a Trade Plan first.");
        return;
    }

    const trades = this.getTrades();

    const instrument =
        String(plan.instrument || "Stock");

    const lowerInstrument =
        instrument.toLowerCase();

    const isOption =
        lowerInstrument.includes("option");

    const positionSize =
        Number(
            plan.positionSize ??
            plan.shares ??
            plan.contracts ??
            plan.ladderData?.allocation?.positionSize ??
            plan.stockLadder?.allocation?.positionSize ??
            plan.optionLadder?.allocation?.positionSize ??
            0
        );

    if (positionSize < 1) {
        alert("Trade plan does not contain a valid position size.");
        return;
    }

    const ladderData =
        plan.ladderData ??
        plan.stockLadder ??
        plan.optionLadder ??
        null;

    const allocation =
        ladderData?.allocation?.allocation ??
        {
            tp1: 0,
            tp2: 0,
            tp3: 0,
            runner: positionSize
        };

    const entry =
        Number(
            plan.entry ??
            plan.stockEntry ??
            0
        );

    const stop =
        Number(
            plan.stop ??
            plan.stockStop ??
            0
        );

    const plannedRisk =
        Number(
            plan.actualRisk ??
            plan.estimatedTotalRisk ??
            plan.totalMaximumRisk ??
            plan.riskAmount ??
            plan.dollarRisk ??
            0
        );

    const trade = {

        journalId: Date.now(),

        planId:
            plan.id ?? null,

        status: "OPEN",

        createdDate:
            new Date().toLocaleString(),

        entryDate:
            new Date().toLocaleString(),

        exitDate: null,

        symbol:
            plan.symbol || "UNKNOWN",

        instrument,

        direction:
            plan.direction || "Long",

        accountSize:
            Number(plan.accountSize ?? 0),

        riskPercent:
            Number(plan.riskPercent ?? 0),

        riskAmount:
            plannedRisk,

        dollarRisk:
            Number(
                plan.dollarRisk ??
                plannedRisk
            ),

        actualRisk:
            Number(
                plan.actualRisk ??
                plannedRisk
            ),

        entry,

        stop,

        riskPerUnit:
            Number(
                plan.riskPerUnit ??
                plan.stockRiskPerShare ??
                0
            ),

        positionSize,

        remainingQuantity:
            positionSize,

        shares:
            Number(plan.shares ?? 0),

        contracts:
            Number(plan.contracts ?? 0),

        multiplier:
            isOption ? 100 : 1,

        optionType:
            plan.optionType ?? null,

        strike:
            plan.strike ?? null,

        expiration:
            plan.expiration ?? null,

        optionEntry:
            plan.optionEntry ??
            plan.optionPremium ??
            null,

        optionPremium:
            plan.optionPremium ??
            plan.optionEntry ??
            null,

        ladderData,

        allocation,

        exits: [],

        realizedProfitLoss: 0,

        exitPrice: null,

        exitQuantity: 0,

        profitLoss: null,

        profitLossPercent: null,

        rMultiple: null,

        protectionMode: "none",

        protectedStop: null,

        tp1Hit: false,

        tp2Hit: false,

        tp3Hit: false,

        runnerActive: false,

        notes: "",

        mistakes: "",

        lessons: "",

        rating: null

    };

    trades.push(trade);

    this.saveTrades(trades);

    alert(
        `🎯 ${trade.symbol} added to the RO'LYFE Trade Journal.`
    );

    this.renderJournal();

},

calculateExitProfit({
    trade,
    exitPrice,
    quantity
}) {

    const instrument =
        String(trade.instrument || "")
            .toLowerCase();

    const direction =
        String(trade.direction || "long")
            .toLowerCase();

    const isOption =
        instrument.includes("option");

    const entry =
        isOption
            ? Number(
                trade.optionEntry ??
                trade.optionPremium ??
                0
            )
            : Number(trade.entry ?? 0);

    const exit = Number(exitPrice);

    quantity = Number(quantity);

    if (
        entry <= 0 ||
        !Number.isFinite(exit) ||
        quantity <= 0
    ) {
        return {
            valid: false,
            error: "Invalid entry, exit, or quantity."
        };
    }

    const priceMove =
        direction === "short"
            ? entry - exit
            : exit - entry;

    const multiplier =
        isOption ? 100 : 1;

    const profitLoss =
        priceMove *
        quantity *
        multiplier;

    const percentReturn =
        entry > 0
            ? priceMove / entry * 100
            : 0;

    return {
        valid: true,
        entry,
        exit,
        quantity,
        priceMove,
        multiplier,
        profitLoss,
        percentReturn
    };

},

recordExit(journalId, exitType) {

    const trades = this.getTrades();

    const trade = trades.find(
        item =>
            Number(item.journalId) ===
            Number(journalId)
    );

    if (!trade) {
        return;
    }

    if (trade.status !== "OPEN") {
        alert("This trade is already closed.");
        return;
    }

    const remaining =
        Number(trade.remainingQuantity ?? 0);

    if (remaining <= 0) {
        alert("No position remaining.");
        return;
    }

    const isOption =
        String(trade.instrument)
            .toLowerCase()
            .includes("option");

    const suggestedQuantity =
        exitType === "TP1"
            ? Number(trade.allocation?.tp1 ?? remaining)
            : exitType === "TP2"
                ? Number(trade.allocation?.tp2 ?? remaining)
                : exitType === "TP3"
                    ? Number(trade.allocation?.tp3 ?? remaining)
                    : remaining;

    const quantityInput =
        prompt(
            `How many ${
                isOption
                    ? "contracts"
                    : "shares / units"
            } are you closing at ${exitType}?`,
            Math.min(
                suggestedQuantity || remaining,
                remaining
            )
        );

    if (quantityInput === null) {
        return;
    }

    const quantity =
        Number(quantityInput);

    if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > remaining
    ) {
        alert(
            `Enter a quantity between 1 and ${remaining}.`
        );
        return;
    }

    const priceInput =
        prompt(
            isOption
                ? `Enter actual option exit premium for ${exitType}:`
                : `Enter actual exit price for ${exitType}:`
        );

    if (
        priceInput === null ||
        priceInput === "" ||
        !Number.isFinite(Number(priceInput))
    ) {
        return;
    }

    const result =
        this.calculateExitProfit({
            trade,
            exitPrice: Number(priceInput),
            quantity
        });

    if (!result.valid) {
        alert(result.error);
        return;
    }

    const exitRecord = {

        id: Date.now(),

        type: exitType,

        price:
            Number(priceInput),

        quantity,

        profitLoss:
            result.profitLoss,

        percentReturn:
            result.percentReturn,

        timestamp:
            new Date().toLocaleString()

    };

    trade.exits =
        Array.isArray(trade.exits)
            ? trade.exits
            : [];

    trade.exits.push(exitRecord);

    trade.remainingQuantity =
        Math.max(
            0,
            remaining - quantity
        );

    trade.realizedProfitLoss =
        trade.exits.reduce(
            (total, exit) =>
                total +
                Number(exit.profitLoss || 0),
            0
        );

    trade.profitLoss =
        trade.realizedProfitLoss;

    trade.exitPrice =
        Number(priceInput);

    trade.exitQuantity =
        trade.exits.reduce(
            (total, exit) =>
                total +
                Number(exit.quantity || 0),
            0
        );

    if (exitType === "TP1") {
        trade.tp1Hit = true;
    }

    if (exitType === "TP2") {
        trade.tp2Hit = true;
    }

    if (exitType === "TP3") {
        trade.tp3Hit = true;
    }

    if (exitType === "RUNNER") {
        trade.runnerActive = true;
    }

    if (trade.remainingQuantity <= 0) {

        trade.exitDate =
            new Date().toLocaleString();

        trade.status =
            trade.realizedProfitLoss > 0
                ? "WIN"
                : trade.realizedProfitLoss < 0
                    ? "LOSS"
                    : "BREAKEVEN";

        const risk =
            Number(
                trade.actualRisk ??
                trade.riskAmount ??
                trade.dollarRisk ??
                0
            );

        if (risk > 0) {
            trade.rMultiple =
                trade.realizedProfitLoss / risk;
        }

    }

    this.saveTrades(trades);

    this.renderJournal();

},

closeTrade(journalId) {

    const trade =
        this.findTrade(journalId);

    if (!trade) {
        return;
    }

    this.recordExit(
        journalId,
        "FINAL EXIT"
    );

},

applyProtection(journalId) {

    const trade =
        this.findTrade(journalId);

    if (!trade) {
        return;
    }

    const mode =
        prompt(
            `Protection mode:\n\nnone\nbreakeven\nhalfR\noneR`,
            trade.protectionMode || "breakeven"
        );

    if (mode === null) {
        return;
    }

    const normalizedMode =
        String(mode).trim();

    if (
        ![
            "none",
            "breakeven",
            "halfR",
            "oneR"
        ].includes(normalizedMode)
    ) {
        alert("Invalid protection mode.");
        return;
    }

    const trades = this.getTrades();

    const storedTrade = trades.find(
        item =>
            Number(item.journalId) ===
            Number(journalId)
    );

    storedTrade.protectionMode =
        normalizedMode;

    if (
        normalizedMode !== "none" &&
        window.ROLyfeLadderEngine
    ) {

        const result =
            window.ROLyfeLadderEngine
                .calculateProtection({
                    entry: storedTrade.entry,
                    stop: storedTrade.stop,
                    direction:
                        String(
                            storedTrade.direction
                        ).toLowerCase(),
                    mode: normalizedMode
                });

        if (result.valid) {
            storedTrade.protectedStop =
                result.protectedStop;
        }

    } else {

        storedTrade.protectedStop = null;

    }

    this.saveTrades(trades);

    this.renderJournal();

},

addField(journalId, field, label) {

    const trades = this.getTrades();

    const trade = trades.find(
        item =>
            Number(item.journalId) ===
            Number(journalId)
    );

    if (!trade) {
        return;
    }

    const value =
        prompt(
            `${label} for ${trade.symbol}:`,
            trade[field] || ""
        );

    if (value === null) {
        return;
    }

    trade[field] = value;

    this.saveTrades(trades);

    this.renderJournal();

},

addNotes(journalId) {
    this.addField(
        journalId,
        "notes",
        "Trade notes"
    );
},

addMistakes(journalId) {
    this.addField(
        journalId,
        "mistakes",
        "Mistakes"
    );
},

addLessons(journalId) {
    this.addField(
        journalId,
        "lessons",
        "Lessons"
    );
},

rateTrade(journalId) {

    const trades = this.getTrades();

    const trade = trades.find(
        item =>
            Number(item.journalId) ===
            Number(journalId)
    );

    if (!trade) {
        return;
    }

    const rating =
        Number(
            prompt(
                "Rate trade from 1 to 5:",
                trade.rating || ""
            )
        );

    if (
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        alert("Rating must be between 1 and 5.");
        return;
    }

    trade.rating = rating;

    this.saveTrades(trades);

    this.renderJournal();

},

deleteTrade(journalId) {

    if (
        !confirm(
            "Delete this trade?"
        )
    ) {
        return;
    }

    const trades =
        this.getTrades().filter(
            trade =>
                Number(trade.journalId) !==
                Number(journalId)
        );

    this.saveTrades(trades);

    this.renderJournal();

},

clearJournal() {

    if (
        !confirm(
            "Clear the entire Trade Journal? This cannot be undone."
        )
    ) {
        return;
    }

    localStorage.removeItem(this.storageKey);

    this.renderJournal();

},

calculateStats() {

    const trades = this.getTrades();

    const closed =
        trades.filter(
            trade =>
                [
                    "WIN",
                    "LOSS",
                    "BREAKEVEN"
                ].includes(trade.status)
        );

    const wins =
        closed.filter(
            trade => trade.status === "WIN"
        );

    const losses =
        closed.filter(
            trade => trade.status === "LOSS"
        );

    const totalPL =
        closed.reduce(
            (total, trade) =>
                total +
                Number(trade.profitLoss || 0),
            0
        );

    const grossProfit =
        wins.reduce(
            (total, trade) =>
                total +
                Number(trade.profitLoss || 0),
            0
        );

    const grossLoss =
        Math.abs(
            losses.reduce(
                (total, trade) =>
                    total +
                    Number(trade.profitLoss || 0),
                0
            )
        );

    const totalR =
        closed.reduce(
            (total, trade) =>
                total +
                Number(trade.rMultiple || 0),
            0
        );

    return {

        totalTrades:
            trades.length,

        closedTrades:
            closed.length,

        openTrades:
            trades.filter(
                trade => trade.status === "OPEN"
            ).length,

        wins:
            wins.length,

        losses:
            losses.length,

        breakevens:
            closed.filter(
                trade =>
                    trade.status === "BREAKEVEN"
            ).length,

        winRate:
            closed.length
                ? wins.length / closed.length * 100
                : 0,

        totalPL,

        grossProfit,

        grossLoss,

        profitFactor:
            grossLoss > 0
                ? grossProfit / grossLoss
                : grossProfit > 0
                    ? Infinity
                    : 0,

        totalR,

        averageR:
            closed.length
                ? totalR / closed.length
                : 0,

        expectancy:
            closed.length
                ? totalPL / closed.length
                : 0
    };

},

renderStats() {

    const container =
        document.getElementById("journalStats");

    if (!container) {
        return;
    }

    const stats =
        this.calculateStats();

    container.innerHTML = `

        <div class="journal-stats-grid">

            <div class="stat-card">
                <span>Total Trades</span>
                <strong>${stats.totalTrades}</strong>
            </div>

            <div class="stat-card">
                <span>Open</span>
                <strong>${stats.openTrades}</strong>
            </div>

            <div class="stat-card">
                <span>Wins</span>
                <strong>${stats.wins}</strong>
            </div>

            <div class="stat-card">
                <span>Losses</span>
                <strong>${stats.losses}</strong>
            </div>

            <div class="stat-card">
                <span>Win Rate</span>
                <strong>${stats.winRate.toFixed(1)}%</strong>
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
                    ${
                        stats.profitFactor === Infinity
                            ? "∞"
                            : stats.profitFactor.toFixed(2)
                    }
                </strong>
            </div>

            <div class="stat-card">
                <span>Total R</span>
                <strong>${stats.totalR.toFixed(2)}R</strong>
            </div>

            <div class="stat-card">
                <span>Average R</span>
                <strong>${stats.averageR.toFixed(2)}R</strong>
            </div>

            <div class="stat-card">
                <span>Expectancy</span>
                <strong>${this.money(stats.expectancy)}</strong>
            </div>

        </div>

    `;

},

renderJournal() {

    const container =
        document.getElementById("tradeJournal");

    if (!container) {
        return;
    }

    const trades =
        this.getTrades();

    if (!trades.length) {

        container.innerHTML = `
            <div class="empty-journal">
                <h3>📓 RO'LYFE TRADE JOURNAL</h3>
                <p>No trades recorded yet.</p>
            </div>
        `;

        this.renderStats();

        return;
    }

    container.innerHTML =
        trades
            .slice()
            .reverse()
            .map(trade => {

                const exits =
                    Array.isArray(trade.exits)
                        ? trade.exits
                        : [];

                const exitHistory =
                    exits.length
                        ? exits.map(exit => `
                            <div class="journal-exit-row">
                                <strong>${this.escapeHTML(exit.type)}</strong>
                                <span>
                                    Qty: ${exit.quantity}
                                </span>
                                <span>
                                    Exit: ${this.money(exit.price)}
                                </span>
                                <span>
                                    P/L:
                                    ${exit.profitLoss >= 0 ? "+" : ""}
                                    ${this.money(exit.profitLoss)}
                                </span>
                            </div>
                        `).join("")
                        : `<p>No exits recorded.</p>`;

                return `

                    <div class="journal-trade ${String(trade.status).toLowerCase()}">

                        <div class="journal-header">

                            <div>

                                <h3>
                                    ${this.escapeHTML(trade.symbol)}
                                </h3>

                                <span>
                                    ${this.escapeHTML(trade.instrument)}
                                    •
                                    ${this.escapeHTML(trade.direction)}
                                </span>

                            </div>

                            <div class="trade-status">
                                ${this.escapeHTML(trade.status)}
                            </div>

                        </div>


                        <div class="journal-details">

                            <div>
                                <span>Entry</span>
                                <strong>
                                    ${this.money(
                                        String(trade.instrument)
                                            .toLowerCase()
                                            .includes("option")
                                            ? trade.optionEntry
                                            : trade.entry
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Stop</span>
                                <strong>${this.money(trade.stop)}</strong>
                            </div>

                            <div>
                                <span>Original Position</span>
                                <strong>${trade.positionSize}</strong>
                            </div>

                            <div>
                                <span>Remaining</span>
                                <strong>${trade.remainingQuantity}</strong>
                            </div>

                            <div>
                                <span>Realized P/L</span>
                                <strong>
                                    ${Number(trade.realizedProfitLoss || 0) >= 0 ? "+" : ""}
                                    ${this.money(trade.realizedProfitLoss || 0)}
                                </strong>
                            </div>

                            <div>
                                <span>R Multiple</span>
                                <strong>
                                    ${
                                        trade.rMultiple !== null
                                            ? Number(trade.rMultiple).toFixed(2) + "R"
                                            : "OPEN"
                                    }
                                </strong>
                            </div>

                        </div>


                        <div class="journal-risk-info">

                            Risk:
                            <strong>
                                ${this.money(
                                    trade.actualRisk ||
                                    trade.riskAmount ||
                                    trade.dollarRisk
                                )}
                            </strong>

                            • Risk %:
                            <strong>
                                ${this.percent(trade.riskPercent)}
                            </strong>

                        </div>


                        ${
                            trade.status === "OPEN"
                                ? `

                                <div class="journal-ladder">

                                    <div class="ladder-title">
                                        📊 EXECUTION LADDER
                                    </div>

                                    <div class="ladder-status-grid">

                                        <button
                                            class="ladder-status-button ${trade.tp1Hit ? "hit" : ""}"
                                            onclick="TradeJournal.recordExit(${trade.journalId}, 'TP1')"
                                        >
                                            TP1 ${trade.tp1Hit ? "✓" : ""}
                                        </button>

                                        <button
                                            class="ladder-status-button ${trade.tp2Hit ? "hit" : ""}"
                                            onclick="TradeJournal.recordExit(${trade.journalId}, 'TP2')"
                                        >
                                            TP2 ${trade.tp2Hit ? "✓" : ""}
                                        </button>

                                        <button
                                            class="ladder-status-button ${trade.tp3Hit ? "hit" : ""}"
                                            onclick="TradeJournal.recordExit(${trade.journalId}, 'TP3')"
                                        >
                                            TP3 ${trade.tp3Hit ? "✓" : ""}
                                        </button>

                                        <button
                                            class="ladder-status-button ${trade.runnerActive ? "hit" : ""}"
                                            onclick="TradeJournal.recordExit(${trade.journalId}, 'RUNNER')"
                                        >
                                            🏃 RUNNER
                                        </button>

                                    </div>

                                </div>

                                `
                                : ""
                        }


                        <div class="journal-protection">

                            🛡 Protection:
                            <strong>
                                ${trade.protectionMode || "none"}
                            </strong>

                            ${
                                trade.protectedStop !== null
                                    ? `
                                        • Protected Stop:
                                        <strong>
                                            ${this.money(trade.protectedStop)}
                                        </strong>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="journal-exits">

                            <h4>📈 EXECUTION HISTORY</h4>

                            ${exitHistory}

                        </div>


                        ${
                            trade.notes
                                ? `
                                    <div class="journal-notes">
                                        📝 ${this.escapeHTML(trade.notes)}
                                    </div>
                                `
                                : ""
                        }


                        ${
                            trade.mistakes
                                ? `
                                    <div class="journal-mistakes">
                                        ⚠️ ${this.escapeHTML(trade.mistakes)}
                                    </div>
                                `
                                : ""
                        }


                        ${
                            trade.lessons
                                ? `
                                    <div class="journal-lessons">
                                        💡 ${this.escapeHTML(trade.lessons)}
                                    </div>
                                `
                                : ""
                        }


                        <div class="journal-actions">

                            ${
                                trade.status === "OPEN"
                                    ? `

                                        <button onclick="TradeJournal.closeTrade(${trade.journalId})">
                                            🔒 Close Remaining
                                        </button>

                                        <button onclick="TradeJournal.applyProtection(${trade.journalId})">
                                            🛡 Protect
                                        </button>

                                    `
                                    : ""
                            }

                            <button onclick="TradeJournal.addNotes(${trade.journalId})">
                                📝 Notes
                            </button>

                            <button onclick="TradeJournal.addMistakes(${trade.journalId})">
                                ⚠️ Mistakes
                            </button>

                            <button onclick="TradeJournal.addLessons(${trade.journalId})">
                                💡 Lesson
                            </button>

                            <button onclick="TradeJournal.rateTrade(${trade.journalId})">
                                ⭐ Rate
                            </button>

                            <button onclick="TradeJournal.deleteTrade(${trade.journalId})">
                                🗑 Delete
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

    this.renderStats();

}

};

document.addEventListener(
"DOMContentLoaded",
() => {
TradeJournal.renderJournal();
}
);

window.TradeJournal = TradeJournal;
