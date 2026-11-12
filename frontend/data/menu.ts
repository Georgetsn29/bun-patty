/**
 * MENU DEFINITIONS & INGREDIENT CUSTOMIZATION CONFIGURATION
 * Localized for Georgia (Tbilisi). All prices are in Georgian Lari (₾).
 * 
 * Strict Category Order:
 * 1. Burgers
 * 2. Side Dishes
 * 3. Sauces
 * 4. Desserts
 * 5. Drinks
 * 
 * In every category: original items first, followed by newly added items.
 * Each item has an explicit sortOrder for default 'Recommended' sort.
 */

export interface IncludedIngredient {
  id: string;
  name: string;
  isRequired?: boolean;
}

export interface ExtraCustomizationOption {
  id: string;
  name: string;
  price: number; // in Georgian Lari (₾)
  maxQuantity?: number; // Defaults to 3
}

export interface ChoiceOption {
  id: string; // e.g. "still", "sparkling", "orange", "apple", "pomegranate", "carrot", "orange-carrot"
  name: string; // English display name
  priceAdjustment?: number; // Defaults to 0.00 ₾
  color?: string; // Optional flavor dot color
}

export interface RequiredChoiceGroup {
  id: string; // e.g. "water-type" or "juice-flavor"
  title: string; // e.g. "Choose water type" or "Choose a flavor"
  defaultOptionId?: string; // e.g. "still" for Water, undefined for Natural Juice
  options: ChoiceOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Burgers' | 'Side Dishes' | 'Sauces' | 'Desserts' | 'Drinks';
  price: number; // in Georgian Lari (₾)
  sortOrder: number; // Explicit sort order within category and menu
  estimatedMinutes: number;
  description: string;
  longDescription: string;
  mainIngredients: string[];
  beefWeight?: string;
  volume?: string;
  allergens: string[];
  badge?: string;
  tags: string[];
  calories: number;
  prepTime: string;
  isBestseller?: boolean;
  isChefSpecial?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  imageSlot: string;
  imageLabel: string;
  imageStyle?: 'scene' | 'isolated';
  imagePosition?: string;
  includedIngredients: IncludedIngredient[];
  availableExtras: ExtraCustomizationOption[];
  requiredChoice?: RequiredChoiceGroup;
}

