export const categoryConfig = {
  mobile: [
    { name: 'imei', label: 'IMEI Number', type: 'text', placeholder: 'Enter IMEI' },
    { name: 'storage', label: 'Storage Variant', type: 'select', options: ['64GB', '128GB', '256GB', '512GB'] },
    { name: 'color', label: 'Color', type: 'text', placeholder: 'Enter Color' }
  ],
  grocery: [
    { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
    { name: 'batchNumber', label: 'Batch Number', type: 'text', placeholder: 'Enter Batch' },
    { name: 'foodType', label: 'Food Type', type: 'select', options: ['Veg', 'Non-Veg', 'Vegan'] }
  ],
  electronics: [
    { name: 'warranty', label: 'Warranty (Months)', type: 'number', placeholder: '12' },
    { name: 'power', label: 'Power Consumption (W)', type: 'number', placeholder: 'Enter Watts' }
  ],
  clothing: [
    { name: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'material', label: 'Material', type: 'text', placeholder: 'e.g. Cotton' }
  ]
};

export const getCategoryFields = (categoryName) => {
  if (!categoryName) return [];
  const normalized = categoryName.toLowerCase();
  return categoryConfig[normalized] || [];
};
