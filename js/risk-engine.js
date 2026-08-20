/* =========================================
   RO'LYFE RTIC — RISK ENGINE
   Trade Smart. Stay Disciplined.
   Protect Your Capital. Trust the Process.
========================================= */

const ROLyfeRiskEngine = {

  calculateStock({
    accountBalance,
    riskPercent,
    entry,
    stop,
    direction = "long"
  }) {

    accountBalance = Number(accountBalance);
    riskPercent = Number(riskPercent);
    entry = Number(entry);
    stop = Number(stop);

    const dollarRisk = accountBalance * (riskPercent / 100);

    let riskPerShare;

    if (direction === "short") {
      riskPerShare = stop - entry;
    } else {
      riskPerShare = entry - stop;
    }

    if (
      !accountBalance ||
      !entry ||
      !stop ||
      riskPercent <= 0 ||
      riskPerShare <= 0
    ) {
      return {
        valid: false,
        error: "Check your entry, stop, direction, and risk percentage."
      };
    }

    const shares = Math.floor(dollarRisk / riskPerShare);

    const positionValue = shares * entry;

    return {
      valid: true,
      instrument: "stock",
      accountBalance,
      riskPercent,
      dollarRisk,
      entry,
      stop,
      direction,
      riskPerShare,
      shares,
      positionValue
    };
  },


  calculateCrypto({
    accountBalance,
    riskPercent,
    entry,
    stop,
    direction = "long"
  }) {

    const result = this.calculateStock({
      accountBalance,
      riskPercent,
      entry,
      stop,
      direction
    });

    if (!result.valid) return result;

    return {
      ...result,
      instrument: "crypto",
      quantity: result.dollarRisk / result.riskPerShare,
      shares: undefined
    };
  },


  calculateOption({
    accountBalance,
    riskPercent,
    stockEntry,
    stockStop,
    optionPremium,
    optionDelta,
    direction = "long",
    maxPremiumRisk = false
  }) {

    accountBalance = Number(accountBalance);
    riskPercent = Number(riskPercent);
    stockEntry = Number(stockEntry);
    stockStop = Number(stockStop);
    optionPremium = Number(optionPremium);
    optionDelta = Math.abs(Number(optionDelta));

    const dollarRisk = accountBalance * (riskPercent / 100);

    let stockMoveToStop;

    if (direction === "short") {
      stockMoveToStop = stockStop - stockEntry;
    } else {
      stockMoveToStop = stockEntry - stockStop;
    }

    if (
      !accountBalance ||
      !stockEntry ||
      !stockStop ||
      !optionPremium ||
      riskPercent <= 0 ||
      stockMoveToStop <= 0
    ) {
      return {
        valid: false,
        error: "Check stock entry, stock stop, option premium, and risk."
      };
    }

    /*
      CONTRACT COST
      Standard equity option = 100 shares
    */

    const contractCost = optionPremium * 100;


    /*
      OPTION LOSS ESTIMATE

      Basic delta estimate:

      Stock Move × Delta × 100

      This is an ESTIMATE only.

      Gamma, theta, IV and time can change
      the actual option price.
    */

    let estimatedOptionLossPerContract;

    if (optionDelta > 0) {

      estimatedOptionLossPerContract =
        stockMoveToStop *
        optionDelta *
        100;

    } else {

      /*
        Conservative fallback:

        Assume full premium risk.
      */

      estimatedOptionLossPerContract =
        contractCost;
    }


    /*
      CONTRACT SIZING
    */

    let contracts;

    if (maxPremiumRisk) {

      contracts = Math.floor(
        dollarRisk / contractCost
      );

    } else {

      contracts = Math.floor(
        dollarRisk / estimatedOptionLossPerContract
      );
    }


    /*
      Never force 1 contract.

      If the calculated size is 0,
      the trade exceeds the defined risk budget.
    */

    const affordable =
      contracts >= 1;


    const estimatedTotalRisk =
      contracts *
      (
        maxPremiumRisk
          ? contractCost
          : estimatedOptionLossPerContract
      );


    const totalPremiumExposure =
      contracts *
      contractCost;


    return {
      valid: affordable,

      instrument: "option",

      accountBalance,
      riskPercent,
      dollarRisk,

      stockEntry,
      stockStop,
      stockMoveToStop,

      optionPremium,
      optionDelta,

      contractCost,

      estimatedOptionLossPerContract,

      contracts,

      estimatedTotalRisk,

      totalPremiumExposure,

      maxPremiumRisk,

      error: affordable
        ? null
        : "One contract exceeds your defined risk budget."
    };
  },


  calculateRiskPercent(
    accountBalance,
    dollarRisk
  ) {

    accountBalance = Number(accountBalance);
    dollarRisk = Number(dollarRisk);

    if (
      accountBalance <= 0 ||
      dollarRisk <= 0
    ) {
      return 0;
    }

    return (
      dollarRisk /
      accountBalance
    ) * 100;
  },


  formatMoney(value) {

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD"
      }
    ).format(
      Number(value) || 0
    );
  }

};


/* =========================================
   GLOBAL HELPER
========================================= */

window.ROLyfeRiskEngine =
  ROLyfeRiskEngine;
