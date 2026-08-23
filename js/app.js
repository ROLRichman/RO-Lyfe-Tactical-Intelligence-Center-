/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MAIN APPLICATION ENGINE
   js/app.js

   CENTRAL APPLICATION CONTROLLER

   SYSTEMS:
   • Market Status
   • Option Expiration
   • Trade Planner
   • Risk Engine
   • Ladder Engine
   • Trade Journal
   • Local Storage
   • Dashboard Refresh
   • System Health
========================================================= */


const ROLyfeApp = {

    /* =====================================================
       APPLICATION INFORMATION
    ===================================================== */

    name:
        "RO'LYFE TACTICAL INTELLIGENCE CENTER™",

    version:
        "1.0",

    initialized:
        false,


    /* =====================================================
       INITIALIZE APPLICATION
    ===================================================== */

    init() {

        if (this.initialized) {

            console.log(
                "⚠️ RO'LYFE RTIC already initialized."
            );

            return;
        }


        console.log(
            "🔥 INITIALIZING RO'LYFE TACTICAL INTELLIGENCE CENTER™"
        );


        this.checkSystems();


        this.updateMarketStatus();


        this.updateSystemStatus();


        this.bindGlobalEvents();


        this.refreshDashboard();


        this.initialized =
            true;


        console.log(
            "🟢 RO'LYFE RTIC SYSTEM ONLINE"
        );

    },


    /* =====================================================
       SYSTEM HEALTH CHECK
    ===================================================== */

    checkSystems() {

        const systems = {

            riskEngine:
                !!window.ROLyfeRiskEngine,

            ladderEngine:
                !!window.ROLyfeLadderEngine,

            tradePlanner:
                !!window.TradePlanner,

            tradeJournal:
                !!window.TradeJournal

        };


        console.group(
            "🧠 RO'LYFE RTIC SYSTEM CHECK"
        );


        Object.entries(systems)
            .forEach(

                ([name, online]) => {

                    console.log(

                        online
                            ? `🟢 ${name} ONLINE`
                            : `🔴 ${name} OFFLINE`

                    );

                }

            );


        console.groupEnd();


        return systems;

    },


    /* =====================================================
       DATE FORMATTER

       Converts JavaScript Date into:

       YYYY-MM-DD

       Used by HTML date inputs.
    ===================================================== */

    formatDateForInput(date) {

        if (!(date instanceof Date)) {

            date =
                new Date(date);

        }


        if (isNaN(date.getTime())) {

            return "";

        }


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

    },


    /* =====================================================
       OPTION EXPIRATION ENGINE

       SUPPORTED TYPES:

       0dte
       friday
       thisFriday
       next
       nextFriday
       custom
    ===================================================== */

    setExpiration(type) {

        const expirationInput =
            document.getElementById(
                "expiration"
            );


        if (!expirationInput) {

            console.warn(
                "⚠️ Expiration input not found."
            );

            return null;

        }


        const today =
            new Date();


        /*
           Remove time for clean date calculations.
        */

        today.setHours(
            0,
            0,
            0,
            0
        );


        let selectedDate =
            new Date(today);


        const normalizedType =
            String(type || "")
                .trim()
                .toLowerCase();


        /* =============================================
           0DTE — TODAY
        ============================================= */

        if (
            normalizedType === "0dte" ||
            normalizedType === "today"
        ) {

            selectedDate =
                new Date(today);

        }


        /* =============================================
           THIS FRIDAY

           If today is Friday:
           selects today.
        ============================================= */

        else if (

            normalizedType === "friday" ||
            normalizedType === "thisfriday"

        ) {

            const day =
                today.getDay();


            const daysUntilFriday =
                (5 - day + 7) % 7;


            selectedDate =
                new Date(today);


            selectedDate.setDate(

                today.getDate() +
                daysUntilFriday

            );

        }


        /* =============================================
           NEXT EXPIRATION

           Next Friday.

           If today is Friday:
           selects next week's Friday.
        ============================================= */

        else if (

            normalizedType === "next" ||
            normalizedType === "nextexpiration"

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


            selectedDate =
                new Date(today);


            selectedDate.setDate(

                today.getDate() +
                daysUntilFriday

            );

        }


        /* =============================================
           NEXT FRIDAY

           Always skips the current Friday.
        ============================================= */

        else if (

            normalizedType === "nextfriday"

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


            /*
               If next Friday calculation gives
               this week's Friday, move forward
               another 7 days.
            */

            selectedDate =
                new Date(today);


            selectedDate.setDate(

                today.getDate() +
                daysUntilFriday +
                (
                    day < 5
                        ? 7
                        : 0
                )

            );

        }


        /* =============================================
           CUSTOM DATE
        ============================================= */

        else if (

            normalizedType === "custom"

        ) {

            expirationInput.focus();


            if (

                typeof expirationInput.showPicker ===
                "function"

            ) {

                expirationInput.showPicker();

            }


            return null;

        }


        else {

            console.warn(

                "⚠️ Unknown expiration type:",

                type

            );


            return null;

        }


        const formattedDate =
            this.formatDateForInput(
                selectedDate
            );


        expirationInput.value =
            formattedDate;


        /*
           Trigger change event so any future
           systems can react automatically.
        */

        expirationInput.dispatchEvent(

            new Event(
                "change",
                {
                    bubbles:
                        true
                }
            )

        );


        console.log(

            "📅 RO'LYFE Expiration Selected:",

            normalizedType,

            formattedDate

        );


        return formattedDate;

    },


    /* =====================================================
       MARKET STATUS SYSTEM

       CURRENT VERSION:
       UI STATUS ONLY

       FUTURE:
       • Live SPY price
       • Live QQQ price
       • VIX
       • Market open / closed
       • Pre-market
       • After-hours
       • Economic events
    ===================================================== */

    updateMarketStatus() {

        const spyStatus =
            document.getElementById(
                "spyStatus"
            );


        const qqqStatus =
            document.getElementById(
                "qqqStatus"
            );


        const vixStatus =
            document.getElementById(
                "vixStatus"
            );


        const marketStatus =
            document.getElementById(
                "marketStatus"
            );


        if (spyStatus) {

            spyStatus.textContent =
                "SCANNING 📡";

        }


        if (qqqStatus) {

            qqqStatus.textContent =
                "SCANNING 📡";

        }


        if (vixStatus) {

            vixStatus.textContent =
                "MONITORING ⚡";

        }


        if (marketStatus) {

            marketStatus.textContent =
                this.getMarketSession();

        }

    },


    /* =====================================================
       MARKET SESSION ESTIMATOR

       Eastern Time approximation.

       Future version can be replaced
       with real exchange data.
    ===================================================== */

    getMarketSession() {

        const now =
            new Date();


        /*
           Convert to New York time.
        */

        const nyTimeString =
            now.toLocaleString(

                "en-US",

                {
                    timeZone:
                        "America/New_York"
                }

            );


        const nyTime =
            new Date(
                nyTimeString
            );


        const day =
            nyTime.getDay();


        const hours =
            nyTime.getHours();


        const minutes =
            nyTime.getMinutes();


        const totalMinutes =
            (hours * 60) +
            minutes;


        /*
           Weekend
        */

        if (

            day === 0 ||
            day === 6

        ) {

            return "MARKET CLOSED 💤";

        }


        /*
           Pre-market
           4:00 AM – 9:30 AM
        */

        if (

            totalMinutes >= 240 &&
            totalMinutes < 570

        ) {

            return "PRE-MARKET ⚡";

        }


        /*
           Regular Market
           9:30 AM – 4:00 PM
        */

        if (

            totalMinutes >= 570 &&
            totalMinutes < 960

        ) {

            return "MARKET OPEN 🟢";

        }


        /*
           After Hours
           4:00 PM – 8:00 PM
        */

        if (

            totalMinutes >= 960 &&
            totalMinutes < 1200

        ) {

            return "AFTER HOURS 🌙";

        }


        return "MARKET CLOSED 🔴";

    },


    /* =====================================================
       SYSTEM STATUS
    ===================================================== */

    updateSystemStatus() {

        const systemStatus =
            document.getElementById(
                "systemStatus"
            );


        const statusText =
            "SYSTEM ONLINE 🟢";


        if (systemStatus) {

            systemStatus.textContent =
                statusText;

        }


        console.log(

            "🧠 RO'LYFE RTIC:",
            statusText

        );


        return statusText;

    },


    /* =====================================================
       REFRESH DASHBOARD

       Central refresh command.

       Updates:

       • Journal
       • Journal Stats
       • Market Status
       • System Status
    ===================================================== */

    refreshDashboard() {

        console.log(
            "🔄 Refreshing RO'LYFE Dashboard..."
        );


        this.updateMarketStatus();


        this.updateSystemStatus();


        /*
           Trade Journal
        */

        if (

            window.TradeJournal &&
            typeof window.TradeJournal.renderJournal ===
            "function"

        ) {

            window.TradeJournal.renderJournal();

        }


        /*
           Future dashboard modules can be
           connected here.
        */

        document.dispatchEvent(

            new CustomEvent(

                "roLyfeDashboardRefresh",

                {

                    detail: {

                        timestamp:
                            Date.now()

                    }

                }

            )

        );

    },


    /* =====================================================
       CREATE TRADE PLAN

       Central shortcut.
    ===================================================== */

    createTradePlan() {

        if (

            !window.TradePlanner ||
            typeof window.TradePlanner.createPlan !==
            "function"

        ) {

            console.error(
                "🔴 Trade Planner Engine unavailable."
            );

            alert(
                "Trade Planner Engine is not loaded."
            );

            return null;

        }


        const plan =
            window.TradePlanner.createPlan();


        if (plan) {

            this.refreshDashboard();

        }


        return plan;

    },


    /* =====================================================
       SAVE CURRENT TRADE PLAN
    ===================================================== */

    saveTradePlan() {

        if (

            !window.TradePlanner ||
            typeof window.TradePlanner.savePlan !==
            "function"

        ) {

            alert(
                "Trade Planner Engine is not loaded."
            );

            return false;

        }


        const result =
            window.TradePlanner.savePlan();


        this.refreshDashboard();


        return result;

    },


    /* =====================================================
       ADD CURRENT PLAN TO JOURNAL
    ===================================================== */

    addTradeToJournal() {

        if (

            !window.TradeJournal ||
            typeof window.TradeJournal.addTrade !==
            "function"

        ) {

            alert(
                "Trade Journal Engine is not loaded."
            );

            return false;

        }


        const result =
            window.TradeJournal.addTrade();


        this.refreshDashboard();


        return result;

    },


    /* =====================================================
       GET SAVED TRADE PLANS
    ===================================================== */

    getSavedPlans() {

        if (

            window.TradePlanner &&
            typeof window.TradePlanner.loadPlans ===
            "function"

        ) {

            return window.TradePlanner.loadPlans();

        }


        return [];

    },


    /* =====================================================
       GET JOURNAL TRADES
    ===================================================== */

    getJournalTrades() {

        if (

            window.TradeJournal &&
            typeof window.TradeJournal.getTrades ===
            "function"

        ) {

            return window.TradeJournal.getTrades();

        }


        return [];

    },


    /* =====================================================
       APPLICATION STORAGE SUMMARY
    ===================================================== */

    getStorageSummary() {

        const plans =
            this.getSavedPlans();


        const trades =
            this.getJournalTrades();


        const openTrades =
            trades.filter(

                trade =>
                    trade.status === "OPEN"

            ).length;


        const closedTrades =
            trades.filter(

                trade =>

                    trade.status === "WIN" ||
                    trade.status === "LOSS"

            ).length;


        return {

            savedPlans:
                plans.length,

            totalTrades:
                trades.length,

            openTrades,

            closedTrades,

            currentPlan:
                window.currentTradePlan ||
                null

        };

    },


    /* =====================================================
       GLOBAL EVENTS
    ===================================================== */

    bindGlobalEvents() {

        /*
           Listen for journal updates.
        */

        document.addEventListener(

            "roLyfeJournalUpdated",

            () => {

                console.log(
                    "📓 Journal Updated"
                );

                this.refreshDashboard();

            }

        );


        /*
           Listen for trade plan creation.
        */

        document.addEventListener(

            "roLyfeTradePlanCreated",

            event => {

                console.log(

                    "🎯 Trade Plan Created Event:",

                    event.detail

                );

            }

        );

    },


    /* =====================================================
       AUTO REFRESH

       Refresh market/system status every minute.
    ===================================================== */

    startAutoRefresh() {

        setInterval(

            () => {

                this.updateMarketStatus();


                this.updateSystemStatus();

            },

            60000

        );

    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        console.log(
            "🔥 RO'LYFE TACTICAL INTELLIGENCE CENTER™ LOADED"
        );


        ROLyfeApp.init();


        ROLyfeApp.startAutoRefresh();


        /*
           Make sure journal renders after
           all engines are available.
        */

        if (

            window.TradeJournal &&
            typeof window.TradeJournal.renderJournal ===
            "function"

        ) {

            window.TradeJournal.renderJournal();

        }

    }

);


