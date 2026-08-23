/* =========================================================
RO'LYFE TACTICAL INTELLIGENCE CENTER™
MASTER TRADE CONTROLLER

CENTRAL CONNECTION HUB

CONNECTS:

• app.js
• watchlist.js
• risk-engine.js
• ladder-engine.js
• trade-planner.js
• journal.js
• Charts
• Alert System

FLOW:

WATCHLIST
↓
SELECT SYMBOL
↓
UPDATE CHART
↓
LOAD TRADE PLANNER
↓
CREATE PLAN
↓
RISK ENGINE
↓
LADDER ENGINE
↓
SAVE / JOURNAL
↓
REVIEW

========================================================= */

const TradeController = {

/* =====================================================
   CONFIGURATION
===================================================== */

config: {

    alertInterval: 20000,

    alertCooldown: 60000,

    enableAlerts: true

},


/* =====================================================
   STATE
===================================================== */

state: {

    currentSymbol: null,

    currentPrice: null,

    lastAlertTimes: {},

    alertTimer: null,

    initialized: false

},


/* =====================================================
   INITIALIZE SYSTEM
===================================================== */

init() {

    if (this.state.initialized) {

        console.log(
            "🎯 Trade Controller already initialized."
        );

        return;

    }


    console.log(
        "🎯 INITIALIZING RO'LYFE TRADE CONTROLLER..."
    );


    this.connectTradePlanner();

    this.connectWatchlist();

    this.connectJournal();

    this.setupSymbolInput();

    this.setupAlertSystem();

    this.state.initialized = true;


    console.log(
        "✅ RO'LYFE TRADE CONTROLLER ONLINE"
    );

},


/* =====================================================
   ENGINE CHECK
===================================================== */

checkSystem() {

    const status = {

        riskEngine:
            !!window.ROLyfeRiskEngine,

        ladderEngine:
            !!window.ROLyfeLadderEngine,

        tradePlanner:
            !!window.TradePlanner,

        tradeJournal:
            !!window.TradeJournal,

        watchlist:
            !!window.Watchlist

    };


    console.log(
        "🧠 RO'LYFE SYSTEM STATUS:",
        status
    );


    return status;

},


/* =====================================================
   WATCHLIST CONNECTION
===================================================== */

connectWatchlist() {

    console.log(
        "📡 Connecting Watchlist..."
    );


    /*
       Support multiple possible
       Watchlist object names.
    */

    const watchlist =

        window.Watchlist ||

        window.ROLYFEWatchlist ||

        window.ROLyfeWatchlist ||

        null;


    if (!watchlist) {

        console.warn(
            "⚠️ Watchlist object not detected. " +
            "DOM click connection will still work."
        );

    }


    /*
       Listen for ANY clickable symbol.

       Supported:

       data-symbol="AAPL"

       class="watchlist-symbol"

       class="symbol"
    */

    document.addEventListener(

        "click",

        (event) => {

            const target =
                event.target.closest(

                    "[data-symbol], .watchlist-symbol, .symbol"
                );


            if (!target) {
                return;
            }


            let symbol =

                target.dataset.symbol ||

                target.textContent ||

                "";


            symbol =
                String(symbol)
                    .trim()
                    .toUpperCase();


            /*
               Clean accidental text.
            */

            symbol =
                symbol
                    .split(/\s+/)[0]
                    .replace(/[^A-Z0-9.\-]/g, "");


            if (
                !symbol ||
                symbol.length > 12
            ) {
                return;
            }


            this.selectSymbol(
                symbol,
                target
            );

        }

    );


    console.log(
        "📡 Watchlist connection ready."
    );

},


/* =====================================================
   SELECT SYMBOL

   ONE SYMBOL SELECTION CONTROLS:

   • Symbol Input
   • Chart
   • Current State
   • Trade Planner
   • Alerts
===================================================== */

selectSymbol(

    symbol,

    sourceElement = null

) {

    if (!symbol) {
        return;
    }


    symbol =
        String(symbol)
            .trim()
            .toUpperCase();


    console.log(
        `🎯 Selected Symbol: ${symbol}`
    );


    this.state.currentSymbol =
        symbol;


    /*
       UPDATE SYMBOL INPUT
    */

    const symbolInput =
        document.getElementById(
            "symbol"
        );


    if (symbolInput) {

        symbolInput.value =
            symbol;

    }


    /*
       UPDATE ACTIVE WATCHLIST UI
    */

    document
        .querySelectorAll(
            "[data-symbol], .watchlist-symbol, .symbol"
        )
        .forEach(

            element =>

                element.classList.remove(
                    "active-symbol"
                )

        );


    if (sourceElement) {

        sourceElement.classList.add(
            "active-symbol"
        );

    }


    /*
       UPDATE PAGE LABELS
    */

    document
        .querySelectorAll(
            "[data-current-symbol]"
        )
        .forEach(

            element => {

                element.textContent =
                    symbol;

            }

        );


    /*
       UPDATE CHART
    */

    this.updateChart(
        symbol
    );


    /*
       DISPATCH EVENT

       Other systems can listen.
    */

    window.dispatchEvent(

        new CustomEvent(

            "roLyfeSymbolSelected",

            {

                detail: {

                    symbol,

                    timestamp:
                        Date.now()

                }

            }

        )

    );


    return symbol;

},


/* =====================================================
   CHART CONNECTION

   Supports multiple chart systems.

   1. window.ROLYFEChart
   2. window.ChartController
   3. window.chart
   4. TradingView widget recreation
   5. Custom symbol event
===================================================== */

updateChart(symbol) {

    if (!symbol) {
        return;
    }


    console.log(
        `📈 Updating chart: ${symbol}`
    );


    /*
       CUSTOM RO'LYFE CHART
    */

    if (

        window.ROLYFEChart &&

        typeof window.ROLYFEChart.setSymbol ===
        "function"

    ) {

        window.ROLYFEChart.setSymbol(
            symbol
        );

        return true;

    }


    /*
       CHART CONTROLLER
    */

    if (

        window.ChartController &&

        typeof window.ChartController.setSymbol ===
        "function"

    ) {

        window.ChartController.setSymbol(
            symbol
        );

        return true;

    }


    /*
       GENERIC CHART OBJECT
    */

    if (

        window.chart &&

        typeof window.chart.setSymbol ===
        "function"

    ) {

        window.chart.setSymbol(
            symbol
        );

        return true;

    }


    /*
       TRADINGVIEW WIDGET CONTAINER

       If your HTML has:

       <div id="tradingview_chart"></div>

       OR

       <div id="chartContainer"></div>

       This attempts to reload the widget.
    */

    const chartContainer =

        document.getElementById(
            "tradingview_chart"
        ) ||

        document.getElementById(
            "chartContainer"
        ) ||

        document.getElementById(
            "chart"
        );


    if (

        chartContainer &&

        window.TradingView &&

        typeof window.TradingView.widget ===
        "function"

    ) {

        chartContainer.innerHTML =
            "";


        new window.TradingView.widget({

            autosize:
                true,

            symbol:
                symbol,

            interval:
                "5",

            timezone:
                "America/New_York",

            theme:
                "dark",

            style:
                "1",

            locale:
                "en",

            toolbar_bg:
                "#f1f3f6",

            enable_publishing:
                false,

            allow_symbol_change:
                true,

            container_id:
                chartContainer.id

        });


        return true;

    }


    /*
       FINAL FALLBACK

       Broadcast event for any chart
       system to listen to.
    */

    window.dispatchEvent(

        new CustomEvent(

            "roLyfeChartUpdate",

            {

                detail: {

                    symbol

                }

            }

        )

    );


    return false;

},


/* =====================================================
   TRADE PLANNER CONNECTION
===================================================== */

connectTradePlanner() {

    const createButton =

        document.getElementById(
            "createTradePlan"
        ) ||

        document.getElementById(
            "createPlanButton"
        ) ||

        document.querySelector(
            "[data-action='create-plan']"
        );


    if (

        createButton &&

        !createButton.dataset.roLyfeConnected

    ) {

        createButton.addEventListener(

            "click",

            (event) => {

                event.preventDefault();

                this.createTradePlan();

            }

        );


        createButton.dataset.roLyfeConnected =
            "true";

    }

},


/* =====================================================
   CREATE TRADE PLAN
===================================================== */

createTradePlan() {

    if (

        !window.TradePlanner ||

        typeof window.TradePlanner.createPlan !==
        "function"

    ) {

        alert(
            "Trade Planner is not loaded."
        );

        return null;

    }


    const plan =
        window.TradePlanner.createPlan();


    if (!plan) {

        return null;

    }


    /*
       Keep controller state synced.
    */

    this.state.currentSymbol =
        plan.symbol;


    /*
       Save as active plan.
    */

    window.activeTradePlan =
        plan;


    /*
       Broadcast plan event.
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
        "🎯 MASTER TRADE PLAN CONNECTED:",
        plan
    );


    return plan;

},


/* =====================================================
   JOURNAL CONNECTION
===================================================== */

connectJournal() {

    window.addEventListener(

        "roLyfeTradePlanCreated",

        (event) => {

            console.log(
                "📓 Trade Plan ready for Journal:",
                event.detail.symbol
            );

        }

    );

},


/* =====================================================
   SYMBOL INPUT CONNECTION
===================================================== */

setupSymbolInput() {

    const symbolInput =
        document.getElementById(
            "symbol"
        );


    if (!symbolInput) {
        return;
    }


    symbolInput.addEventListener(

        "change",

        () => {

            const symbol =
                symbolInput.value
                    .trim()
                    .toUpperCase();


            if (symbol) {

                this.selectSymbol(
                    symbol
                );

            }

        }

    );


    symbolInput.addEventListener(

        "keydown",

        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();


                const symbol =
                    symbolInput.value
                        .trim()
                        .toUpperCase();


                if (symbol) {

                    this.selectSymbol(
                        symbol
                    );

                }

            }

        }

    );

},


