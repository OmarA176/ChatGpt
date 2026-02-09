const fallbackProducts = {
  '5449000000996': { name: 'Coca-Cola', category: 'pantry' },
  '6223001366603': { name: 'Plain Yogurt', category: 'fridge' },
  '8901030895480': { name: 'Pain Reliever', category: 'pharmacy' }
};

export const lookupBarcode = async (barcode) => {
  if (fallbackProducts[barcode]) return fallbackProducts[barcode];

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 1) {
      return {
        name: data.product.product_name || 'Unknown Product',
        category: 'pantry'
      };
    }
  } catch {
    return { name: 'Unknown Product', category: 'pantry' };
  }

  return { name: 'Unknown Product', category: 'pantry' };
};
