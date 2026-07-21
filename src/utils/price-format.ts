export const formatPrice = (value: number) => {
  if (value == null || isNaN(value)) return "";

  const num = parseFloat(value.toString());

  if (num >= 10000000) {
    // Crores
    const cr = num / 10000000;
    return cr.toFixed(2).replace(/\.00$/, "") + " Cr";
  } else if (num >= 100000) {
    // Lacs
    const lac = num / 100000;
    return lac.toFixed(2).replace(/\.00$/, "") + " Lac";
  } else {
    // Below 1 Lac - normal formatting
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
};