/* =====================================================
   ALERT SYSTEM
===================================================== */

setupAlertSystem() {

    if (

        !this.config.enableAlerts ||

        this.state.alertTimer

    ) {
        return;
    }


    console.log(
        `🔔 Alert scanner set to ${this.config.alertInterval / 1000} seconds.`
    );


    /*
       First check.
    */

    this.scanAlerts();


    /*
       Continuous scanner.
    */

    this.state.alertTimer =
        setInterval(

            () => {

                this.scanAlerts();

            },

            this.config.alertInterval

        );

},


/* =====================================================
   ALERT SCANNER

   This scans for alerts generated by:

   • Watchlist
   • app.js
   • Custom alert objects
   • Browser events

   EXPECTED ALERT FORMAT:

   window.ROLYFEAlerts = [

       {
           symbol: "AAPL",
           message: "AAPL Breakout Alert",
           level: "info",
           active: true
       }

   ];

===================================================== */

scanAlerts() {

    if (
        !this.config.enableAlerts
    ) {
        return;
    }


    let alerts = [];


    /*
       SUPPORT MULTIPLE ALERT SOURCES
    */

    if (
        Array.isArray(
            window.ROLYFEAlerts
        )
    ) {

        alerts =
            alerts.concat(
                window.ROLYFEAlerts
            );

    }


    if (
        Array.isArray(
            window.roLyfeAlerts
        )
    ) {

        alerts =
            alerts.concat(
                window.roLyfeAlerts
            );

    }


    /*
       WATCHLIST ALERT FUNCTION
    */

    if (

        window.Watchlist &&

        typeof window.Watchlist.getAlerts ===
        "function"

    ) {

        try {

            const watchlistAlerts =
                window.Watchlist.getAlerts();


            if (
                Array.isArray(
                    watchlistAlerts
                )
            ) {

                alerts =
                    alerts.concat(
                        watchlistAlerts
                    );

            }

        }

        catch (error) {

            console.warn(
                "Watchlist alert scan error:",
                error
            );

        }

    }


    /*
       PROCESS ALERTS
    */

    alerts.forEach(

        alertData => {

            if (
                !alertData
            ) {
                return;
            }


            if (
                alertData.active === false
            ) {
                return;
            }


            this.triggerAlert(
                alertData
            );

        }

    );

},


