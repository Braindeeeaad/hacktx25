import { Transaction, ProcessedData, Anomaly } from '../types';

export function processSpendingData(transactions: Transaction[]): ProcessedData {
  if (transactions.length === 0) {
    throw new Error('No transaction data provided');
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedTransactions[0].date);
  const endDate = new Date(sortedTransactions[sortedTransactions.length - 1].date);
  const spanDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate totals and averages
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageDaily = totalSpent / spanDays;

  // Group by category (filter out "Other" category)
  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    // Skip "Other" category as requested
    if (transaction.category.toLowerCase() === 'other') {
      return;
    }
    
    categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
    categoryCounts[transaction.category] = (categoryCounts[transaction.category] || 0) + 1;
  });

  const categoryAverages: Record<string, number> = {};
  Object.keys(categoryTotals).forEach(category => {
    categoryAverages[category] = categoryTotals[category] / categoryCounts[category];
  });

  // Group by week for trend analysis (filter out "Other" category)
  const weeklyData: Record<string, Record<string, number>> = {};
  transactions.forEach(transaction => {
    // Skip "Other" category as requested
    if (transaction.category.toLowerCase() === 'other') {
      return;
    }
    
    const date = new Date(transaction.date);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {};
    }
    weeklyData[weekKey][transaction.category] = 
      (weeklyData[weekKey][transaction.category] || 0) + transaction.amount;
  });

  // Calculate category changes (comparing first half vs second half of period)
  const categoryChanges: Record<string, string> = {};
  const midPoint = Math.floor(transactions.length / 2);
  const firstHalf = transactions.slice(0, midPoint);
  const secondHalf = transactions.slice(midPoint);

  const firstHalfTotals: Record<string, number> = {};
  const secondHalfTotals: Record<string, number> = {};

  firstHalf.forEach(t => {
    firstHalfTotals[t.category] = (firstHalfTotals[t.category] || 0) + t.amount;
  });

  secondHalf.forEach(t => {
    secondHalfTotals[t.category] = (secondHalfTotals[t.category] || 0) + t.amount;
  });

  Object.keys(categoryTotals).forEach(category => {
    const firstHalfTotal = firstHalfTotals[category] || 0;
    const secondHalfTotal = secondHalfTotals[category] || 0;
    
    if (firstHalfTotal > 0) {
      const change = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
      categoryChanges[category] = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    } else {
      categoryChanges[category] = secondHalfTotal > 0 ? '+100%' : '0%';
    }
  });

  // Detect anomalies (transactions that are 2+ standard deviations from category mean)
  const anomalies: Anomaly[] = [];
  Object.keys(categoryTotals).forEach(category => {
    const categoryTransactions = transactions.filter(t => t.category === category);
    const amounts = categoryTransactions.map(t => t.amount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    categoryTransactions.forEach(transaction => {
      if (Math.abs(transaction.amount - mean) > 2 * stdDev) {
        anomalies.push({
          id: `anomaly_${transaction.date}_${transaction.category}_${Date.now()}`,
          date: transaction.date,
          category: transaction.category,
          amount: transaction.amount,
          shortInsight: `Unusual ${transaction.category} spending: $${transaction.amount}`,
          detailedReason: `Unusually ${transaction.amount > mean ? 'high' : 'low'} ${transaction.category} spending on ${transaction.date}. This amount is ${Math.abs(transaction.amount - mean).toFixed(2)} ${transaction.amount > mean ? 'above' : 'below'} the average.`
        });
      }
    });
  });

  return {
    totalSpent,
    averageDaily,
    spanDays,
    categoryTotals,
    categoryAverages,
    categoryChanges,
    weeklyData,
    anomalies
  };
}

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

export function formatDataForGemini(processedData: ProcessedData, transactions: Transaction[]): string {
  const data = {
    summary: {
      totalSpent: processedData.totalSpent,
      averageDaily: processedData.averageDaily,
      spanDays: processedData.spanDays,
      categoryCount: Object.keys(processedData.categoryTotals).length
    },
    categories: Object.keys(processedData.categoryTotals).map(category => ({
      category,
      total: processedData.categoryTotals[category],
      average: processedData.categoryAverages[category],
      change: processedData.categoryChanges[category]
    })),
    weeklyBreakdown: processedData.weeklyData,
    anomalies: processedData.anomalies,
    rawTransactions: transactions.slice(0, 50) // Limit to first 50 for context
  };

  return JSON.stringify(data, null, 2);
}
