export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || '₹'; // Default to Rupees if not found
};

export const getCurrencyName = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.name || 'Indian Rupee';
};

export const formatAmount = (amount: number, currencyCode: string = 'INR'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Check if the amount is a whole number
  const isWholeNumber = amount % 1 === 0;
  
  if (isWholeNumber) {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const formatAmountWithSign = (amount: number, currencyCode: string = 'INR'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const isWholeNumber = amount % 1 === 0;
  const absAmount = Math.abs(amount);
  
  let formattedAmount;
  if (isWholeNumber) {
    formattedAmount = `${symbol}${absAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    formattedAmount = `${symbol}${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Add sign prefix
  if (amount > 0) {
    return `+${formattedAmount}`;
  } else if (amount < 0) {
    return `-${formattedAmount}`;
  } else {
    return formattedAmount;
  }
};