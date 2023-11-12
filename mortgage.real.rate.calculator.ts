/*
 * Original command line tool which should be migrated to an UI app
 */
const monthsInOneYear = 12;

// Basic amortization formula https://mortgagecalculator.mes.fm/amortization-formula-proof
function getMonthlyPayment(loanValue: number, yearlyRate: number, years: number): number {
  const totalMonths = years * monthsInOneYear;
  const monthlyRate = yearlyRate / monthsInOneYear;
  return loanValue * monthlyRate * Math.pow((1 + monthlyRate), totalMonths) / (Math.pow((1 + monthlyRate), totalMonths) - 1);
}

function getTotalPayment(realMonthlyCosts: number, years: number): number {
  return realMonthlyCosts * monthsInOneYear * years;
}

function getYearlyRate(referenceRatePercent: number, marginalRatePercent: number): number {
  return (referenceRatePercent + marginalRatePercent) / 100;
}

const highestConsideredRatePercent = 100;
const rateIncrementPercent = 0.01
const numberOfConsideredRates = highestConsideredRatePercent * Math.ceil(1 / rateIncrementPercent);
const possibleRates = [...Array<number>(numberOfConsideredRates)].map((_, idx) =>
  rateIncrementPercent * idx * 0.01
);

/*
 * Inputs to compute the real interest rate for the suggested payment and the payment + extra costs.
 */

const bankName = 'My Bank';
const loanValue = 80000.00;
const bankMarginalRatePercent = 0.64;
// For example, Euribor 12 month
const referenceRatePercent = 3.00;
const years = 20;

const suggestedMonthlyPayment = 600.2;
// Insurance, protection from rising rates, etc.
const extraMonthlyCosts = 58.07;
// Premium paid to the bank when the loan agreement is made
const extraFixedLoanCosts = 600;

const referenceRatesPercentsToTest = [
  0.5, 1, 3, 6, 10, 15, 30
];

const suggestedYearlyRate = getYearlyRate(referenceRatePercent, bankMarginalRatePercent);

const tableOfRates = possibleRates.reduce((table: {[key: string]: number}, rate) => {
  const monthlyPayment = getMonthlyPayment(loanValue, rate, years);
  table[Math.ceil(monthlyPayment).toString()] = rate * 100;
  return table;
}, {});
const sortedMonthlyPaymentKeys = Object.keys(tableOfRates).map(key => parseInt(key, 10)).sort((x, y) => x - y);

function estimateRealRate(monthlyPayment: number): number {
  const nearestComputedMonthlyPaymentIndex = sortedMonthlyPaymentKeys.findIndex(payment => payment > monthlyPayment) - 1;
  return tableOfRates[sortedMonthlyPaymentKeys[nearestComputedMonthlyPaymentIndex]];
}

function reportCostsForYearlyRate(loanValue: number, yearlyRate: number, years: number, monthlyPayment: number = null): void {

  if (!monthlyPayment) {
    console.log(`## Loan costs with yearly rate ${yearlyRate * 100} %\n\n`)
    monthlyPayment = getMonthlyPayment(loanValue, yearlyRate, years);
  } else {
    console.log(`## Loan costs as suggested by the bank with the rate ${yearlyRate * 100} \n\n`)
  }

  console.log(`Monthly payment at the nominal loan interest rate of \`${yearlyRate * 100} %\` =\n\n \`${monthlyPayment}\`\n`);
  const monthlyCostsWithExtraCosts = monthlyPayment + extraMonthlyCosts;

  const totalPayment = getTotalPayment(monthlyCostsWithExtraCosts, years) + extraFixedLoanCosts;
  console.log(`Loan total value paid back =\n\n \`${totalPayment}\`\n`)
  
  const realYearlyRate = estimateRealRate(monthlyPayment);
  console.log(`Yearly rate with monthly payment of \`${monthlyPayment}\` =\n\n \`${realYearlyRate} %\`\n`);
  
  console.log(`Total monthly payment with extra costs =\n\n \`${monthlyCostsWithExtraCosts}\`\n`)
  const realYearlyRateExtraMonthlyCosts = estimateRealRate(monthlyCostsWithExtraCosts);
  console.log(`Yearly rate with monthly payment + extra costs \`${monthlyCostsWithExtraCosts}\` =\n\n \`${realYearlyRateExtraMonthlyCosts} %\`\n`);
  
  const fixedCostsMonthly = extraFixedLoanCosts / (years * monthsInOneYear);
  const fullMonthlyPayment = monthlyCostsWithExtraCosts + fixedCostsMonthly;
  const fullYearlyRate = estimateRealRate(fullMonthlyPayment);
  console.log(`Yearly rate with monthly payment + extra costs + fixed costs \`${fullMonthlyPayment}\` =\n\n \`${fullYearlyRate} %\`\n`);
}

console.log(`# ${bankName}`);
console.log(`# General loan information:\n\n`)
console.log(`Loan value =\n\n \`${loanValue}\`\n`);
console.log(`Suggested yearly interest rate =\n\n \`${suggestedYearlyRate * 100}\`\n`);
console.log(`Suggested monthly payment =\n\n \`${suggestedMonthlyPayment}\`\n`);
console.log(`Extra monthly costs =\n\n \`${extraMonthlyCosts}\`\n`);
console.log(`Loan fixed costs =\n\n \`${extraFixedLoanCosts}\`\n`);
console.log('\n');

console.log('# Loan real interest rates and costs:\n');
reportCostsForYearlyRate(loanValue, suggestedYearlyRate, years, suggestedMonthlyPayment);

console.log(`# Stress test:`);
referenceRatesPercentsToTest.forEach(possibleReferenceRatePercent=> {
  const possibleYearlyRate = getYearlyRate(possibleReferenceRatePercent, bankMarginalRatePercent);
  reportCostsForYearlyRate(loanValue, possibleYearlyRate, years);
});

