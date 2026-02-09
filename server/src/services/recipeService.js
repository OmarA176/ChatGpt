const recipeTemplates = {
  fridge: (items) => ({
    title: 'Quick Fridge Stir-Fry',
    steps: [
      `Chop ${items.join(', ')} into bite-sized pieces.`,
      'Sauté garlic and onion in olive oil.',
      'Add ingredients, season with salt/pepper, and cook for 8-10 minutes.',
      'Serve over rice or toasted bread.'
    ]
  }),
  pantry: (items) => ({
    title: 'Pantry Rescue Bowl',
    steps: [
      `Combine ${items.join(', ')} with cooked grains.`,
      'Mix lemon juice, olive oil, and cumin.',
      'Toss everything and top with herbs.'
    ]
  }),
  pharmacy: () => ({
    title: 'Pharmacy Safety Check',
    steps: [
      'Medicine items are expiring soon. Do not consume expired medicine.',
      'Consult a pharmacist for proper disposal and replacement.'
    ]
  })
};

export const generateRecipes = (expiringItems) => {
  if (expiringItems.length === 0) {
    return [{
      title: 'No urgent recipe needed',
      steps: ['Your inventory is healthy today. Keep it up!']
    }];
  }

  const byCategory = expiringItems.reduce((acc, item) => {
    acc[item.category] ??= [];
    acc[item.category].push(item.name);
    return acc;
  }, {});

  return Object.entries(byCategory).map(([category, items]) => recipeTemplates[category](items));
};
