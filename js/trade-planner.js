<!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8"><meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>
    RO'LYFE Tactical Intelligence Center™
</title>

<style>

/* =========================================================
   RO'LYFE TACTICAL INTELLIGENCE CENTER™
   MASTER TRADE PLANNER ENGINE
========================================================= */
    :root {

        --bg:
            #08110c;

        --panel:
            #101b14;

        --panel-2:
            #15241a;

        --border:
            #2a4933;

        --green:
            #39ff88;

        --green-dark:
            #159447;

        --gold:
            #f5c542;

        --red:
            #ff5c5c;

        --text:
            #f2f7f3;

        --muted:
            #a9b7ae;

    }


    * {

        box-sizing:
            border-box;

    }


    body {

        margin:
            0;

        font-family:
            Arial,
            Helvetica,
            sans-serif;

        background:
            var(--bg);

        color:
            var(--text);

    }


    /* ============================================
       HEADER
    ============================================ */

    .app-header {

        padding:
            25px 20px;

        text-align:
            center;

        border-bottom:
            1px solid var(--border);

        background:
            linear-gradient(
                135deg,
                #07110b,
                #102817
            );

    }


    .app-header h1 {

        margin:
            0;

        color:
            var(--green);

        font-size:
            clamp(
                24px,
                5vw,
                42px
            );

    }


    .app-header p {

        margin:
            10px 0 0;

        color:
            var(--muted);

    }


    /* ============================================
       MAIN CONTAINER
    ============================================ */

    .container {

        width:
            min(
                1200px,
                95%
            );

        margin:
            30px auto 60px;

    }


    /* ============================================
       GRID
    ============================================ */

    .planner-grid {

        display:
            grid;

        grid-template-columns:
            repeat(
                auto-fit,
                minmax(
                    300px,
                    1fr
                )
            );

        gap:
            20px;

    }


    /* ============================================
       CARD
    ============================================ */

    .card {

        background:
            var(--panel);

        border:
            1px solid var(--border);

        border-radius:
            14px;

        padding:
            20px;

        box-shadow:
            0 10px 30px
            rgba(
                0,
                0,
                0,
                .25
            );

    }


    .card h2 {

        margin-top:
            0;

        color:
            var(--green);

        font-size:
            18px;

        border-bottom:
            1px solid var(--border);

        padding-bottom:
            10px;

    }


    /* ============================================
       FORM
    ============================================ */

    .field {

        margin-bottom:
            14px;

    }


    label {

        display:
            block;

        margin-bottom:
            6px;

        font-size:
            13px;

        color:
            var(--muted);

    }


    input,
    select {

        width:
            100%;

        padding:
            12px;

        border-radius:
            8px;

        border:
            1px solid var(--border);

        background:
            #07100a;

        color:
            var(--text);

        outline:
            none;

    }


    input:focus,
    select:focus {

        border-color:
            var(--green);

        box-shadow:
            0 0 0 2px
            rgba(
                57,
                255,
                136,
                .12
            );

    }


    .row {

        display:
            grid;

        grid-template-columns:
            repeat(
                2,
                1fr
            );

        gap:
            12px;

    }


    /* ============================================
       BUTTONS
    ============================================ */

    .button-row {

        display:
            flex;

        flex-wrap:
            wrap;

        gap:
            12px;

        margin:
            25px 0;

    }


    button {

        border:
            none;

        padding:
            14px 20px;

        border-radius:
            9px;

        cursor:
            pointer;

        font-weight:
            bold;

        transition:
            .2s ease;

    }


    button:hover {

        transform:
            translateY(-2px);

    }


    .primary-button {

        background:
            var(--green);

        color:
            #031008;

        flex:
            1;

        min-width:
            200px;

    }


    .secondary-button {

        background:
            var(--panel-2);

        color:
            var(--text);

        border:
            1px solid var(--border);

    }


    /* ============================================
       OUTPUT
    ============================================ */

    #tradePlanOutput {

        margin-top:
            25px;

    }


    .trade-plan-card {

        background:
            var(--panel);

        border:
            1px solid var(--green);

        border-radius:
            15px;

        padding:
            25px;

    }


    .trade-plan-card h3 {

        margin-top:
            0;

        color:
            var(--green);

        text-align:
            center;

    }


    .plan-status {

        display:
            inline-block;

        padding:
            6px 12px;

        border-radius:
            20px;

        background:
            rgba(
                57,
                255,
                136,
                .12
            );

        color:
            var(--green);

        font-size:
            12px;

        font-weight:
            bold;

        margin-bottom:
            20px;

    }


    .plan-section {

        background:
            var(--panel-2);

        border:
            1px solid var(--border);

        border-radius:
            12px;

        padding:
            18px;

        margin:
            15px 0;

    }


    .plan-section h4 {

        margin:
            0 0 14px;

        color:
            var(--gold);

    }


    .plan-section p {

        margin:
            9px 0;

    }


    .target-result {

        padding:
            14px;

        margin:
            12px 0;

        background:
            rgba(
                0,
                0,
                0,
                .15
            );

        border-left:
            3px solid var(--green);

        border-radius:
            8px;

    }


    .result-line {

        display:
            flex;

        flex-wrap:
            wrap;

        gap:
            12px;

        margin:
            10px 0;

        font-size:
            13px;

        color:
            var(--muted);

    }


    .runner-box {

        margin-top:
            15px;

        padding:
            15px;

        border:
            1px dashed var(--gold);

        border-radius:
            8px;

        color:
            var(--gold);

    }


    .plan-date {

        color:
            var(--muted);

        font-size:
            12px;

    }


    .trade-plan-actions {

        display:
            flex;

        flex-wrap:
            wrap;

        gap:
            10px;

        margin-top:
            20px;

    }


    .trade-plan-actions button {

        background:
            var(--green);

        color:
            #031008;

    }


    @media (
        max-width:
        600px
    ) {

        .row {

            grid-template-columns:
                1fr;

        }

    }

