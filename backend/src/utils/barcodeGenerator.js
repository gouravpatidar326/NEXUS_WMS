/**
 * WMS Barcode Generation Utility
 * Generates structured 128-bit barcode string identifying Product + Lot + Company
 */
const generateWmsBarcode = ({ companyId, productId, lotId }) => {
  const compPrefix = (companyId || 'NEXUS').substring(0, 4).toUpperCase();
  const prodPrefix = (productId || 'PROD').substring(0, 6).toUpperCase();
  const lotPrefix = (lotId || 'LOT').substring(0, 8).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `WMS-${compPrefix}-${prodPrefix}-${lotPrefix}-${randomSuffix}`;
};

module.exports = {
  generateWmsBarcode,
};
