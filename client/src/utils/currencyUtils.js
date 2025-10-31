export function formatINR(amount) {
  if (amount === null || amount === undefined || amount === '') return '₹0';
  const num = Number(amount);
  if (Number.isNaN(num)) return `₹${amount}`;
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
  } catch (e) {
    return `₹${num}`;
  }
}
