export const categoryConfig = {
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
