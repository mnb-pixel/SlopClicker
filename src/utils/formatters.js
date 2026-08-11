// Number formatting & building cost calculation utilities

const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UnDc', 'DuDc', 'TrDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vig'
];

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num < 1000) {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }

  let i = 0;
  let n = num;
  while (n >= 1000 && i < SUFFIXES.length - 1) {
    n /= 1000;
    i++;
  }

  return `${n.toFixed(2)}${SUFFIXES[i]}`;
}

export function formatCurrency(num) {
  return `$${formatNumber(num)}`;
}

// Exact valuation formatter for the main header counter (no "K" collapse under 1,000,000)
export function formatExactValuation(num) {
  if (num === null || num === undefined || isNaN(num)) return '$0';
  if (num < 1000000) {
    return `$${Math.floor(num).toLocaleString('en-US')}`;
  }
  return formatCurrency(num);
}

// Formula: Cost = BaseCost * (1.15 ^ n)
export function getBuildingCost(baseCost, count) {
  return Math.floor(baseCost * Math.pow(1.15, count));
}

// Calculate total cost to buy `k` buildings from current count `n`
export function getBuildingBulkCost(baseCost, currentCount, buyAmount) {
  let totalCost = 0;
  for (let i = 0; i < buyAmount; i++) {
    totalCost += getBuildingCost(baseCost, currentCount + i);
  }
  return totalCost;
}

// Calculate max affordable buildings given current money
export function getMaxAffordableBuildings(baseCost, currentCount, availableMoney) {
  let count = 0;
  let totalCost = 0;
  while (true) {
    const nextCost = getBuildingCost(baseCost, currentCount + count);
    if (totalCost + nextCost > availableMoney) break;
    totalCost += nextCost;
    count++;
    if (count >= 10000) break; // upper safety limit
  }
  return { count, totalCost };
}