</style>

</head><body><!-- ============================================
     HEADER
============================================= -->

<header class="app-header">

    <h1>
        🎯 RO'LYFE TACTICAL INTELLIGENCE CENTER™
    </h1>

    <p>
        PLAN → SIZE → LADDER → EXECUTE → JOURNAL → REVIEW
    </p>

    <p>
        Trade Smart. Stay Disciplined. Protect Your Capital.
    </p>

</header>



<main class="container">


    <!-- ========================================
         MASTER TRADE PLANNER
    ========================================= -->

    <div class="planner-grid">


        <!-- ====================================
             BASIC TRADE INFORMATION
        ===================================== -->

        <section class="card">

            <h2>
                📋 Trade Information
            </h2>


            <div class="field">

                <label>
                    Symbol
                </label>

                <input
                    type="text"
                    id="symbol"
                    placeholder="Example: NVDA"
                >

            </div>


            <div class="row">


                <div class="field">

                    <label>
                        Instrument
                    </label>

                    <select id="instrument">

                        <option value="Stock">
                            Stock
                        </option>

                        <option value="Option">
                            Option
                        </option>

                        <option value="Crypto">
                            Crypto
                        </option>

                    </select>

                </div>


                <div class="field">

                    <label>
                        Direction
                    </label>

                    <select id="direction">

                        <option value="Long">
                            Long
                        </option>

                        <option value="Short">
                            Short
                        </option>

                    </select>

                </div>


            </div>


        </section>



        <!-- ====================================
             ACCOUNT / RISK
        ===================================== -->

        <section class="card">

            <h2>
                🛡️ Account & Risk
            </h2>


            <div class="field">

                <label>
                    Account Size
                </label>

                <input
                    type="number"
                    id="accountSize"
                    placeholder="10000"
                    step="any"
                >

            </div>


            <div class="field">

                <label>
                    Risk Percentage
                </label>

                <input
                    type="number"
                    id="riskPercent"
                    placeholder="1"
                    step="0.01"
                >

            </div>


            <div class="field">

                <label>
                    Trade Probability %
                </label>

                <input
                    type="number"
                    id="probability"
                    placeholder="70"
                    min="0"
                    max="100"
                    step="1"
                >

            </div>


            <div class="field">

                <label>
                    Implied Volatility %
                </label>

                <input
                    type="number"
                    id="impliedVolatility"
                    placeholder="45"
                    step="0.01"
                >

            </div>


        </section>



        <!-- ====================================
             STOCK TRADE MAP
        ===================================== -->

        <section class="card">

            <h2>
                📈 Stock / Asset Map
            </h2>


            <div class="field">

                <label>
                    Entry Price
                </label>

                <input
                    type="number"
                    id="entry"
                    placeholder="180"
                    step="any"
                >

            </div>


            <div class="field">

                <label>
                    Stop Loss
                </label>

                <input
                    type="number"
                    id="stop"
                    placeholder="175"
                    step="any"
                >

            </div>


            <div class="row">


                <div class="field">

                    <label>
                        Manual TP1 (Optional)
                    </label>

                    <input
                        type="number"
                        id="target1"
                        placeholder="Auto 1R"
                        step="any"
                    >

                </div>


                <div class="field">

                    <label>
                        Manual TP2 (Optional)
                    </label>

                    <input
                        type="number"
                        id="target2"
                        placeholder="Auto 2R"
                        step="any"
                    >

                </div>


            </div>


            <div class="field">

                <label>
                    Manual TP3 (Optional)
                </label>

                <input
                    type="number"
                    id="target3"
                    placeholder="Auto 3R"
                    step="any"
                >

            </div>


        </section>



        <!-- ====================================
             OPTION EXECUTION
        ===================================== -->

        <section class="card">

            <h2>
                🎯 Option Execution
            </h2>


            <div class="row">


                <div class="field">

                    <label>
                        Option Type
                    </label>

                    <select id="optionType">

                        <option value="Call">
                            Call
                        </option>

                        <option value="Put">
                            Put
                        </option>

                    </select>

                </div>


                <div class="field">

                    <label>
                        Strike Price
                    </label>

                    <input
                        type="number"
                        id="strike"
                        placeholder="180"
                        step="any"
                    >

                </div>


            </div>


            <div class="field">

                <label>
                    Expiration
                </label>

                <input
                    type="date"
                    id="expiration"
                >

            </div>


            <div class="row">


                <div class="field">

                    <label>
                        Option Entry Premium
                    </label>

                    <input
                        type="number"
                        id="optionEntry"
                        placeholder="2.53"
                        step="0.01"
                    >

                </div>


                <div class="field">

                    <label>
                        Option Delta
                    </label>

                    <input
                        type="number"
                        id="optionDelta"
                        placeholder="0.50"
                        step="0.01"
                        min="-1"
                        max="1"
                    >

                </div>


            </div>


            <div class="row">


                <div class="field">

                    <label>
                        Option TP1
                    </label>

                    <input
                        type="number"
                        id="optionTarget1"
                        placeholder="3.00"
                        step="0.01"
                    >

                </div>


                <div class="field">

                    <label>
                        Option TP2
                    </label>

                    <input
                        type="number"
                        id="optionTarget2"
                        placeholder="4.00"
                        step="0.01"
                    >

                </div>


            </div>


            <div class="field">

                <label>
                    Option TP3
                </label>

                <input
                    type="number"
                    id="optionTarget3"
                    placeholder="5.00"
                    step="0.01"
                >

            </div>


        </section>


    </div>



    <!-- ========================================
         ACTION BUTTONS
    ========================================= -->

    <div class="button-row">

        <button
            class="primary-button"
            type="button"
            onclick="TradePlanner.createPlan()"
        >

            🎯 CREATE MASTER TRADE PLAN

        </button>


        <button
            class="secondary-button"
            type="button"
            onclick="TradePlanner.savePlan()"
        >

            💾 SAVE PLAN

        </button>


        <button
            class="secondary-button"
            type="button"
            onclick="TradePlanner.addToJournal()"
        >

            📓 ADD TO JOURNAL

        </button>


    </div>



    <!-- ========================================
         TRADE PLAN OUTPUT

         TradePlanner.displayPlan()
         writes the complete plan here.
    ========================================= -->

    <div
        id="tradePlanOutput"
    >

    </div>


</main>



<!-- ============================================
     JAVASCRIPT LOAD ORDER

     THIS ORDER MATTERS
============================================= -->


<!-- 1. RISK ENGINE FIRST -->

<script
    src="js/risk-engine.js"
></script>


<!-- 2. LADDER ENGINE SECOND -->

<script
    src="js/ladder-engine.js"
></script>


<!-- 3. TRADE JOURNAL -->

<script
    src="js/trade-journal.js"
></script>


<!-- 4. MASTER TRADE PLANNER LAST -->

<script
    src="js/trade-planner.js"
></script>

</body>
</html>