/* =====================================================
   TRIGGER POPUP ALERT
===================================================== */

triggerAlert(alertData = {}) {

    const symbol =
        String(
            alertData.symbol ||
            this.state.currentSymbol ||
            "MARKET"
        )
        .toUpperCase();


    const message =
        alertData.message ||
        alertData.text ||
        `${symbol} has a new alert.`;


    const level =
        alertData.level ||
        alertData.type ||
        "info";


    /*
       UNIQUE ALERT KEY
    */

    const alertKey =
        alertData.id ||

        `${symbol}-${message}`;


    const now =
        Date.now();


    const lastAlert =
        this.state.lastAlertTimes[
            alertKey
        ] || 0;


    /*
       PREVENT POPUP SPAM.
    */

    if (

        now - lastAlert <

        this.config.alertCooldown

    ) {

        return;

    }


    this.state.lastAlertTimes[
        alertKey
    ] =
        now;


    console.log(
        "🔔 RO'LYFE ALERT:",
        {

            symbol,

            message,

            level

        }

    );


    /*
       BROWSER NOTIFICATION
    */

    this.showBrowserNotification({

        symbol,

        message

    });


    /*
       RO'LYFE POPUP
    */

    this.showAlertPopup({

        symbol,

        message,

        level

    });


    /*
       BROADCAST EVENT
    */

    window.dispatchEvent(

        new CustomEvent(

            "roLyfeAlert",

            {

                detail: {

                    symbol,

                    message,

                    level,

                    timestamp:
                        now

                }

            }

        )

    );

},


