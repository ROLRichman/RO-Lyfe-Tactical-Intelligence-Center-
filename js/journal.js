/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE JOURNAL ENGINE
   js/journal.js

   PLAN → ENTER → MANAGE → EXIT → REVIEW
========================================================= */

const TradeJournal = {

    getTrades() {
        return JSON.parse(
            localStorage.getItem("roLyfeTradeJournal") || "[]"
        );
    },


    saveTrades(trades) {
        localStorage.setItem(
            "roLyfeTradeJournal",
            JSON.stringify(trades)
        );
    },


    addTrade() {

        const plan = window.currentTradePlan;

        if (!plan) {
            alert("Create a Trade Plan first.");
            return;
        }

        const trades = this.getTrades();

        const trade = {
            ...plan,

            journalId: Date.now(),

            status: "OPEN",

            entryDate: new Date().toLocaleString(),

            exitDate: null,

            exitPrice: null,

            profitLoss: null,

            notes: ""
        };

        trades.push(trade);

        this.saveTrades(trades);

        alert(`${trade.symbol} added to your Trade Journal.`);

        this.renderJournal();
    },


    closeTrade(journalId) {

        const trades = this.getTrades();

        const trade = trades.find(
            t => t.journalId === journalId
        );

        if (!trade) return;

        const exitPrice = prompt(
            `Enter exit price for ${trade.symbol}:`
        );

        if (
            exitPrice === null ||
            exitPrice === "" ||
            isNaN(exitPrice)
        ) {
            return;
        }

        const price = parseFloat(exitPrice);

        let profitLoss = 0;

        /*
           Basic P/L calculation.

           Future version can connect:
           - shares
           - contracts
           - option multiplier
           - commissions
        */

        if (trade.direction === "Long") {

            profitLoss = price - trade.entry;

        } else {

            profitLoss = trade.entry - price;

        }

        trade.exitPrice = price;

        trade.profitLoss = profitLoss;

        trade.exitDate = new Date().toLocaleString();

        trade.status = profitLoss >= 0
            ? "WIN"
            : "LOSS";

        this.saveTrades(trades);

        this.renderJournal();
    },


    addNotes(journalId) {

        const trades = this.getTrades();

        const trade = trades.find(
            t => t.journalId === journalId
        );

        if (!trade) return;

        const notes = prompt(
            `Trade notes for ${trade.symbol}:`,
            trade.notes || ""
        );

        if (notes === null) return;

        trade.notes = notes;

        this.saveTrades(trades);

        this.renderJournal();
    },


    deleteTrade(journalId) {

        const confirmDelete = confirm(
            "Delete this trade from the journal?"
        );

        if (!confirmDelete) return;

        let trades = this.getTrades();

        trades = trades.filter(
            t => t.journalId !== journalId
        );

        this.saveTrades(trades);

        this.renderJournal();
    },


    clearJournal() {

        const confirmClear = confirm(
            "Clear the entire RO'Lyfe Trade Journal?"
        );

        if (!confirmClear) return;

        localStorage.removeItem("roLyfeTradeJournal");

        this.renderJournal();
    },


    calculateStats() {

        const trades = this.getTrades();

        const closedTrades = trades.filter(
            t => t.status === "WIN" || t.status === "LOSS"
        );

        const wins = closedTrades.filter(
            t => t.status === "WIN"
        );

        const losses = closedTrades.filter(
            t => t.status === "LOSS"
        );

        const totalPL = closedTrades.reduce(
            (total, trade) =>
                total + (parseFloat(trade.profitLoss) || 0),
            0
        );

        const winRate = closedTrades.length
            ? (wins.length / closedTrades.length) * 100
            : 0;

        return {
            totalTrades: trades.length,

            closedTrades: closedTrades.length,

            openTrades: trades.filter(
                t => t.status === "OPEN"
            ).length,

            wins: wins.length,

            losses: losses.length,

            winRate: winRate,

            totalPL: totalPL
        };
    },


    renderStats() {

        const stats = this.calculateStats();

        const statsContainer =
            document.getElementById("journalStats");

        if (!statsContainer) return;

        statsContainer.innerHTML = `

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
                        ${stats.totalPL.toFixed(2)}
                    </strong>
                </div>

            </div>

        `;
    },


    renderJournal() {

        const container =
            document.getElementById("tradeJournal");

        if (!container) return;

        const trades = this.getTrades();

        if (trades.length === 0) {

            container.innerHTML = `

                <div class="empty-journal">

                    <h3>📓 RO'LYFE TRADE JOURNAL</h3>

                    <p>
                        No trades recorded yet.
                    </p>

                    <p>
                        Plan the trade. Execute the trade.
                        Review the trade.
                    </p>

                </div>

            `;

            this.renderStats();

            return;
        }

        container.innerHTML = trades
            .slice()
            .reverse()
            .map(trade => `

                <div class="journal-trade ${trade.status.toLowerCase()}">

                    <div class="journal-header">

                        <div>

                            <h3>
                                ${trade.symbol}
                            </h3>

                            <span>
                                ${trade.instrument} •
                                ${trade.direction}
                            </span>

                        </div>

                        <div class="trade-status">

                            ${trade.status}

                        </div>

                    </div>


                    <div class="journal-details">

                        <div>
                            <span>Entry</span>
                            <strong>$${Number(trade.entry).toFixed(2)}</strong>
                        </div>

                        <div>
                            <span>Stop</span>
                            <strong>$${Number(trade.stop).toFixed(2)}</strong>
                        </div>

                        <div>
                            <span>Exit</span>
                            <strong>
                                ${
                                    trade.exitPrice
                                    ? "$" + Number(trade.exitPrice).toFixed(2)
                                    : "OPEN"
                                }
                            </strong>
                        </div>

                        <div>
                            <span>P/L</span>
                            <strong>
                                ${
                                    trade.profitLoss !== null
                                    ? Number(trade.profitLoss).toFixed(2)
                                    : "--"
                                }
                            </strong>
                        </div>

                    </div>


                    <div class="journal-meta">

                        <small>
                            Entered:
                            ${trade.entryDate}
                        </small>

                        ${
                            trade.exitDate
                            ? `
                                <small>
                                    Closed:
                                    ${trade.exitDate}
                                </small>
                            `
                            : ""
                        }

                    </div>


                    ${
                        trade.notes
                        ? `
                            <div class="journal-notes">

                                <strong>Notes:</strong>

                                <p>
                                    ${trade.notes}
                                </p>

                            </div>
                        `
                        : ""
                    }


                    <div class="journal-actions">

                        ${
                            trade.status === "OPEN"
                            ? `
                                <button
                                    onclick="TradeJournal.closeTrade(${trade.journalId})"
                                >
                                    🔒 Close Trade
                                </button>
                            `
                            : ""
                        }

                        <button
                            onclick="TradeJournal.addNotes(${trade.journalId})"
                        >
                            📝 Notes
                        </button>

                        <button
                            onclick="TradeJournal.deleteTrade(${trade.journalId})"
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>

            `)
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