export const MENU_ITEMS: MenuItem[] = [
  // =========================================================================
  // 1. BURGERS (Originals 1-6, then Double Smashed Bacon, then The Big One)
  // =========================================================================

  // 1. The Peach Blossom Smash (Original)
  {
    id: 'peach-blossom-smash',
    estimatedMinutes: 30,
    name: 'The Peach Blossom Smash',
    category: 'Burgers',
    sortOrder: 1,
    price: 24.90,
    description: 'Double 90 g dry-aged patties, slow-cooked peach-bourbon bacon jam, melted Havarti, and wild arugula on griddled milk brioche.',
    longDescription: 'Our beloved house signature burger combining savory smoke and subtle orchard sweetness. Two 90 g beef patties smashed on 260°C carbon steel for maximum crust, layered with melted Danish Havarti, peppery wild arugula, and our slow-simmered Georgian peach bourbon bacon jam on butter-griddled milk brioche.',
    mainIngredients: [
      'Griddled Milk Brioche Bun',
      'Two Smashed Angus Patties (90 g each)',
      'Melted Danish Havarti Cheese',
      'House Peach Bourbon Bacon Jam [Placeholder]',
      'Fresh Wild Arugula',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs [Placeholder]'],
    tags: ['House Signature', 'Dry-Aged'],
    calories: 780,
    prepTime: '6 min',
    isBestseller: true,
    isChefSpecial: true,
    imageSlot: '/images/menu/peach-blossom-smash.jpg',
    imageLabel: 'Cheeseburger close-up with peach bacon jam dripping down lacy crust',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false },
      { id: 'havarti-cheese', name: 'Melted Danish Havarti', isRequired: false },
      { id: 'peach-bacon-jam', name: 'Peach Bourbon Bacon Jam', isRequired: false },
      { id: 'wild-arugula', name: 'Wild Arugula', isRequired: false },
      { id: 'brioche-bun', name: 'Griddled Milk Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3 },
      { id: 'extra-havarti', name: 'Extra Melted Havarti', price: 2.00, maxQuantity: 3 },
      { id: 'smoked-bacon', name: 'Crispy Bacon Strip', price: 2.50, maxQuantity: 3 },
      { id: 'extra-jam', name: 'Extra Peach Bacon Jam', price: 2.00, maxQuantity: 3 },
      { id: 'dill-pickles', name: 'Pickled Cucumbers', price: 1.00, maxQuantity: 3 },
      { id: 'charred-jalapeno', name: 'Charred Jalapeños', price: 1.50, maxQuantity: 3 },
    ],
  },

  // 2. Classic Double Cheeseburger (Original)
  {
    id: 'golden-double-classic',
    estimatedMinutes: 30,
    name: 'Classic Double Cheeseburger',
    category: 'Burgers',
    sortOrder: 2,
    price: 22.90,
    description: 'Two smashed 90 g beef patties, double aged cheddar, pickled cucumber, shaved sweet onion, and house secret sauce.',
    longDescription: 'The purist standard prepared with absolute plancha discipline. Two 90 g beef patties smashed thin for caramelized lace edges, paired with double melted cheddar, thinly shaved sweet onion, crisp pickled cucumbers, and our caper-shallot secret sauce on a toasted milk bun.',
    mainIngredients: [
      'Toasted Milk Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Double Melted Sharp Cheddar',
      'Paper-Thin Shaved Onion',
      'Pickled Cucumber Slices',
      'House Secret Plancha Sauce',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs, Mustard [Placeholder]'],
    tags: ['Standard', 'Popular'],
    calories: 720,
    prepTime: '5 min',
    isBestseller: true,
    imageSlot: '/images/menu/golden-double-classic.jpg',
    imageLabel: 'Two-handed grip on classic double cheeseburger, melted cheddar corners',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false },
      { id: 'sharp-cheddar', name: 'Aged Sharp Cheddar', isRequired: false },
      { id: 'shaved-onion', name: 'Shaved Sweet Onion', isRequired: false },
      { id: 'pickled-cucumbers', name: 'Pickled Cucumber Slices', isRequired: false },
      { id: 'secret-sauce', name: 'House Secret Sauce', isRequired: false },
      { id: 'brioche-bun', name: 'Toasted Milk Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3 },
      { id: 'extra-cheddar', name: 'Extra Melted Cheddar', price: 2.00, maxQuantity: 3 },
      { id: 'smoked-bacon', name: 'Crispy Bacon Strip', price: 2.50, maxQuantity: 3 },
      { id: 'extra-pickles', name: 'Extra Pickled Cucumbers', price: 1.00, maxQuantity: 3 },
    ],
  },

  // 3. Truffle Forest Melt (Original)
  {
    id: 'truffle-forest-melt',
    estimatedMinutes: 30,
    name: 'Truffle Forest Melt',
    category: 'Burgers',
    sortOrder: 3,
    price: 27.90,
    description: 'Double 90 g smashed patties, sautéed brown beech mushrooms, melted Swiss Gruyère, and black truffle herb aioli on brioche.',
    longDescription: 'An intensely savory forest-inspired creation featuring two 90 g dry-aged beef patties. Smothered in butter-sautéed brown beech mushrooms, nutty aged Swiss Gruyère, and fragrant black truffle emulsion on our signature griddled brioche bun.',
    mainIngredients: [
      'Toasted Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Sautéed Brown Beech Mushrooms',
      'Aged Swiss Gruyère Cheese',
      'Black Truffle Herb Aioli',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs [Placeholder]'],
    tags: ['Truffle', 'Gruyère'],
    calories: 830,
    prepTime: '6 min',
    isChefSpecial: true,
    imageSlot: '/images/menu/truffle-forest-melt.jpg',
    imageLabel: 'Mushroom and melted gruyere burger on dark slate board',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false },
      { id: 'swiss-gruyere', name: 'Melted Swiss Gruyère', isRequired: false },
      { id: 'sauteed-mushrooms', name: 'Sautéed Beech Mushrooms', isRequired: false },
      { id: 'truffle-aioli', name: 'Black Truffle Herb Aioli', isRequired: false },
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3 },
      { id: 'extra-gruyere', name: 'Extra Swiss Gruyère', price: 2.50, maxQuantity: 3 },
      { id: 'extra-mushrooms', name: 'Extra Sautéed Mushrooms', price: 2.00, maxQuantity: 3 },
      { id: 'truffle-aioli-extra', name: 'Extra Black Truffle Aioli', price: 2.00, maxQuantity: 3 },
    ],
  },

  // 4. Sweet Heat Pickled Jalapeño (Original)
  {
    id: 'sweet-heat-jalapeno',
    estimatedMinutes: 30,
    name: 'Sweet Heat Pickled Jalapeño',
    category: 'Burgers',
    sortOrder: 4,
    price: 23.90,
    description: 'Double 90 g smashed patties, pepper jack cheese, quick-pickled jalapeño rings, wildflower hot honey, and crispy fried shallots.',
    longDescription: 'A vibrant balance of tongue-tingling spice and floral warmth. Two 90 g smashed beef patties capped with molten pepper jack cheese, house-pickled green jalapeño rings, crispy fried shallots, and a drizzle of local wildflower honey infused with dried red chilies.',
    mainIngredients: [
      'Toasted Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Spicy Pepper Jack Cheese',
      'Quick-Pickled Jalapeño Rings',
      'Crispy Fried Shallots',
      'Wildflower Hot Honey Drizzle [Placeholder]',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy [Placeholder]'],
    tags: ['Spicy', 'Hot Honey'],
    calories: 760,
    prepTime: '5 min',
    isSpicy: true,
    imageSlot: '/images/menu/sweet-heat-jalapeno.jpg',
    imageLabel: 'Burger with glistening honey drizzle and vibrant green pickled peppers',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false },
      { id: 'pepper-jack', name: 'Spicy Pepper Jack Cheese', isRequired: false },
      { id: 'pickled-jalapenos', name: 'Quick-Pickled Jalapeños', isRequired: false },
      { id: 'crispy-shallots', name: 'Crispy Fried Shallots', isRequired: false },
      { id: 'hot-honey', name: 'Wildflower Hot Honey Drizzle', isRequired: false },
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3 },
      { id: 'extra-bacon', name: 'Crispy Bacon Strip', price: 2.50, maxQuantity: 3 },
      { id: 'extra-jalapenos', name: 'Extra Pickled Jalapeños', price: 1.00, maxQuantity: 3 },
      { id: 'extra-hot-honey', name: 'Side Wildflower Hot Honey', price: 1.50, maxQuantity: 3 },
    ],
  },

  // 5. Buttermilk Crispy Chicken (Original)
  {
    id: 'buttermilk-crispy-chicken',
    estimatedMinutes: 30,
    name: 'Buttermilk Fried Chicken Sandwich',
    category: 'Burgers',
    sortOrder: 5,
    price: 23.90,
    description: '24-hour buttermilk soaked chicken thigh, triple-dredged crisp crust, cabbage-apple slaw, and smoked garlic emulsion on sesame brioche.',
    longDescription: 'Juicy boneless chicken thigh marinated for 24 hours in cultured buttermilk and herbs, dredged in seasoned flour for shatteringly crisp crunch. Paired with tangy shaved cabbage and green apple slaw and smoked garlic aioli on a toasted sesame brioche bun.',
    mainIngredients: [
      'Toasted Sesame Brioche Bun',
      'Buttermilk Marinated Fried Chicken Thigh',
      'Crisp Cabbage & Green Apple Slaw',
      'Pickled Cucumber Slices',
      'Smoked Garlic Herb Aioli',
    ],
    allergens: ['Gluten', 'Dairy', 'Eggs, Mustard [Placeholder]'],
    tags: ['Crispy Chicken', 'Customer Favorite'],
    calories: 740,
    prepTime: '7 min',
    imageSlot: '/images/menu/buttermilk-crispy-chicken.jpg',
    imageLabel: 'Craggy golden brown fried chicken sandwich with crunchy purple cabbage slaw',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'chicken-fillet', name: 'Crispy Buttermilk Chicken Thigh', isRequired: true },
      { id: 'cabbage-slaw', name: 'Cabbage-Apple Slaw', isRequired: false },
      { id: 'dill-pickles', name: 'Pickled Cucumber Slices', isRequired: false },
      { id: 'garlic-aioli', name: 'Smoked Garlic Aioli', isRequired: false },
      { id: 'brioche-bun', name: 'Toasted Sesame Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-slaw', name: 'Extra Cabbage-Apple Slaw', price: 1.50, maxQuantity: 2 },
      { id: 'add-cheese', name: 'Melted Cheddar Cheese', price: 2.00, maxQuantity: 2 },
      { id: 'add-bacon', name: 'Crispy Smoked Bacon', price: 2.50, maxQuantity: 3 },
      { id: 'add-jalapenos', name: 'Charred Jalapeños', price: 1.00, maxQuantity: 3 },
    ],
  },

  // 6. Crispy Halloumi & Mint (Original)
  {
    id: 'crispy-halloumi-mint',
    estimatedMinutes: 30,
    name: 'Crispy Griddled Halloumi Burger',
    category: 'Burgers',
    sortOrder: 6,
    price: 21.90,
    description: 'Thick seared halloumi slab, charred red peppers, fresh mint, wild baby arugula, and lemon-tahini crema on toasted milk brioche.',
    longDescription: 'A satisfying meatless burger built around a thick slab of Mediterranean halloumi cheese seared on the plancha until golden and warm. Layered with tender fire-roasted sweet peppers, fresh garden mint, baby arugula, and velvety lemon-tahini crema on toasted brioche.',
    mainIngredients: [
      'Toasted Brioche Bun',
      'Seared Halloumi Cheese Slab',
      'Fire-Roasted Sweet Red Peppers',
      'Fresh Garden Mint Leaves',
      'Baby Wild Arugula',
      'Lemon-Tahini Crema',
    ],
    allergens: ['Gluten', 'Dairy', 'Sesame [Placeholder]'],
    tags: ['Vegetarian', 'Mediterranean'],
    calories: 610,
    prepTime: '5 min',
    isVegetarian: true,
    imageSlot: '/images/menu/crispy-halloumi-mint.jpg',
    imageLabel: 'Golden griddled halloumi with charred red peppers and vibrant green herbs',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'halloumi-slab', name: 'Seared Halloumi Slab', isRequired: true },
      { id: 'roasted-peppers', name: 'Fire-Roasted Sweet Peppers', isRequired: false },
      { id: 'fresh-mint', name: 'Fresh Mint Leaves', isRequired: false },
      { id: 'baby-arugula', name: 'Baby Wild Arugula', isRequired: false },
      { id: 'tahini-crema', name: 'Lemon-Tahini Crema', isRequired: false },
      { id: 'brioche-bun', name: 'Toasted Milk Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-halloumi', name: 'Extra Seared Halloumi Slab', price: 4.50, maxQuantity: 2 },
      { id: 'avocado-mash', name: 'Crushed Ripe Avocado', price: 2.50, maxQuantity: 2 },
      { id: 'extra-peppers', name: 'Extra Fire-Roasted Peppers', price: 1.50, maxQuantity: 2 },
    ],
  },

  // 7. Double Smashed Bacon Burger (New - after originals)
  {
    id: 'double-smashed-bacon-burger',
    estimatedMinutes: 30,
    name: 'Double Smashed Bacon Burger',
    category: 'Burgers',
    sortOrder: 7,
    price: 26.90,
    description: 'Two smashed beef patties, 90 g each, with crispy bacon, melted cheddar, pickled cucumber, onion, burger sauce, and a toasted brioche bun.',
    longDescription: 'Two fresh 90 g beef patties smashed searing-hot on 260°C carbon steel to lock in juices and create signature caramelized lacy edges. Topped with thick strips of crispy smoked bacon, rich melted cheddar cheese, house pickled cucumber rounds, sweet shaved onion, and creamy burger sauce on a butter-griddled potato brioche bun.',
    mainIngredients: [
      'Toasted Potato Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Crispy Smoked Bacon',
      'Melted Cheddar Cheese',
      'Pickled Cucumber Rounds',
      'Shaved Sweet Onion',
      'Creamy Burger Sauce',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs, Mustard [Placeholder]'],
    tags: ['Double Smashed', 'Smoked Bacon', 'New'],
    calories: 840,
    prepTime: '6 min',
    isBestseller: true,
    imageSlot: '/images/menu/double-smashed-bacon.jpg',
    imageLabel: 'Double smashed beef patties with crispy bacon and melted cheddar',
    imageStyle: 'scene',
    imagePosition: 'center 55%',
    includedIngredients: [
      { id: 'patty-90g-1', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-90g-2', name: 'Second Smashed Patty (90 g)', isRequired: false },
      { id: 'crispy-bacon', name: 'Crispy Smoked Bacon', isRequired: false },
      { id: 'melted-cheddar', name: 'Melted Cheddar Cheese', isRequired: false },
      { id: 'pickled-cucumbers', name: 'Pickled Cucumber Rounds', isRequired: false },
      { id: 'shaved-onion', name: 'Shaved Sweet Onion', isRequired: false },
      { id: 'burger-sauce', name: 'Creamy Burger Sauce', isRequired: false },
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty-90g', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3 },
      { id: 'extra-bacon', name: 'Extra Crispy Bacon Strips', price: 2.50, maxQuantity: 3 },
      { id: 'extra-cheddar', name: 'Extra Melted Cheddar', price: 2.00, maxQuantity: 3 },
      { id: 'extra-pickles', name: 'Extra Pickled Cucumbers', price: 1.00, maxQuantity: 3 },
      { id: 'extra-sauce', name: 'Extra House Burger Sauce', price: 1.50, maxQuantity: 3 },
    ],
  },

  // 8. The Big One (New - after Double Smashed Bacon Burger)
  {
    id: 'the-big-one',
    estimatedMinutes: 40,
    name: 'The Big One',
    category: 'Burgers',
    sortOrder: 8,
    price: 49.90,
    description: '750 g of beef, 6 layers of cheddar, 2 layers of bacon, special sauce, onion in Saperavi wine, iceberg, and pickled cucumber.',
    longDescription: 'Our towering culinary centerpiece built for serious burger enthusiasts and communal sharing. Features an extraordinary 750 g of dry-aged beef smashed paper-thin across juicy tiers, interlaced with six generous blankets of melted sharp cheddar, two ribbons of crispy smoked bacon, and sweet red onions marinated in Kakheti Saperavi wine. Balanced with crunchy iceberg lettuce, vinegar pickled cucumber, and house special burger sauce on an oversized toasted sesame bun secured by twin skewers.',
    mainIngredients: [
      'Large Toasted Sesame Brioche Bun',
      '750 g Smashed Beef [Placeholder]',
      '6 Layers Melted Sharp Cheddar',
      '2 Layers Crispy Smoked Bacon',
      'Saperavi Wine Marinated Red Onions [Placeholder]',
      'Crisp Iceberg Lettuce',
      'Pickled Cucumber Slices',
      'Special Burger Sauce',
    ],
    beefWeight: '750 g beef (Multi-layer smash feast) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs, Mustard, Sulphites (Saperavi wine marinade) [Placeholder]'],
    badge: 'Made for sharing',
    tags: ['Made for sharing', '750 g Beef', 'New'],
    calories: 1980,
    prepTime: '10 min',
    isBestseller: true,
    isChefSpecial: true,
    imageSlot: '/images/menu/the-big-one.jpg',
    imageLabel: 'Towering multi-layer smash burger with melted cheese ribbons and skewers',
    imageStyle: 'scene',
    imagePosition: 'center 45%',
    includedIngredients: [
      { id: 'beef-750g-core', name: '750 g Smashed Beef Patties', isRequired: true },
      { id: 'cheddar-6-layers', name: 'Melted Cheddar (6 layers)', isRequired: false },
      { id: 'bacon-2-layers', name: 'Crispy Smoked Bacon (2 layers)', isRequired: false },
      { id: 'saperavi-onions', name: 'Saperavi Wine Marinated Onions', isRequired: false },
      { id: 'iceberg-crisp', name: 'Crisp Iceberg Lettuce', isRequired: false },
      { id: 'pickled-cucumbers', name: 'Pickled Cucumber Slices', isRequired: false },
      { id: 'special-burger-sauce', name: 'Special Burger Sauce', isRequired: false },
      { id: 'large-sesame-bun', name: 'Large Toasted Sesame Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-cheddar-ribbon', name: 'Extra Cheddar Cheese Layer', price: 2.50, maxQuantity: 3 },
      { id: 'extra-bacon-strip', name: 'Extra Crispy Bacon Strips', price: 3.00, maxQuantity: 3 },
      { id: 'extra-saperavi-onion', name: 'Extra Saperavi Wine Onions', price: 1.50, maxQuantity: 3 },
      { id: 'cheese-injection-shot', name: 'Cheese Injection Syringe Refill', price: 6.50, maxQuantity: 2 },
      { id: 'extra-special-sauce', name: 'Extra Special Burger Sauce', price: 1.50, maxQuantity: 3 },
    ],
  },

  // =========================================================================
  // 2. SIDE DISHES (Originals 1-3, then Fries with Cheese & Bacon, then Caesar Salad)
  // =========================================================================

  // 1. Rosemary Russet Crinkle Fries (Original)
  {
    id: 'golden-crinkle-fries',
    estimatedMinutes: 15,
    name: 'Rosemary Russet Crinkle Fries',
    category: 'Side Dishes',
    sortOrder: 1,
    price: 8.90,
    description: 'Thick-cut crinkle potatoes double-fried in clean oil, tossed in pulverized sea salt, fresh rosemary, and lemon thyme.',
    longDescription: 'We double-fry thick russet potatoes to guarantee a crunchy exterior ridges and a fluffy baked potato interior. Straight from the fryer, they are tossed with pulverized sea salt crystals, fresh fragrant rosemary, and lemon thyme.',
    mainIngredients: [
      'Thick-Cut Russet Potatoes',
      'Pulverized Coarse Sea Salt',
      'Fresh Garden Rosemary',
      'Lemon Thyme',
    ],
    allergens: ['None (Dedicated Fryer) [Placeholder]'],
    tags: ['Vegan', 'Gluten-Free'],
    calories: 380,
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/golden-crinkle-fries.jpg',
    imageLabel: 'Stainless steel wire basket overflowing with golden crinkle cut fries',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'crinkle-fries', name: 'Thick-Cut Crinkle Fries', isRequired: true },
      { id: 'rosemary-salt', name: 'Rosemary & Thyme Salt', isRequired: false },
    ],
    availableExtras: [
      { id: 'side-secret-sauce', name: 'Side Secret Sauce Cup', price: 1.50, maxQuantity: 3 },
      { id: 'side-truffle-aioli', name: 'Side Truffle Aioli Cup', price: 2.00, maxQuantity: 3 },
    ],
  },

  // 2. Truffle Parmesan Hand-Cut Fries (Original)
  {
    id: 'parmesan-truffle-fries',
    estimatedMinutes: 15,
    name: 'Truffle Parmesan Hand-Cut Fries',
    category: 'Side Dishes',
    sortOrder: 2,
    price: 12.90,
    description: 'Skin-on hand-cut fries drizzled with white truffle oil, dusted with 24-month aged parmesan, and cracked Tellicherry black pepper.',
    longDescription: 'Hand-cut russet fries cooked until dark golden and immediately tossed with Italian white truffle oil, a generous snowfall of aged Parmigiano-Reggiano, and freshly cracked black peppercorns.',
    mainIngredients: [
      'Hand-Cut Skin-On Russet Fries',
      'White Truffle Olive Oil',
      '24-Month Aged Parmigiano-Reggiano',
      'Cracked Tellicherry Black Pepper',
    ],
    allergens: ['Dairy [Placeholder]'],
    tags: ['Truffle', 'Customer Favorite'],
    calories: 460,
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/parmesan-truffle-fries.jpg',
    imageLabel: 'Dark ceramic bowl of golden truffle parmesan fries with fresh parsley',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'hand-cut-fries', name: 'Hand-Cut Skin-On Fries', isRequired: true },
      { id: 'parmesan-dust', name: '24-Month Aged Parmesan', isRequired: false },
      { id: 'white-truffle-oil', name: 'White Truffle Oil Drizzle', isRequired: false },
      { id: 'black-pepper', name: 'Cracked Tellicherry Pepper', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-parmesan', name: 'Extra Parmesan Snowfall', price: 2.00, maxQuantity: 3 },
      { id: 'side-truffle-aioli', name: 'Side Black Truffle Aioli', price: 2.00, maxQuantity: 3 },
    ],
  },

  // 3. Crispy Sweet Onion Rings (Original)
  {
    id: 'onion-rings',
    estimatedMinutes: 15,
    name: 'Crispy Sweet Onion Rings',
    category: 'Side Dishes',
    sortOrder: 3,
    price: 9.90,
    description: 'Thick rings of sweet onion soaked in buttermilk, coated in seasoned Japanese panko, and fried to golden perfection.',
    longDescription: 'Thick-cut sweet onion rings soaked in seasoned cultured buttermilk and dredged in coarse Japanese panko breadcrumbs. Fried to a resonant, shatter-crisp crunch with a sweet, tender interior.',
    mainIngredients: [
      'Thick-Cut Sweet Onions',
      'Cultured Buttermilk Marinade',
      'Japanese Coarse Panko Crumbs',
      'Smoked Paprika Sea Salt',
    ],
    allergens: ['Gluten', 'Dairy [Placeholder]'],
    tags: ['Vegetarian', 'Crispy'],
    calories: 420,
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/onion-rings.jpg',
    imageLabel: 'Tower stack of thick golden panko onion rings on parchment paper',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'onion-rings-core', name: 'Panko Onion Rings', isRequired: true },
      { id: 'paprika-salt', name: 'Smoked Paprika Seasoning', isRequired: false },
    ],
    availableExtras: [
      { id: 'side-secret-sauce', name: 'Side Secret Sauce Cup', price: 1.50, maxQuantity: 3 },
      { id: 'side-peach-jam', name: 'Side Peach Bacon Jam Cup', price: 2.00, maxQuantity: 3 },
    ],
  },

  // 4. Fries with Cheese and Bacon (New - after originals)
  {
    id: 'fries-with-cheese-and-bacon',
    estimatedMinutes: 15,
    name: 'Fries with Cheese and Bacon',
    category: 'Side Dishes',
    sortOrder: 4,
    price: 14.90,
    description: 'Crispy golden fries smothered in thick, glossy melted cheese sauce and crispy bacon pieces.',
    longDescription: 'A generous mountain of hand-cut double-fried golden potatoes, heavily blanketed in rich, velvety molten cheddar cheese sauce cascading through the entire portion, crowned with abundant crispy smoked bacon pieces and freshly snipped scallions.',
    mainIngredients: [
      'Double-Fried Russet Potato Fries',
      'Hot Cheddar Cheese Sauce',
      'Chopped Crispy Bacon',
      'Fresh Snipped Chives',
    ],
    allergens: ['Dairy [Placeholder]'],
    tags: ['Loaded Fries', 'Bacon & Cheese', 'New'],
    calories: 680,
    prepTime: '4 min',
    isBestseller: true,
    imageSlot: '/images/menu/fries-cheese-bacon.jpg',
    imageLabel: 'Crispy golden fries covered in molten cheese sauce and crisp chopped bacon',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'crispy-fries', name: 'Crispy Hand-Cut Fries', isRequired: true },
      { id: 'hot-cheese-sauce', name: 'Hot Cheddar Cheese Sauce', isRequired: false },
      { id: 'chopped-bacon', name: 'Chopped Crispy Bacon', isRequired: false },
      { id: 'fresh-chives', name: 'Fresh Chopped Chives', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-cheese-sauce', name: 'Extra Hot Cheese Sauce Ladle', price: 2.50, maxQuantity: 3 },
      { id: 'extra-bacon-bits', name: 'Extra Crispy Bacon Bits', price: 2.50, maxQuantity: 3 },
      { id: 'pickled-jalapenos', name: 'Sliced Pickled Jalapeños', price: 1.00, maxQuantity: 3 },
    ],
  },

  // 5. Caesar Salad (New - after Fries with Cheese and Bacon)
  {
    id: 'caesar-salad',
    estimatedMinutes: 10,
    name: 'Caesar Salad',
    category: 'Side Dishes',
    sortOrder: 5,
    price: 21.90,
    description: 'Romaine lettuce, grilled chicken, parmesan, croutons, and Caesar dressing.',
    longDescription: 'Crisp cold romaine hearts chopped fresh to order and lightly coated in creamy garlic-parmesan Caesar dressing. Crowned with tender slices of plancha-grilled chicken breast, aged shaved parmesan curls, and crunchy golden brioche garlic croutons.',
    mainIngredients: [
      'Crisp Romaine Lettuce Hearts',
      'Plancha Grilled Chicken Breast Slices',
      'Shaved Aged Parmesan Cheese',
      'Toasted Brioche Garlic Croutons',
      'Creamy Caesar Dressing',
    ],
    allergens: ['Dairy', 'Gluten', 'Fish (anchovy dressing)', 'Eggs [Placeholder]'],
    tags: ['Salad', 'Grilled Chicken', 'New'],
    calories: 460,
    prepTime: '5 min',
    imageSlot: '/images/menu/caesar-salad.jpg',
    imageLabel: 'Elegant Caesar salad bowl with grilled chicken slices and shaved parmesan',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'romaine-hearts', name: 'Crisp Romaine Hearts', isRequired: true },
      { id: 'grilled-chicken-slices', name: 'Grilled Chicken Breast Slices', isRequired: false },
      { id: 'shaved-parmesan', name: 'Shaved Aged Parmesan', isRequired: false },
      { id: 'brioche-croutons', name: 'Brioche Garlic Croutons', isRequired: false },
      { id: 'caesar-dressing', name: 'Creamy Caesar Dressing', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-grilled-chicken', name: 'Extra Grilled Chicken Portion', price: 5.00, maxQuantity: 2 },
      { id: 'extra-parmesan', name: 'Extra Shaved Parmesan', price: 2.50, maxQuantity: 3 },
      { id: 'extra-croutons', name: 'Extra Garlic Croutons', price: 1.00, maxQuantity: 2 },
      { id: 'side-caesar-dressing', name: 'Side Caesar Dressing Cup', price: 1.50, maxQuantity: 2 },
    ],
  },

  // =========================================================================
  // 3. SAUCES (Originals 1-3, then Cheese Injection)
  // =========================================================================

  // 1. Peach Bourbon Bacon Jam (Original)
  {
    id: 'sauce-peach-bourbon-jam',
    estimatedMinutes: 5,
    name: 'Peach Bourbon Bacon Jam',
    category: 'Sauces',
    sortOrder: 1,
    price: 4.50,
    description: 'House-made savory-sweet jam of slow-cooked ripe peaches, smoked bacon bits, bourbon, shallots, and dark molasses.',
    longDescription: 'Our signature condiment cooked low and slow for six hours. Ripe peaches break down naturally with caramelized shallots, diced smoked bacon, and a splash of bourbon into an amber, deeply savory spread.',
    mainIngredients: [
      'Ripe Peaches [Placeholder]',
      'Smoked Applewood Bacon',
      'Kentucky Bourbon',
      'Caramelized Shallots',
      'Dark Molasses & Cider Vinegar',
    ],
    volume: '80 ml jar',
    allergens: ['None [Placeholder]'],
    tags: ['House Specialty', 'Small Batch'],
    calories: 140,
    prepTime: '1 min',
    isBestseller: true,
    imageSlot: '/images/menu/sauce-peach-bourbon-jam.jpg',
    imageLabel: 'Glass ramekin of chunky amber peach bourbon bacon jam with wooden paddle',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'peach-jam-tub', name: '80 ml Peach Bacon Jam Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // 2. Black Truffle Herb Aioli (Original)
  {
    id: 'sauce-truffle-aioli',
    estimatedMinutes: 5,
    name: 'Black Truffle Herb Aioli',
    category: 'Sauces',
    sortOrder: 2,
    price: 4.00,
    description: 'Emulsified cold-pressed olive oil, roasted garlic, minced black summer truffles, and fresh garden chives.',
    longDescription: 'A silky, luxurious dipping emulsion whisked with roasted garlic cloves, fragrant black summer truffles, organic egg yolks, and fresh snipped chives.',
    mainIngredients: [
      'Cold-Pressed Olive Oil',
      'Black Summer Truffle Paste',
      'Roasted Garlic Cloves',
      'Pasture Egg Yolks',
      'Fresh Chives & Lemon Juice',
    ],
    volume: '80 ml cup',
    allergens: ['Eggs [Placeholder]'],
    tags: ['Vegetarian', 'Gourmet'],
    calories: 180,
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/sauce-truffle-aioli.jpg',
    imageLabel: 'Small black ceramic dipping dish of creamy flecked truffle aioli',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'truffle-aioli-tub', name: '80 ml Black Truffle Aioli Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // 3. House Secret Plancha Sauce (Original)
  {
    id: 'sauce-house-secret',
    estimatedMinutes: 5,
    name: 'House Secret Plancha Sauce',
    category: 'Sauces',
    sortOrder: 3,
    price: 3.00,
    description: 'Our proprietary blend of kewpie mayonnaise, coarse whole grain mustard, brine-pickled capers, and sweet relish.',
    longDescription: 'The savory backbone of our classic cheeseburgers. Prepared daily with rich mayonnaise, crushed capers, tangy pickle relish, and a secret blend of ground roasted spices.',
    mainIngredients: [
      'Creamy Mayonnaise',
      'Whole Grain Mustard',
      'Brine-Pickled Capers',
      'Finely Diced Sweet Relish',
      'Paprika & Celery Seed',
    ],
    volume: '80 ml cup',
    allergens: ['Eggs', 'Mustard [Placeholder]'],
    tags: ['Standard', 'Everyday Dip'],
    calories: 120,
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/sauce-house-secret.jpg',
    imageLabel: 'White porcelain ramekin of orange-tinted house burger sauce with cracked pepper',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'secret-sauce-tub', name: '80 ml House Secret Sauce Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // 4. Cheese Injection (New - after originals)
  {
    id: 'cheese-injection',
    estimatedMinutes: 5,
    name: 'Cheese Injection',
    category: 'Sauces',
    sortOrder: 4,
    price: 6.50,
    description: 'A food-safe, reusable stainless steel culinary syringe with a wide, blunt tip, filled with hot cheese sauce to inject into a burger.',
    longDescription: 'An interactive gastronomic experience for true cheese lovers. A food-safe, reusable stainless steel kitchen culinary syringe with an ergonomic plunger and wide blunt nozzle, filled with 60 ml of piping hot, velvety melted cheddar sauce ready to inject directly into the center of your burger bun.',
    mainIngredients: [
      'Reusable Stainless Steel Culinary Kitchen Syringe (Blunt Tip) [Placeholder tool]',
      '60 ml Piping Hot Melted Cheddar Sauce',
    ],
    volume: '60 ml cheese sauce fill',
    allergens: ['Dairy [Placeholder]'],
    tags: ['Hot Cheese', 'Kitchen Syringe', 'Interactive', 'New'],
    calories: 190,
    prepTime: '2 min',
    isBestseller: true,
    imageSlot: '/images/menu/cheese-injection.jpg',
    imageLabel: 'Stainless steel culinary kitchen syringe filled with warm cheese sauce beside burger',
    imageStyle: 'scene',
    imagePosition: 'center 58%',
    includedIngredients: [
      { id: 'stainless-syringe', name: 'Stainless Culinary Syringe (Blunt Tip)', isRequired: true },
      { id: 'hot-cheddar-fill', name: 'Hot Melted Cheddar Fill (60 ml)', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-cheese-refill', name: 'Extra Hot Cheese Syringe Refill', price: 4.00, maxQuantity: 2 },
      { id: 'jalapeno-cheese-refill', name: 'Jalapeño Hot Cheese Refill', price: 4.50, maxQuantity: 2 },
    ],
  },

  // =========================================================================
  // 4. DESSERTS (Original 1, then Lava Cake, then Basque Cheesecake)
  // =========================================================================

  // 1. Skillet Dark Chocolate Brownie (Original)
  {
    id: 'warm-bourbon-caramel-brownie',
    estimatedMinutes: 10,
    name: 'Skillet Dark Chocolate Brownie',
    category: 'Desserts',
    sortOrder: 1,
    price: 11.90,
    description: '70% dark chocolate brownie with warm bourbon caramel center and sea salt crystals.',
    longDescription: 'Baked in an individual cast-iron skillet to order. Crisp candy crust on the outside with a molten fudge core, drizzled with bourbon caramel and coarse sea salt flakes.',
    mainIngredients: [
      '70% Dark Chocolate Brownie Batter',
      'Warm Bourbon Caramel Sauce',
      'Flaky Sea Salt Crystals',
    ],
    allergens: ['Gluten', 'Dairy', 'Eggs [Placeholder]'],
    tags: ['Skillet Baked', 'Warm Dessert'],
    calories: 520,
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/warm-bourbon-caramel-brownie.jpg',
    imageLabel: 'Cast-iron mini skillet with dark chocolate brownie and caramel pool',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'fudge-brownie', name: 'Skillet Fudge Brownie Core', isRequired: true },
      { id: 'bourbon-caramel', name: 'Warm Bourbon Caramel Drizzle', isRequired: false },
      { id: 'flaky-sea-salt', name: 'Flaky Sea Salt Crystals', isRequired: false },
    ],
    availableExtras: [
      { id: 'vanilla-scoop', name: 'Vanilla Custard Scoop', price: 3.50, maxQuantity: 2 },
      { id: 'extra-caramel', name: 'Extra Bourbon Caramel', price: 1.50, maxQuantity: 2 },
    ],
  },

  // 2. Lava Cake (New - after original)
  {
    id: 'lava-cake',
    estimatedMinutes: 10,
    name: 'Lava Cake',
    category: 'Desserts',
    sortOrder: 2,
    price: 12.90,
    description: 'Warm chocolate cake with a molten center.',
    longDescription: 'An indulgent, freshly baked individual dark chocolate cake featuring a crisp delicate exterior crust that releases a warm, flowing river of molten dark chocolate upon first incision. Lightly dusted with premium Dutch cocoa powder and served warm.',
    mainIngredients: [
      '70% Valrhona Dark Chocolate [Placeholder]',
      'Cultured European Butter',
      'Pasture-Raised Eggs',
      'Pure Cane Sugar & Wheat Flour',
      'Dutch Cocoa Powder Dusting',
    ],
    allergens: ['Gluten', 'Dairy', 'Eggs [Placeholder]'],
    tags: ['Warm Dessert', 'Molten Core', 'New'],
    calories: 580,
    prepTime: '5 min',
    isVegetarian: true,
    imageSlot: '/images/menu/lava-cake.jpg',
    imageLabel: 'Warm dark chocolate lava cake cut open with rich chocolate flowing on black plate',
    imageStyle: 'scene',
    imagePosition: 'center 60%',
    includedIngredients: [
      { id: 'warm-lava-cake', name: 'Molten Chocolate Lava Cake', isRequired: true },
      { id: 'cocoa-dusting', name: 'Dutch Cocoa Powder Dusting', isRequired: false },
    ],
    availableExtras: [
      { id: 'vanilla-ice-cream', name: 'Vanilla Ice Cream Scoop', price: 3.50, maxQuantity: 2 },
      { id: 'warm-caramel-shot', name: 'Warm Bourbon Caramel Drizzle', price: 2.00, maxQuantity: 2 },
    ],
  },

  // 3. Basque Cheesecake (New - renamed and updated with Basque reference)
  {
    id: 'cheesecake',
    estimatedMinutes: 10,
    name: 'Basque Cheesecake',
    category: 'Desserts',
    sortOrder: 3,
    price: 12.90,
    description: 'Caramelized burnt Basque cheesecake with a molten creamy center on parchment paper.',
    longDescription: 'Baked at high heat to achieve a deeply caramelized, dark burnished top while preserving an ultra-creamy, custard-like soft center. Served rustic on crumpled baking parchment with a touch of vanilla.',
    mainIngredients: [
      'Cultured Cream Cheese Filling',
      'Caramelized Burnt Crust',
      'Fresh Lemon Zest',
      'Madagascar Vanilla Caviar',
    ],
    allergens: ['Dairy', 'Gluten', 'Eggs [Placeholder]'],
    tags: ['Basque Burnt', 'Velvety', 'New'],
    calories: 510,
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/cheesecake.jpg',
    imageLabel: 'Generous rustic Basque cheesecake on crumpled parchment paper with dark caramelized top',
    imageStyle: 'scene',
    imagePosition: 'center 60%',
    includedIngredients: [
      { id: 'cheesecake-slice', name: 'Basque Burnt Cheesecake Slice', isRequired: true },
      { id: 'biscuit-crust', name: 'Caramelized Rustic Edges', isRequired: true },
    ],
    availableExtras: [
      { id: 'strawberry-sauce', name: 'Wild Strawberry Compote', price: 2.00, maxQuantity: 2 },
      { id: 'whipped-cream', name: 'Cultured Whipped Cream', price: 1.50, maxQuantity: 2 },
    ],
  },

  // =========================================================================
  // 5. DRINKS (Originals 1-2, then Pepsi)
  // =========================================================================

  // 1. Cold-Steeped Peach Ceylon Tea (Original)
  {
    id: 'peach-blossom-iced-tea',
    estimatedMinutes: 2,
    name: 'Cold-Steeped Peach Ceylon Tea',
    category: 'Drinks',
    sortOrder: 1,
    price: 6.50,
    description: '18-hour cold brew Ceylon black tea, fresh white peach puree, and crushed lemon thyme over hand-cut ice.',
    longDescription: 'We steep high-grown single-origin Ceylon black tea leaves in cold filtered water for 18 hours to extract clean floral tannins without bitterness. Shaken with white peach puree and poured over hand-cut ice with fresh lemon thyme.',
    mainIngredients: [
      '18-Hour Cold Brew Ceylon Black Tea',
      'White Peach Puree',
      'Lemon Thyme Sprig',
      'Pure Clover Honey Syrup',
    ],
    volume: '400 ml glass',
    allergens: ['None [Placeholder]'],
    tags: ['House Brewed', 'Botanical'],
    calories: 110,
    prepTime: '2 min',
    isVegetarian: true,
    imageSlot: '/images/menu/peach-blossom-iced-tea.jpg',
    imageLabel: 'Tall ribbed glassware filled with amber peach tea, ice sphere, and thyme sprig',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'peach-tea-base', name: 'Cold-Steeped Ceylon Tea', isRequired: true },
      { id: 'peach-puree', name: 'White Peach Puree', isRequired: false },
      { id: 'fresh-thyme', name: 'Fresh Lemon Thyme Sprig', isRequired: false },
      { id: 'hand-cut-ice', name: 'Hand-Cut Ice', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-sweetness', name: 'Add Honey Syrup Pump', price: 0.50, maxQuantity: 2 },
    ],
  },

  // 2. Madagascar Vanilla Custard Shake (Original)
  {
    id: 'roasted-vanilla-bean-shake',
    estimatedMinutes: 2,
    name: 'Madagascar Vanilla Custard Shake',
    category: 'Drinks',
    sortOrder: 2,
    price: 9.90,
    description: 'Hand-spun local frozen dairy custard, whole scraped Madagascar vanilla bean, and whipped cultured cream.',
    longDescription: 'Traditional dense frozen custard churned fresh every morning with rich whole dairy milk and egg yolks. Hand-spun on vintage spindle mixers with scraped Madagascar vanilla caviar and topped with cultured whipped cream.',
    mainIngredients: [
      'Dense Fresh Dairy Custard [Placeholder]',
      'Madagascar Vanilla Caviar',
      'Cultured Whipped Cream',
    ],
    volume: '450 ml tumbler',
    allergens: ['Dairy', 'Eggs [Placeholder]'],
    tags: ['Hand-Spun', 'Fresh Dairy'],
    calories: 590,
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/roasted-vanilla-bean-shake.jpg',
    imageLabel: 'Heavy glass diner tumbler filled with thick vanilla shake and cream crown',
    imageStyle: 'isolated',
    imagePosition: 'center 45%',
    includedIngredients: [
      { id: 'frozen-custard', name: 'Frozen Dairy Custard Base', isRequired: true },
      { id: 'vanilla-caviar', name: 'Madagascar Vanilla Bean Caviar', isRequired: true },
      { id: 'whipped-cream', name: 'Cultured Whipped Cream Crown', isRequired: false },
    ],
    availableExtras: [
      { id: 'caramel-swirl', name: 'Bourbon Caramel Swirl', price: 1.50, maxQuantity: 3 },
      { id: 'fudge-swirl', name: 'Dark Chocolate Fudge Swirl', price: 1.50, maxQuantity: 3 },
    ],
  },

  // 3. Pepsi (New - after originals)
  {
    id: 'pepsi-can',
    estimatedMinutes: 2,
    name: 'Pepsi',
    category: 'Drinks',
    sortOrder: 3,
    price: 3.50,
    description: 'Chilled 330 ml can.',
    longDescription: 'Ice-cold 330 ml aluminium can of classic Pepsi cola, served chilled from our beverage coolers. Served upon request with a heavy glass tumbler filled with crystal-clear ice cubes and a fresh slice of lemon.',
    mainIngredients: [
      'Chilled Pepsi Cola (330 ml Can)',
      'Optional Tumbler of Ice',
      'Optional Lemon Wedge',
    ],
    volume: '330 ml can',
    allergens: ['None [Placeholder]'],
    tags: ['Chilled Soda', 'Classic Cola', 'New'],
    calories: 140,
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/pepsi.jpg',
    imageLabel: 'Chilled 330 ml Pepsi can with water droplets beside ice and lemon glass',
    imageStyle: 'isolated',
    imagePosition: 'center 60%',
    includedIngredients: [
      { id: 'pepsi-can-unit', name: 'Chilled Pepsi 330 ml Can', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2 },
    ],
  },

  // 4. Coca-Cola (New)
  {
    id: 'coca-cola',
    estimatedMinutes: 2,
    name: 'Coca-Cola',
    category: 'Drinks',
    sortOrder: 4,
    price: 3.50,
    description: 'Chilled 330 ml can.',
    longDescription: 'Ice-cold 330 ml can of classic Coca-Cola, served chilled from our beverage coolers. Served upon request with a glass tumbler filled with crystal-clear ice cubes and a fresh slice of lemon.',
    mainIngredients: [
      'Chilled Coca-Cola (330 ml Can)',
      'Optional Tumbler of Ice',
      'Optional Lemon Wedge',
    ],
    volume: '330 ml can',
    allergens: ['None [Placeholder]'],
    tags: ['Chilled Soda', 'Classic Cola', 'New'],
    calories: 140,
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/coca-cola.jpg',
    imageLabel: 'Chilled 330 ml Coca-Cola can with condensation droplets',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'coca-cola-can-unit', name: 'Chilled Coca-Cola 330 ml Can', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2 },
    ],
  },

  // 5. Water (New)
  {
    id: 'water',
    estimatedMinutes: 2,
    name: 'Water',
    category: 'Drinks',
    sortOrder: 5,
    price: 2.50,
    description: '500 ml bottle.',
    longDescription: 'Pure refreshing natural mineral water in a 500 ml glass bottle. Required choice of still or sparkling, served chilled.',
    mainIngredients: [
      '500 ml Natural Mineral Water',
      'Choice of Still or Sparkling',
      'Optional Tumbler of Ice',
    ],
    volume: '500 ml bottle',
    allergens: ['None [Placeholder]'],
    tags: ['Mineral Water', 'Hydration', 'New'],
    calories: 0,
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/water.jpg',
    imageLabel: 'Clean unbranded 500 ml glass water bottle with fresh water droplets',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'water-bottle-unit', name: '500 ml Glass Water Bottle', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2 },
    ],
    requiredChoice: {
      id: 'water-type',
      title: 'Choose water type',
      defaultOptionId: 'still',
      options: [
        { id: 'still', name: 'Still', priceAdjustment: 0.00, color: '#38BDF8' },
        { id: 'sparkling', name: 'Sparkling', priceAdjustment: 0.00, color: '#818CF8' },
      ],
    },
  },

  // 6. Natural Juice (New)
  {
    id: 'natural-juice',
    estimatedMinutes: 2,
    name: 'Natural Juice',
    category: 'Drinks',
    sortOrder: 6,
    price: 7.50,
    description: '300 ml glass of freshly squeezed natural juice, with no added sugar.',
    longDescription: '300 ml glass of freshly squeezed natural juice, with no added sugar. Prepared fresh to order from seasonal fruit and vegetables. Choose your favorite flavor.',
    mainIngredients: [
      'Freshly Squeezed 100% Natural Juice',
      'Whole Fruit & Vegetables',
      'No Added Sugar',
      'Optional Hand-Cut Ice',
    ],
    volume: '300 ml glass',
    allergens: ['None [Placeholder]'],
    tags: ['Freshly Squeezed', 'No Added Sugar', 'New'],
    calories: 120,
    prepTime: '2 min',
    isVegetarian: true,
    imageSlot: '/images/menu/natural-juice.jpg',
    imageLabel: 'Freshly squeezed natural fruit juice in tall glass with whole fresh fruit',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'fresh-juice-base', name: 'Freshly Squeezed Natural Juice 300 ml', isRequired: true },
      { id: 'hand-cut-ice', name: 'Hand-Cut Ice', isRequired: false },
    ],
    availableExtras: [
      { id: 'extra-mint-sprig', name: 'Fresh Wild Mint Sprig', price: 0.50, maxQuantity: 2 },
    ],
    requiredChoice: {
      id: 'juice-flavor',
      title: 'Choose a flavor',
      defaultOptionId: undefined, // Nothing preselected!
      options: [
        { id: 'orange', name: 'Orange', priceAdjustment: 0.00, color: '#F97316' },
        { id: 'apple', name: 'Apple', priceAdjustment: 0.00, color: '#84CC16' },
        { id: 'pomegranate', name: 'Pomegranate', priceAdjustment: 0.00, color: '#991B1B' },
        { id: 'carrot', name: 'Carrot', priceAdjustment: 0.00, color: '#EA580C' },
        { id: 'orange-carrot', name: 'Orange & Carrot', priceAdjustment: 0.00, color: '#FB923C' },
      ],
    },
  },
];

/**
 * STRICT CATEGORY ORDER
 */
export const CATEGORIES = [
  'Burgers',
  'Side Dishes',
  'Sauces',
  'Desserts',
  'Drinks',
] as const;

export function calculateOrderEstimatedMinutes(
  items: Array<{ itemId: string }>,
  orderType: "delivery" | "pickup" = "pickup",
  deliveryExtraMinutes: number = 0
): number {
  if (!items || items.length === 0) return 30;
  let maxMinutes = 0;
  for (const it of items) {
    const menuItem = MENU_ITEMS.find((m) => m.id === it.itemId);
    const itemEst = menuItem ? menuItem.estimatedMinutes : 30;
    if (itemEst > maxMinutes) {
      maxMinutes = itemEst;
    }
  }
  const deliveryPadding = orderType === "delivery" ? deliveryExtraMinutes : 0;
  return (maxMinutes || 30) + deliveryPadding;
}
