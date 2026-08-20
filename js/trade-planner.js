/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   TRADE PLANNER ENGINE
   js/trade-planner.js
========================================================= */

const TradePlanner = {

    createPlan() {

        const symbol = document.getElementById("symbol")?.value?.toUpperCase() || "";
        const instrument = document.getElementById("instrument")?.value || "Stock";
        const direction = document.getElementById("direction")?.value || "Long";

        const entry = parseFloat(document.getElementById("entry")?.value);
        const stop = parseFloat(document.getElementById("stop")?.value);

        const target1 = parseFloat(document.getElementById("target1")?.value);
        const target2 = parseFloat(document.getElementById("target2")?.value);
        const target3 = parseFloat(document.getElementById("target3")?.value);

        const accountSize = parseFloat(
            document.getElementById("accountSize")?.value
        );

        const riskPercent = parseFloat(
            document.getElementById("riskPercent")?.value
        );

        const expiration =
            document.getElementById("expiration")?.value || "N/A";

        const strike =
            document.getElementById("strike")?.value || "N/A";

        if (!symbol || isNaN(entry) || isNaN(stop)) {
            alert("Please enter Symbol, Entry and Stop.");
            return;
        }

        const riskPerUnit = Math.abs(entry - stop);

        let riskAmount = 0;

        if (!isNaN(accountSize) && !isNaN(riskPercent)) {
            riskAmount = accountSize * (riskPercent / 100);
        }

        const plan = {
            id: Date.now(),

            date: new Date().toLocaleString(),

            symbol: symbol,

            instrument: instrument,

            direction: direction,

            entry: entry,

            stop: stop,

            riskPerUnit: riskPerUnit,

            accountSize: accountSize || 0,

            riskPercent: riskPercent || 0,

            riskAmount: riskAmount,

            expiration: expiration,

            strike: strike,

            target1: target1 || null,

            target2: target2 || null,

            target3: target3 || null,

            status: "PLANNED"
        };

        window.currentTradePlan = plan;

        this.displayPlan(plan);

        return plan;
    },


    displayPlan(plan) {

        const output = document.getElementById("tradePlanOutput");

        if (!output) return;

        output.innerHTML = `
        
        <div class="trade-plan-card">

            <h3>🎯 RO'LYFE TRADE PLAN</h3>

            <div class="plan-status">
                ${plan.status}
            </div>

            <p>
                <strong>Symbol:</strong> ${plan.symbol}
            </p>

            <p>
                <strong>Instrument:</strong> ${plan.instrument}
            </p>

            <p>
                <strong>Direction:</strong> ${plan.direction}
            </p>

            <hr>

            <p>
                <strong>Entry:</strong> $${plan.entry.toFixed(2)}
            </p>

            <p>
                <strong>Stop:</strong> $${plan.stop.toFixed(2)}
            </p>

            <p>
                <strong>Risk Per Unit:</strong>
                $${plan.riskPerUnit.toFixed(2)}
            </p>

            <p>
                <strong>Risk Budget:</strong>
                $${plan.riskAmount.toFixed(2)}
            </p>

            <hr>

            <p>
                <strong>Target 1:</strong>
                ${plan.target1 ? "$" + plan.target1.toFixed(2) : "Not Set"}
            </p>

            <p>
                <strong>Target 2:</strong>
                ${plan.target2 ? "$" + plan.target2.toFixed(2) : "Not Set"}
            </p>

            <p>
                <strong>Target 3:</strong>
                ${plan.target3 ? "$" + plan.target3.toFixed(2) : "Not Set"}
            </p>

            <hr>

            <p>
                <strong>Strike:</strong> ${plan.strike}
            </p>

            <p>
                <strong>Expiration:</strong> ${plan.expiration}
            </p>

            <p class="plan-date">
                Created: ${plan.date}
            </p>

            <button onclick="TradePlanner.savePlan()">
                💾 SAVE TRADE PLAN
            </button>

        </div>
        `;
    },


    savePlan() {

        if (!window.currentTradePlan) {
            alert("Create a trade plan first.");
            return;
        }

        let plans = JSON.parse(
            localStorage.getItem("roLyfeTradePlans") || "[]"
        );

        plans.push(window.currentTradePlan);

        localStorage.setItem(
            "roLyfeTradePlans",
            JSON.stringify(plans)
        );

        alert(
            `${window.currentTradePlan.symbol} trade plan saved!`
        );
    },


    loadPlans() {

        return JSON.parse(
            localStorage.getItem("roLyfeTradePlans") || "[]"
        );
    },


    deletePlan(id) {

        let plans = this.loadPlans();

        plans = plans.filter(plan => plan.id !== id);

        localStorage.setItem(
            "roLyfeTradePlans",
            JSON.stringify(plans)
        );
    }

};
