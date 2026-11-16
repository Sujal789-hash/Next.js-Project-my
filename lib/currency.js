/**
 * Indian Rupee (INR - ₹) Formatting Utilities
 */

export function formatINR(amount, compact = true) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);

  if (compact) {
    if (num >= 10000000) {
      const cr = num / 10000000;
      return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
    }
    if (num >= 100000) {
      const l = num / 100000;
      return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} Lakh`;
    }
    if (num >= 1000) {
      const k = num / 1000;
      return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
  }

  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatINRLakhCr(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  if (num >= 100000) {
    const l = num / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}