/* =====================================================
   RO'LYFE POPUP ALERT
===================================================== */

showAlertPopup({

    symbol,

    message,

    level = "info"

}) {

    /*
       Remove old popup.
    */

    const existing =
        document.getElementById(
            "roLyfeAlertPopup"
        );


    if (existing) {

        existing.remove();

    }


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "roLyfeAlertPopup";


    popup.className =
        `rolyfe-alert-popup ${level}`;


    popup.innerHTML = `

        <div class="rolyfe-alert-header">

            <span>
                🔔 RO'LYFE ALERT
            </span>

            <button
                type="button"
                class="rolyfe-alert-close"
            >
                ×
            </button>

        </div>

        <div class="rolyfe-alert-symbol">

            ${symbol}

        </div>

        <div class="rolyfe-alert-message">

            ${message}

        </div>

        <button
            type="button"
            class="rolyfe-alert-chart"
        >

            📈 VIEW CHART

        </button>

    `;


    document.body.appendChild(
        popup
    );


    /*
       CLOSE BUTTON
    */

    popup
        .querySelector(
            ".rolyfe-alert-close"
        )
        .addEventListener(

            "click",

            () => {

                popup.remove();

            }

        );


    /*
       VIEW CHART BUTTON
    */

    popup
        .querySelector(
            ".rolyfe-alert-chart"
        )
        .addEventListener(

            "click",

            () => {

                this.selectSymbol(
                    symbol
                );


                popup.remove();

            }

        );


    /*
       AUTO CLOSE
    */

    setTimeout(

        () => {

            if (
                document.body.contains(
                    popup
                )
            ) {

                popup.remove();

            }

        },

        12000

    );

},


/* =====================================================
   BROWSER NOTIFICATION
===================================================== */

showBrowserNotification({

    symbol,

    message

}) {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission ===
        "granted"
    ) {

        new Notification(

            `🔔 RO'LYFE: ${symbol}`,

            {

                body:
                    message

            }

        );

    }


    else if (
        Notification.permission ===
        "default"
    ) {

        Notification
            .requestPermission()
            .catch(
                () => {}
            );

    }

},


/* =====================================================
   MANUAL ALERT

   Use anywhere:

   TradeController.manualAlert(
       "AAPL",
       "AAPL broke above resistance",
       "success"
   );

===================================================== */

manualAlert(

    symbol,

    message,

    level = "info"

) {

    this.triggerAlert({

        id:
            `manual-${symbol}-${Date.now()}`,

        symbol,

        message,

        level,

        active:
            true

    });

},


/* =====================================================
   STOP ALERT SCANNER
===================================================== */

stopAlerts() {

    if (
        this.state.alertTimer
    ) {

        clearInterval(
            this.state.alertTimer
        );


        this.state.alertTimer =
            null;

    }


    console.log(
        "🔕 RO'LYFE alert scanner stopped."
    );

},


/* =====================================================
   START ALERT SCANNER
===================================================== */

startAlerts() {

    this.stopAlerts();

    this.setupAlertSystem();

}

};

/* =========================================================
GLOBAL EXPORT
========================================================= */

window.TradeController =
TradeController;

/* =========================================================
AUTO INITIALIZATION
========================================================= */

document.addEventListener(

"DOMContentLoaded",

() => {

    TradeController.init();

}

);

/* =========================================================
SYSTEM READY
========================================================= */

console.log(
"🎯 RO'LYFE MASTER TRADE CONTROLLER ONLINE"
);