/* =========================================================
   GLOBAL APP ACCESS
========================================================= */

window.ROLyfeApp =
    ROLyfeApp;


/* =========================================================
   BACKWARD COMPATIBILITY

   Your existing HTML can continue using:

   setExpiration()
   updateMarketStatus()
   updateSystemStatus()
========================================================= */

window.setExpiration =
    function (type) {

        return ROLyfeApp.setExpiration(
            type
        );

    };


window.formatDateForInput =
    function (date) {

        return ROLyfeApp.formatDateForInput(
            date
        );

    };


window.updateMarketStatus =
    function () {

        return ROLyfeApp.updateMarketStatus();

    };


window.updateSystemStatus =
    function () {

        return ROLyfeApp.updateSystemStatus();

    };


/* =========================================================
   TRADE PLANNER SHORTCUTS
========================================================= */

window.createTradePlan =
    function () {

        return ROLyfeApp.createTradePlan();

    };


window.saveTradePlan =
    function () {

        return ROLyfeApp.saveTradePlan();

    };


window.addTradeToJournal =
    function () {

        return ROLyfeApp.addTradeToJournal();

    };


window.refreshROLyfeDashboard =
    function () {

        return ROLyfeApp.refreshDashboard();

    };


console.log(
    "🧠 RO'LYFE APP ENGINE READY"
);
