/**
 * MENU DEFINITIONS & INGREDIENT CUSTOMIZATION CONFIGURATION
 * Localized for Georgia (Tbilisi). All prices are in Georgian Lari (₾).
 *
 * Strict Category Order:
 * 1. Burgers
 * 2. Side Dishes
 * 3. Sauces
 * 4. Desserts
 * 5. Drinks (soft drinks, Water, Juice, Shake, Tea, then the "Coffee" subgroup)
 *
 * Each item has an explicit sortOrder (1-based, per category) that defines the
 * default 'Recommended' order. Items are also listed in that order below.
 *
 * Item IDs are stable: when a product is renamed or replaced, it keeps its ID
 * so carts and orders saved in a browser keep working.
 *
 * NUTRITION [Placeholder]
 * Every nutrition value in this file is an approximate kitchen estimate per
 * serving and is marked `isPlaceholder: true` via `placeholderNutrition()`.
 * Values must be verified before being presented as final (see nutrition-review.md).
 *
 * How nutrition is calculated for a customized item (see computeNutrition):
 *   base item nutrition
 *   + selected choice option nutrition (e.g. juice flavor)
 *   - nutrition of each removed included ingredient
 *   + nutrition of each extra × quantity
 * Item base values are built by summing the component values below, so removing
 * an ingredient subtracts exactly what it contributed.
 */

export interface Nutrition {
  calories: number; // kcal
  netCarbs: number; // g (total carbohydrates minus fiber)
  fat: number; // g
  protein: number; // g
  isPlaceholder?: boolean;
}

export interface IncludedIngredient {
  id: string;
  name: string;
  isRequired?: boolean;
  /** Nutrition this ingredient contributes to the base item (subtracted when removed) */
  nutrition?: Nutrition;
}

export interface ExtraCustomizationOption {
  id: string;
  name: string;
  price: number; // in Georgian Lari (₾)
  maxQuantity?: number; // Defaults to 3
  /** Nutrition added per unit of this extra */
  nutrition: Nutrition;
}

export interface ChoiceOption {
  id: string; // e.g. "still", "sparkling", "orange", "apple", "pomegranate", "pineapple", "cherry", "mojito"
  name: string; // English display name
  priceAdjustment?: number; // Defaults to 0.00 ₾
  color?: string; // Optional flavor dot color
  /** Nutrition added on top of the item's base nutrition when this option is selected */
  nutrition: Nutrition;
}

export interface RequiredChoiceGroup {
  id: string; // e.g. "water-type" or "juice-flavor"
  title: string; // e.g. "Choose water type" or "Choose a flavor"
  defaultOptionId?: string; // e.g. "still" for Water, undefined for Natural Juice
  options: ChoiceOption[];
}

export type MenuCategory = 'Burgers' | 'Side Dishes' | 'Sauces' | 'Desserts' | 'Drinks';

/** Optional visual subgroup inside a category (rendered under its own small subheading) */
export type MenuSubgroup = 'coffee';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  subgroup?: MenuSubgroup;
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
  /** Base nutrition per serving, with all included ingredients and no extras [Placeholder] */
  nutrition: Nutrition;
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

// =============================================================================
// NUTRITION HELPERS & COMPONENT ESTIMATES [Placeholder]
// =============================================================================

/** Creates a nutrition record flagged as a placeholder estimate. */
export function placeholderNutrition(
  calories: number,
  netCarbs: number,
  fat: number,
  protein: number
): Nutrition {
  return { calories, netCarbs, fat, protein, isPlaceholder: true };
}

const ZERO_NUTRITION: Nutrition = placeholderNutrition(0, 0, 0, 0);

/** Sums nutrition records (keeps the placeholder flag if any part is a placeholder). */
export function sumNutrition(...parts: Array<Nutrition | undefined>): Nutrition {
  return parts.reduce<Nutrition>(
    (acc, p) =>
      p
        ? {
            calories: acc.calories + p.calories,
            netCarbs: acc.netCarbs + p.netCarbs,
            fat: acc.fat + p.fat,
            protein: acc.protein + p.protein,
            isPlaceholder: acc.isPlaceholder || p.isPlaceholder,
          }
        : acc,
    { calories: 0, netCarbs: 0, fat: 0, protein: 0, isPlaceholder: false }
  );
}

function scaleNutrition(n: Nutrition, factor: number): Nutrition {
  return {
    calories: n.calories * factor,
    netCarbs: n.netCarbs * factor,
    fat: n.fat * factor,
    protein: n.protein * factor,
    isPlaceholder: n.isPlaceholder,
  };
}

/**
 * Approximate per-portion component values used to build every item [Placeholder].
 * calories (kcal), net carbs (g), fat (g), protein (g)
 */
const N = {
  // Breads
  briocheBun: placeholderNutrition(230, 38, 5, 7), // ~75 g milk brioche
  sesameBriocheBun: placeholderNutrition(240, 38, 6, 8), // ~78 g sesame brioche
  largeSesameBun: placeholderNutrition(380, 62, 8, 12), // ~120 g oversized bun
  burgerBun: placeholderNutrition(220, 40, 3, 7), // ~75 g soft burger bun
  // Proteins
  patty90: placeholderNutrition(230, 0, 18, 16), // 90 g raw 80/20 beef
  beef750: placeholderNutrition(1900, 0, 150, 128), // 750 g raw 80/20 beef
  friedChickenThigh: placeholderNutrition(400, 18, 22, 30), // ~150 g battered thigh
  grilledChicken: placeholderNutrition(200, 0, 5, 37), // 120 g grilled breast
  friedMozzarella: placeholderNutrition(380, 18, 24, 22), // ~110 g breaded fried mozzarella patty
  friedEgg: placeholderNutrition(90, 0, 7, 6), // 1 large egg fried in butter
  chickenWings8: placeholderNutrition(640, 8, 44, 56), // 8 floured, fried wings (~320 g bone-in)
  chickenWings4: placeholderNutrition(320, 4, 22, 28), // 4 floured, fried wings
  crispyBacon: placeholderNutrition(80, 0, 6, 6), // 2 crispy strips (~16 g)
  baconBits: placeholderNutrition(100, 0, 8, 7), // ~20 g chopped crispy bacon
  baconLayers2: placeholderNutrition(240, 0, 18, 18), // 6 strips
  // Cheese
  cheddarSlice: placeholderNutrition(80, 0, 7, 5), // 20 g
  cheddarDouble: placeholderNutrition(160, 1, 13, 10), // 2 × 20 g
  cheddar6Layers: placeholderNutrition(480, 2, 40, 30), // 6 × 20 g
  gruyere: placeholderNutrition(105, 0, 8, 7), // 25 g
  pepperJack: placeholderNutrition(80, 0, 7, 5), // 20 g
  americanCheeseSlice: placeholderNutrition(75, 1, 6, 4), // 20 g slice
  americanCheese2: placeholderNutrition(150, 2, 12, 8), // 2 × 20 g slices
  cheeseSauce30: placeholderNutrition(68, 3, 6, 3), // 30 g hot cheddar sauce
  parmesanSnow: placeholderNutrition(60, 0, 4, 5), // 15 g
  parmesanGrated: placeholderNutrition(40, 0, 3, 4), // 10 g
  cheeseSauce60: placeholderNutrition(135, 5, 11, 5), // 60 g hot cheddar sauce
  cheeseSauce80: placeholderNutrition(180, 7, 14, 7), // 80 g hot cheddar sauce
  // Sauces & spreads
  baconJam30: placeholderNutrition(100, 12, 5, 2), // 30 g smoky onion & bacon jam
  baconJam80: placeholderNutrition(270, 33, 13, 6), // 80 g cup
  secretSauce20: placeholderNutrition(110, 2, 11, 0), // 20 g mayo-based sauce
  secretSauceCup: placeholderNutrition(160, 3, 16, 0), // 30 g side cup
  secretSauce80: placeholderNutrition(430, 8, 44, 1), // 80 ml cup
  specialSauce40: placeholderNutrition(220, 4, 22, 0), // 40 g
  specialSauce20: placeholderNutrition(110, 2, 11, 0), // 20 g house special sauce
  dippingSauce30: placeholderNutrition(140, 2, 15, 0), // 30 g creamy garlic-herb dip
  ketchup30: placeholderNutrition(30, 7, 0, 0), // 30 g tomato ketchup
  spicyWingGlaze: placeholderNutrition(60, 4, 5, 0), // ~40 g butter-chili glaze for 8 wings
  bbqWingGlaze: placeholderNutrition(80, 19, 0, 0), // ~45 g BBQ glaze for 8 wings
  truffleAioli20: placeholderNutrition(140, 0, 15, 0), // 20 g
  truffleAioliCup: placeholderNutrition(210, 1, 22, 0), // 30 g side cup
  truffleAioli80: placeholderNutrition(500, 2, 55, 1), // 80 ml cup
  garlicAioli20: placeholderNutrition(140, 1, 15, 0), // 20 g
  caesarDressing: placeholderNutrition(200, 2, 21, 1), // 40 g
  bbqSauce: placeholderNutrition(40, 9, 0, 0), // 25 g
  hotHoney: placeholderNutrition(45, 12, 0, 0), // 15 g
  truffleOil: placeholderNutrition(40, 0, 5, 0), // 5 ml
  // Vegetables & garnish
  shavedOnion: placeholderNutrition(6, 1, 0, 0),
  pickles: placeholderNutrition(3, 0, 0, 0),
  jalapenos: placeholderNutrition(4, 0, 0, 0),
  crispyShallots: placeholderNutrition(50, 4, 3, 1),
  sauteedMushrooms: placeholderNutrition(60, 2, 5, 2),
  cabbageSlaw: placeholderNutrition(60, 5, 4, 1),
  saperaviOnions: placeholderNutrition(40, 8, 0, 1),
  iceberg: placeholderNutrition(4, 1, 0, 0),
  tomato: placeholderNutrition(5, 1, 0, 0), // 2 slices
  romaine: placeholderNutrition(25, 2, 0, 2),
  croutons: placeholderNutrition(110, 14, 5, 3),
  chives: placeholderNutrition(1, 0, 0, 0),
  lemonWedge: placeholderNutrition(0, 0, 0, 0), // negligible (<2 kcal)
  // Potatoes
  fries170: placeholderNutrition(490, 60, 23, 6), // 170 g fried potatoes
  onionRings180: placeholderNutrition(590, 62, 34, 8),
  // Desserts
  fudgeBrownie: placeholderNutrition(480, 54, 26, 6),
  bourbonCaramel: placeholderNutrition(110, 20, 3, 0), // 30 g
  vanillaCustardScoop: placeholderNutrition(160, 17, 9, 3), // 70 g
  vanillaIceCreamScoop: placeholderNutrition(150, 17, 8, 3), // 70 g
  lavaCake: placeholderNutrition(460, 45, 28, 7),
  cocoaDusting: placeholderNutrition(5, 0, 0, 0),
  basqueCheesecake: placeholderNutrition(510, 27, 40, 9), // 150 g slice
  strawberryCompote: placeholderNutrition(50, 12, 0, 0),
  whippedCream: placeholderNutrition(100, 2, 10, 1), // 30 g
  // Drinks
  coldBrewTeaHoney: placeholderNutrition(70, 17, 0, 0), // 400 ml tea with honey syrup
  lemonJuice: placeholderNutrition(5, 1, 0, 0),
  honeyPump: placeholderNutrition(30, 8, 0, 0),
  frozenCustardShake: placeholderNutrition(560, 62, 30, 12),
  pepsi330: placeholderNutrition(140, 36, 0, 0),
  cocaCola330: placeholderNutrition(139, 35, 0, 0),
  zeroSugar330: placeholderNutrition(1, 0, 0, 0),
  espressoShot: placeholderNutrition(2, 0, 0, 0),
  sideMilk: placeholderNutrition(20, 1, 1, 1), // 30 ml whole milk
  milk150: placeholderNutrition(95, 7, 5, 5), // 150 ml steamed whole milk
  milk250: placeholderNutrition(155, 12, 8, 8), // 250 ml steamed whole milk
  milkFoam: placeholderNutrition(15, 1, 1, 1),
  syrupShot: placeholderNutrition(30, 8, 0, 0), // 10 ml flavored syrup
};

/**
 * Calculates nutrition for an item with a given customization [Placeholder values].
 */
export function computeNutrition(
  item: MenuItem,
  customization?: {
    selectedChoiceId?: string;
    removedIngredientIds?: string[];
    extraQuantities?: Record<string, number>;
  }
): Nutrition {
  let total = sumNutrition(item.nutrition);

  if (customization?.selectedChoiceId && item.requiredChoice) {
    const opt = item.requiredChoice.options.find((o) => o.id === customization.selectedChoiceId);
    if (opt) total = sumNutrition(total, opt.nutrition);
  }

  (customization?.removedIngredientIds || []).forEach((id) => {
    const ing = item.includedIngredients.find((i) => i.id === id);
    if (ing?.nutrition && !ing.isRequired) {
      total = sumNutrition(total, scaleNutrition(ing.nutrition, -1));
    }
  });

  Object.entries(customization?.extraQuantities || {}).forEach(([extraId, qty]) => {
    if (qty <= 0) return;
    const extra = item.availableExtras.find((e) => e.id === extraId);
    if (extra) total = sumNutrition(total, scaleNutrition(extra.nutrition, qty));
  });

  return {
    calories: Math.max(0, Math.round(total.calories)),
    netCarbs: Math.max(0, Math.round(total.netCarbs)),
    fat: Math.max(0, Math.round(total.fat)),
    protein: Math.max(0, Math.round(total.protein)),
    isPlaceholder: total.isPlaceholder,
  };
}

/**
 * Calorie range for the menu card. Items with a required choice (Natural Juice, Water)
 * can vary by option; everything else returns a single value (min === max).
 */
export function getCalorieRange(item: MenuItem): { min: number; max: number } {
  if (!item.requiredChoice || item.requiredChoice.options.length === 0) {
    const kcal = computeNutrition(item).calories;
    return { min: kcal, max: kcal };
  }
  const values = item.requiredChoice.options.map(
    (o) => computeNutrition(item, { selectedChoiceId: o.id }).calories
  );
  return { min: Math.min(...values), max: Math.max(...values) };
}

// =============================================================================
// MENU ITEMS
// =============================================================================

export const MENU_ITEMS: MenuItem[] = [
  // =========================================================================
  // 1. BURGERS
  // =========================================================================

  // 1. Classic Double Cheeseburger
  {
    id: 'golden-double-classic',
    estimatedMinutes: 30,
    name: 'Classic Double Cheeseburger',
    category: 'Burgers',
    sortOrder: 1,
    price: 22.90,
    description: 'Two smashed 90 g beef patties, double aged cheddar, pickled cucumber, shaved sweet onion, and house special sauce.',
    longDescription: 'The purist standard prepared with absolute plancha discipline. Two 90 g beef patties smashed thin for caramelized lace edges, paired with double melted cheddar, thinly shaved sweet onion, crisp pickled cucumbers, and our house special sauce on a toasted milk bun.',
    mainIngredients: [
      'Toasted Milk Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Double Melted Sharp Cheddar',
      'Paper-Thin Shaved Onion',
      'Pickled Cucumber Slices',
      'House Special Sauce',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs, Mustard [Placeholder]'],
    tags: ['Standard', 'Popular'],
    nutrition: sumNutrition(N.briocheBun, N.patty90, N.patty90, N.cheddarDouble, N.shavedOnion, N.pickles, N.secretSauce20),
    prepTime: '5 min',
    isBestseller: true,
    imageSlot: '/images/menu/golden-double-classic.jpg',
    imageLabel: 'Two-handed grip on classic double cheeseburger, melted cheddar corners',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false, nutrition: N.patty90 },
      { id: 'sharp-cheddar', name: 'Aged Sharp Cheddar', isRequired: false, nutrition: N.cheddarDouble },
      { id: 'shaved-onion', name: 'Shaved Sweet Onion', isRequired: false, nutrition: N.shavedOnion },
      { id: 'pickled-cucumbers', name: 'Pickled Cucumber Slices', isRequired: false, nutrition: N.pickles },
      { id: 'secret-sauce', name: 'House Special Sauce', isRequired: false, nutrition: N.secretSauce20 },
      { id: 'brioche-bun', name: 'Toasted Milk Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3, nutrition: N.patty90 },
      { id: 'extra-cheddar', name: 'Extra Melted Cheddar', price: 2.00, maxQuantity: 3, nutrition: N.cheddarSlice },
      { id: 'smoked-bacon', name: 'Crispy Bacon Strip', price: 2.50, maxQuantity: 3, nutrition: N.crispyBacon },
      { id: 'extra-pickles', name: 'Extra Pickled Cucumbers', price: 1.00, maxQuantity: 3, nutrition: N.pickles },
    ],
  },

  // 2. Double Smashed Bacon Burger
  {
    id: 'double-smashed-bacon-burger',
    estimatedMinutes: 30,
    name: 'Double Smashed Bacon Burger',
    category: 'Burgers',
    sortOrder: 2,
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
    nutrition: sumNutrition(N.briocheBun, N.patty90, N.patty90, N.crispyBacon, N.cheddarSlice, N.pickles, N.shavedOnion, N.secretSauce20),
    prepTime: '6 min',
    isBestseller: true,
    imageSlot: '/images/menu/double-smashed-bacon.jpg',
    imageLabel: 'Double smashed beef patties with crispy bacon and melted cheddar',
    imageStyle: 'scene',
    imagePosition: 'center 55%',
    includedIngredients: [
      { id: 'patty-90g-1', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-90g-2', name: 'Second Smashed Patty (90 g)', isRequired: false, nutrition: N.patty90 },
      { id: 'crispy-bacon', name: 'Crispy Smoked Bacon', isRequired: false, nutrition: N.crispyBacon },
      { id: 'melted-cheddar', name: 'Melted Cheddar Cheese', isRequired: false, nutrition: N.cheddarSlice },
      { id: 'pickled-cucumbers', name: 'Pickled Cucumber Rounds', isRequired: false, nutrition: N.pickles },
      { id: 'shaved-onion', name: 'Shaved Sweet Onion', isRequired: false, nutrition: N.shavedOnion },
      { id: 'burger-sauce', name: 'Creamy Burger Sauce', isRequired: false, nutrition: N.secretSauce20 },
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty-90g', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3, nutrition: N.patty90 },
      { id: 'extra-bacon', name: 'Extra Crispy Bacon Strips', price: 2.50, maxQuantity: 3, nutrition: N.crispyBacon },
      { id: 'extra-cheddar', name: 'Extra Melted Cheddar', price: 2.00, maxQuantity: 3, nutrition: N.cheddarSlice },
      { id: 'extra-pickles', name: 'Extra Pickled Cucumbers', price: 1.00, maxQuantity: 3, nutrition: N.pickles },
      { id: 'extra-sauce', name: 'Extra House Burger Sauce', price: 1.50, maxQuantity: 3, nutrition: N.secretSauce20 },
    ],
  },

  // 3. Bun & Patty Signature Burger
  {
    id: 'bun-patty-smash',
    estimatedMinutes: 30,
    name: 'Bun & Patty Signature Burger',
    category: 'Burgers',
    sortOrder: 3,
    price: 27.90,
    description: 'Two smashed 90 g beef patties with melted American cheese, two fried eggs, crispy bacon, pickles, and house special sauce on a brioche bun.',
    longDescription: 'Our house signature, built tall and messy. Two 90 g beef patties smashed on 260°C carbon steel and blanketed in melted American cheese, stacked with two runny fried eggs, crispy smoked bacon, pickles, and our house special sauce on a butter-toasted brioche bun.',
    mainIngredients: [
      'Toasted Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Melted American Cheese',
      'Two Fried Eggs',
      'Crispy Smoked Bacon',
      'Pickles',
      'House Special Sauce',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Mustard [Placeholder]'],
    tags: ['House Signature', 'Fried Eggs'],
    nutrition: sumNutrition(N.briocheBun, N.patty90, N.patty90, N.americanCheese2, N.friedEgg, N.friedEgg, N.crispyBacon, N.pickles, N.specialSauce20),
    prepTime: '7 min',
    isBestseller: true,
    isChefSpecial: true,
    imageSlot: '/images/menu/bun-patty-signature.jpg',
    imageLabel: 'Tall messy double smash burger with two runny fried eggs and melted cheese dripping down',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: true },
      { id: 'american-cheese', name: 'Melted American Cheese', isRequired: false, nutrition: N.americanCheese2 },
      { id: 'fried-eggs', name: 'Two Fried Eggs', isRequired: false, nutrition: sumNutrition(N.friedEgg, N.friedEgg) },
      { id: 'crispy-bacon', name: 'Crispy Smoked Bacon', isRequired: false, nutrition: N.crispyBacon },
      { id: 'pickles', name: 'Pickles', isRequired: false, nutrition: N.pickles },
      { id: 'house-special-sauce', name: 'House Special Sauce', isRequired: false, nutrition: N.specialSauce20 },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3, nutrition: N.patty90 },
      { id: 'extra-american-cheese', name: 'Extra American Cheese', price: 2.00, maxQuantity: 3, nutrition: N.americanCheeseSlice },
      { id: 'extra-fried-egg', name: 'Extra Fried Egg', price: 2.00, maxQuantity: 3, nutrition: N.friedEgg },
      { id: 'extra-bacon', name: 'Extra Crispy Bacon', price: 2.50, maxQuantity: 3, nutrition: N.crispyBacon },
    ],
  },

  // 4. Sweet Heat Pickled Jalapeño
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
    nutrition: sumNutrition(N.briocheBun, N.patty90, N.patty90, N.pepperJack, N.jalapenos, N.crispyShallots, N.hotHoney),
    prepTime: '5 min',
    isSpicy: true,
    imageSlot: '/images/menu/sweet-heat-jalapeno.jpg',
    imageLabel: 'Burger with glistening honey drizzle and vibrant green pickled peppers',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false, nutrition: N.patty90 },
      { id: 'pepper-jack', name: 'Spicy Pepper Jack Cheese', isRequired: false, nutrition: N.pepperJack },
      { id: 'pickled-jalapenos', name: 'Quick-Pickled Jalapeños', isRequired: false, nutrition: N.jalapenos },
      { id: 'crispy-shallots', name: 'Crispy Fried Shallots', isRequired: false, nutrition: N.crispyShallots },
      { id: 'hot-honey', name: 'Wildflower Hot Honey Drizzle', isRequired: false, nutrition: N.hotHoney },
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3, nutrition: N.patty90 },
      { id: 'extra-bacon', name: 'Crispy Bacon Strip', price: 2.50, maxQuantity: 3, nutrition: N.crispyBacon },
      { id: 'extra-jalapenos', name: 'Extra Pickled Jalapeños', price: 1.00, maxQuantity: 3, nutrition: N.jalapenos },
      { id: 'extra-hot-honey', name: 'Side Wildflower Hot Honey', price: 1.50, maxQuantity: 3, nutrition: N.hotHoney },
    ],
  },

  // 5. Buttermilk Fried Chicken Sandwich
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
    nutrition: sumNutrition(N.sesameBriocheBun, N.friedChickenThigh, N.cabbageSlaw, N.pickles, N.garlicAioli20),
    prepTime: '7 min',
    imageSlot: '/images/menu/buttermilk-crispy-chicken.jpg',
    imageLabel: 'Craggy golden brown fried chicken sandwich with crunchy purple cabbage slaw',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'chicken-fillet', name: 'Crispy Buttermilk Chicken Thigh', isRequired: true },
      { id: 'cabbage-slaw', name: 'Cabbage-Apple Slaw', isRequired: false, nutrition: N.cabbageSlaw },
      { id: 'dill-pickles', name: 'Pickled Cucumber Slices', isRequired: false, nutrition: N.pickles },
      { id: 'garlic-aioli', name: 'Smoked Garlic Aioli', isRequired: false, nutrition: N.garlicAioli20 },
      { id: 'brioche-bun', name: 'Toasted Sesame Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-slaw', name: 'Extra Cabbage-Apple Slaw', price: 1.50, maxQuantity: 2, nutrition: N.cabbageSlaw },
      { id: 'add-cheese', name: 'Melted Cheddar Cheese', price: 2.00, maxQuantity: 2, nutrition: N.cheddarSlice },
      { id: 'add-bacon', name: 'Crispy Smoked Bacon', price: 2.50, maxQuantity: 3, nutrition: N.crispyBacon },
      { id: 'add-jalapenos', name: 'Charred Jalapeños', price: 1.00, maxQuantity: 3, nutrition: N.jalapenos },
    ],
  },

  // 6. Mozzarella Burger
  {
    id: 'crispy-halloumi-mint',
    estimatedMinutes: 30,
    name: 'Mozzarella Burger',
    category: 'Burgers',
    sortOrder: 6,
    price: 21.90,
    description: 'Fried mozzarella, cheddar, cheese sauce, house special sauce, iceberg lettuce, and tomato on a toasted burger bun.',
    longDescription: 'A meat-free burger built around a thick, golden fried mozzarella patty with a crisp crumb and a molten, stretchy centre. Layered with melted cheddar, warm cheese sauce, our house special sauce, crunchy iceberg lettuce, and fresh tomato on a toasted burger bun.',
    mainIngredients: [
      'Toasted Burger Bun',
      'Fried Mozzarella Patty',
      'Melted Cheddar',
      'Cheese Sauce',
      'House Special Sauce',
      'Iceberg Lettuce',
      'Fresh Tomato',
    ],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Mustard [Placeholder]'],
    badge: 'Vegetarian',
    tags: ['Vegetarian', 'Fried Mozzarella'],
    nutrition: sumNutrition(N.burgerBun, N.friedMozzarella, N.cheddarSlice, N.cheeseSauce30, N.specialSauce20, N.iceberg, N.tomato),
    prepTime: '6 min',
    isVegetarian: true,
    imageSlot: '/images/menu/mozzarella-burger.jpg',
    imageLabel: 'Burger with a thick golden fried mozzarella patty and stretchy cheese pulling out',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'burger-bun', name: 'Toasted Burger Bun', isRequired: true },
      { id: 'fried-mozzarella', name: 'Fried Mozzarella Patty', isRequired: true },
      { id: 'melted-cheddar', name: 'Melted Cheddar Cheese', isRequired: false, nutrition: N.cheddarSlice },
      { id: 'cheese-sauce-layer', name: 'Cheese Sauce', isRequired: false, nutrition: N.cheeseSauce30 },
      { id: 'house-special-sauce', name: 'House Special Sauce', isRequired: false, nutrition: N.specialSauce20 },
      { id: 'iceberg-crisp', name: 'Crisp Iceberg Lettuce', isRequired: false, nutrition: N.iceberg },
      { id: 'fresh-tomato', name: 'Fresh Tomato', isRequired: false, nutrition: N.tomato },
    ],
    availableExtras: [
      { id: 'extra-fried-mozzarella', name: 'Extra Fried Mozzarella', price: 5.00, maxQuantity: 2, nutrition: N.friedMozzarella },
      { id: 'extra-cheddar', name: 'Extra Melted Cheddar', price: 2.00, maxQuantity: 3, nutrition: N.cheddarSlice },
      { id: 'extra-burger-cheese-sauce', name: 'Extra Cheese Sauce', price: 2.00, maxQuantity: 3, nutrition: N.cheeseSauce30 },
      { id: 'add-beef-patty', name: 'Add Beef Patty (90 g)', price: 5.50, maxQuantity: 2, nutrition: N.patty90 },
    ],
  },

  // 7. The Big One
  {
    id: 'the-big-one',
    estimatedMinutes: 40,
    name: 'The Big One',
    category: 'Burgers',
    sortOrder: 7,
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
    nutrition: sumNutrition(N.largeSesameBun, N.beef750, N.cheddar6Layers, N.baconLayers2, N.saperaviOnions, N.iceberg, N.pickles, N.specialSauce40),
    prepTime: '10 min',
    isBestseller: true,
    isChefSpecial: true,
    imageSlot: '/images/menu/the-big-one.jpg',
    imageLabel: 'Towering multi-layer smash burger with melted cheese ribbons and skewers',
    imageStyle: 'scene',
    imagePosition: 'center 45%',
    includedIngredients: [
      { id: 'beef-750g-core', name: '750 g Smashed Beef Patties', isRequired: true },
      { id: 'cheddar-6-layers', name: 'Melted Cheddar (6 layers)', isRequired: false, nutrition: N.cheddar6Layers },
      { id: 'bacon-2-layers', name: 'Crispy Smoked Bacon (2 layers)', isRequired: false, nutrition: N.baconLayers2 },
      { id: 'saperavi-onions', name: 'Saperavi Wine Marinated Onions', isRequired: false, nutrition: N.saperaviOnions },
      { id: 'iceberg-crisp', name: 'Crisp Iceberg Lettuce', isRequired: false, nutrition: N.iceberg },
      { id: 'pickled-cucumbers', name: 'Pickled Cucumber Slices', isRequired: false, nutrition: N.pickles },
      { id: 'special-burger-sauce', name: 'Special Burger Sauce', isRequired: false, nutrition: N.specialSauce40 },
      { id: 'large-sesame-bun', name: 'Large Toasted Sesame Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-cheddar-ribbon', name: 'Extra Cheddar Cheese Layer', price: 2.50, maxQuantity: 3, nutrition: N.cheddarSlice },
      { id: 'extra-bacon-strip', name: 'Extra Crispy Bacon Strips', price: 3.00, maxQuantity: 3, nutrition: placeholderNutrition(120, 0, 9, 9) },
      { id: 'extra-saperavi-onion', name: 'Extra Saperavi Wine Onions', price: 1.50, maxQuantity: 3, nutrition: N.saperaviOnions },
      { id: 'cheese-injection-shot', name: 'Cheese Injection Syringe Refill', price: 6.50, maxQuantity: 2, nutrition: N.cheeseSauce60 },
      { id: 'extra-special-sauce', name: 'Extra Special Burger Sauce', price: 1.50, maxQuantity: 3, nutrition: N.secretSauce20 },
    ],
  },

  // 8. Truffle Forest Melt
  {
    id: 'truffle-forest-melt',
    estimatedMinutes: 30,
    name: 'Truffle Forest Melt',
    category: 'Burgers',
    sortOrder: 8,
    price: 27.90,
    description: 'Double 90 g smashed patties, sautéed brown beech mushrooms, melted Swiss Gruyère, and black truffle aioli on brioche.',
    longDescription: 'An intensely savory forest-inspired creation featuring two 90 g dry-aged beef patties. Smothered in butter-sautéed brown beech mushrooms, nutty aged Swiss Gruyère, and fragrant black truffle emulsion on our signature griddled brioche bun.',
    mainIngredients: [
      'Toasted Brioche Bun',
      'Two Smashed Beef Patties (90 g each)',
      'Sautéed Brown Beech Mushrooms',
      'Aged Swiss Gruyère Cheese',
      'Black Truffle Aioli',
    ],
    beefWeight: '180 g beef (2 × 90 g patties) [Placeholder]',
    allergens: ['Gluten', 'Dairy', 'Eggs [Placeholder]'],
    tags: ['Truffle', 'Gruyère'],
    nutrition: sumNutrition(N.briocheBun, N.patty90, N.patty90, N.gruyere, N.sauteedMushrooms, N.truffleAioli20),
    prepTime: '6 min',
    isChefSpecial: true,
    imageSlot: '/images/menu/truffle-forest-melt.jpg',
    imageLabel: 'Mushroom and melted gruyere burger on dark slate board',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'patty-primary', name: 'First Smashed Patty (90 g)', isRequired: true },
      { id: 'patty-second', name: 'Second Smashed Patty (90 g)', isRequired: false, nutrition: N.patty90 },
      { id: 'swiss-gruyere', name: 'Melted Swiss Gruyère', isRequired: false, nutrition: N.gruyere },
      { id: 'sauteed-mushrooms', name: 'Sautéed Beech Mushrooms', isRequired: false, nutrition: N.sauteedMushrooms },
      { id: 'truffle-aioli', name: 'Black Truffle Aioli', isRequired: false, nutrition: N.truffleAioli20 },
      { id: 'brioche-bun', name: 'Toasted Brioche Bun', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3, nutrition: N.patty90 },
      { id: 'extra-gruyere', name: 'Extra Swiss Gruyère', price: 2.50, maxQuantity: 3, nutrition: N.gruyere },
      { id: 'extra-mushrooms', name: 'Extra Sautéed Mushrooms', price: 2.00, maxQuantity: 3, nutrition: N.sauteedMushrooms },
      { id: 'truffle-aioli-extra', name: 'Extra Black Truffle Aioli', price: 2.00, maxQuantity: 3, nutrition: N.truffleAioli20 },
    ],
  },

  // =========================================================================
  // 2. SIDE DISHES
  // =========================================================================

  // 1. Fries
  {
    id: 'golden-crinkle-fries',
    estimatedMinutes: 15,
    name: 'Fries',
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
    nutrition: sumNutrition(N.fries170),
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/golden-crinkle-fries.jpg',
    imageLabel: 'Stainless steel wire basket overflowing with golden crinkle cut fries',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'crinkle-fries', name: 'Thick-Cut Crinkle Fries', isRequired: true },
      { id: 'rosemary-salt', name: 'Rosemary & Thyme Salt', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'side-secret-sauce', name: 'Side House Special Sauce Cup', price: 1.50, maxQuantity: 3, nutrition: N.secretSauceCup },
      { id: 'side-truffle-aioli', name: 'Side Truffle Aioli Cup', price: 2.00, maxQuantity: 3, nutrition: N.truffleAioliCup },
    ],
  },

  // 2. Truffle Fries
  {
    id: 'parmesan-truffle-fries',
    estimatedMinutes: 15,
    name: 'Truffle Fries',
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
    nutrition: sumNutrition(N.fries170, N.parmesanSnow, N.truffleOil),
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/parmesan-truffle-fries.jpg',
    imageLabel: 'Dark ceramic bowl of golden truffle parmesan fries with fresh parsley',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'hand-cut-fries', name: 'Hand-Cut Skin-On Fries', isRequired: true },
      { id: 'parmesan-dust', name: '24-Month Aged Parmesan', isRequired: false, nutrition: N.parmesanSnow },
      { id: 'white-truffle-oil', name: 'White Truffle Oil Drizzle', isRequired: false, nutrition: N.truffleOil },
      { id: 'black-pepper', name: 'Cracked Tellicherry Pepper', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'extra-parmesan', name: 'Extra Parmesan Snowfall', price: 2.00, maxQuantity: 3, nutrition: N.parmesanSnow },
      { id: 'side-truffle-aioli', name: 'Side Black Truffle Aioli', price: 2.00, maxQuantity: 3, nutrition: N.truffleAioliCup },
    ],
  },

  // 3. Fries with Cheese and Bacon
  {
    id: 'fries-with-cheese-and-bacon',
    estimatedMinutes: 15,
    name: 'Fries with Cheese and Bacon',
    category: 'Side Dishes',
    sortOrder: 3,
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
    nutrition: sumNutrition(N.fries170, N.cheeseSauce80, N.baconBits, N.chives),
    prepTime: '4 min',
    isBestseller: true,
    imageSlot: '/images/menu/fries-cheese-bacon.jpg',
    imageLabel: 'Crispy golden fries covered in molten cheese sauce and crisp chopped bacon',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'crispy-fries', name: 'Crispy Hand-Cut Fries', isRequired: true },
      { id: 'hot-cheese-sauce', name: 'Hot Cheddar Cheese Sauce', isRequired: false, nutrition: N.cheeseSauce80 },
      { id: 'chopped-bacon', name: 'Chopped Crispy Bacon', isRequired: false, nutrition: N.baconBits },
      { id: 'fresh-chives', name: 'Fresh Chopped Chives', isRequired: false, nutrition: N.chives },
    ],
    availableExtras: [
      { id: 'extra-cheese-sauce', name: 'Extra Hot Cheese Sauce Ladle', price: 2.50, maxQuantity: 3, nutrition: N.cheeseSauce60 },
      { id: 'extra-bacon-bits', name: 'Extra Crispy Bacon Bits', price: 2.50, maxQuantity: 3, nutrition: N.baconBits },
      { id: 'pickled-jalapenos', name: 'Sliced Pickled Jalapeños', price: 1.00, maxQuantity: 3, nutrition: N.jalapenos },
    ],
  },

  // 4. Bowl Mix
  {
    id: 'bowl-mix',
    estimatedMinutes: 20,
    name: 'Bowl Mix',
    category: 'Side Dishes',
    sortOrder: 4,
    price: 22.90,
    description: 'A loaded bowl of crispy fries topped with a chopped 90 g smashed beef patty, crispy bacon, shredded iceberg, hot cheese sauce, BBQ sauce, and grated parmesan.',
    longDescription: 'Our loaded plancha comfort bowl: a generous base of hot, crispy golden fries topped with a freshly chopped 90 g smashed beef patty, crispy smoked bacon pieces, shredded crunchy iceberg lettuce, hot cheddar cheese sauce, smoky BBQ sauce, and a dusting of grated parmesan.',
    mainIngredients: [
      'Crispy Golden Fries',
      'Chopped 90 g Smashed Beef Patty',
      'Crispy Bacon',
      'Shredded Iceberg Lettuce',
      'Hot Cheese Sauce',
      'BBQ Sauce',
      'Grated Parmesan',
    ],
    beefWeight: '90 g beef (1 chopped patty) [Placeholder]',
    allergens: ['Dairy', 'Mustard (BBQ sauce) [Placeholder]'],
    tags: ['Loaded Bowl', 'Smashed Beef', 'New'],
    nutrition: sumNutrition(N.fries170, N.patty90, N.baconBits, N.iceberg, N.cheeseSauce60, N.bbqSauce, N.parmesanGrated),
    prepTime: '6 min',
    imageSlot: '/images/menu/bowl-mix.jpg',
    imageLabel: 'Dark bowl of crispy fries loaded with chopped beef, bacon, iceberg, cheese sauce, BBQ sauce, and parmesan',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'crispy-fries', name: 'Crispy Fries', isRequired: false, nutrition: N.fries170 },
      { id: 'chopped-patty', name: 'Chopped Smashed Beef Patty (90 g)', isRequired: false, nutrition: N.patty90 },
      { id: 'crispy-bacon', name: 'Crispy Bacon', isRequired: false, nutrition: N.baconBits },
      { id: 'shredded-iceberg', name: 'Shredded Iceberg Lettuce', isRequired: false, nutrition: N.iceberg },
      { id: 'hot-cheese-sauce', name: 'Hot Cheese Sauce', isRequired: false, nutrition: N.cheeseSauce60 },
      { id: 'bbq-sauce', name: 'BBQ Sauce', isRequired: false, nutrition: N.bbqSauce },
      { id: 'grated-parmesan', name: 'Grated Parmesan', isRequired: false, nutrition: N.parmesanGrated },
    ],
    availableExtras: [
      { id: 'extra-patty', name: 'Extra Smashed Patty (90 g)', price: 5.50, maxQuantity: 3, nutrition: N.patty90 },
      { id: 'extra-bowl-bacon', name: 'Extra Crispy Bacon', price: 2.50, maxQuantity: 3, nutrition: N.baconBits },
      { id: 'extra-bowl-cheese-sauce', name: 'Extra Hot Cheese Sauce', price: 2.50, maxQuantity: 3, nutrition: N.cheeseSauce60 },
      { id: 'extra-grated-parmesan', name: 'Extra Grated Parmesan', price: 2.00, maxQuantity: 3, nutrition: N.parmesanGrated },
    ],
  },

  // 5. Caesar Salad
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
    nutrition: sumNutrition(N.romaine, N.grilledChicken, N.parmesanSnow, N.croutons, N.caesarDressing),
    prepTime: '5 min',
    imageSlot: '/images/menu/caesar-salad.jpg',
    imageLabel: 'Elegant Caesar salad bowl with grilled chicken slices and shaved parmesan',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'romaine-hearts', name: 'Crisp Romaine Hearts', isRequired: true },
      { id: 'grilled-chicken-slices', name: 'Grilled Chicken Breast Slices', isRequired: false, nutrition: N.grilledChicken },
      { id: 'shaved-parmesan', name: 'Shaved Aged Parmesan', isRequired: false, nutrition: N.parmesanSnow },
      { id: 'brioche-croutons', name: 'Brioche Garlic Croutons', isRequired: false, nutrition: N.croutons },
      { id: 'caesar-dressing', name: 'Creamy Caesar Dressing', isRequired: false, nutrition: N.caesarDressing },
    ],
    availableExtras: [
      { id: 'extra-grilled-chicken', name: 'Extra Grilled Chicken Portion', price: 5.00, maxQuantity: 2, nutrition: N.grilledChicken },
      { id: 'extra-parmesan', name: 'Extra Shaved Parmesan', price: 2.50, maxQuantity: 3, nutrition: N.parmesanSnow },
      { id: 'extra-croutons', name: 'Extra Garlic Croutons', price: 1.00, maxQuantity: 2, nutrition: N.croutons },
      { id: 'side-caesar-dressing', name: 'Side Caesar Dressing Cup', price: 1.50, maxQuantity: 2, nutrition: N.caesarDressing },
    ],
  },

  // 6. Onion Rings
  {
    id: 'onion-rings',
    estimatedMinutes: 15,
    name: 'Onion Rings',
    category: 'Side Dishes',
    sortOrder: 6,
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
    nutrition: sumNutrition(N.onionRings180),
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/onion-rings.jpg',
    imageLabel: 'Tower stack of thick golden panko onion rings on parchment paper',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'onion-rings-core', name: 'Panko Onion Rings', isRequired: true },
      { id: 'paprika-salt', name: 'Smoked Paprika Seasoning', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'side-secret-sauce', name: 'Side House Special Sauce Cup', price: 1.50, maxQuantity: 3, nutrition: N.secretSauceCup },
      { id: 'side-bacon-jam', name: 'Side Smoky Bacon Jam Cup', price: 2.00, maxQuantity: 3, nutrition: N.baconJam30 },
    ],
  },

  // 7. Chicken Wings
  {
    id: 'chicken-wings',
    estimatedMinutes: 20,
    name: 'Chicken Wings',
    category: 'Side Dishes',
    sortOrder: 7,
    price: 18.90,
    description: '8 crispy chicken wings tossed in your choice of spicy or BBQ glaze, served with a dipping sauce.',
    longDescription: 'Eight juicy chicken wings, lightly dusted in seasoned flour and fried until crackling-crisp, then tossed in your choice of glaze: a fiery butter-chili Spicy or a sticky, smoky BBQ. Served with a cool, creamy garlic-herb dipping sauce.',
    mainIngredients: [
      '8 Crispy Chicken Wings',
      'Choice of Spicy or BBQ Glaze',
      'Creamy Garlic-Herb Dipping Sauce',
    ],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Mustard (BBQ glaze) [Placeholder]'],
    tags: ['Crispy', 'Chicken', 'New'],
    // Base is the plain wings + dip; the chosen glaze adds its own values
    nutrition: sumNutrition(N.chickenWings8, N.dippingSauce30),
    prepTime: '12 min',
    imageSlot: '/images/menu/chicken-wings.jpg',
    imageLabel: 'Crispy glossy chicken wings with a creamy dip on a dark serving tray',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'crispy-wings-8', name: '8 Crispy Chicken Wings', isRequired: true },
      { id: 'dipping-sauce', name: 'Dipping Sauce', isRequired: false, nutrition: N.dippingSauce30 },
    ],
    availableExtras: [
      { id: 'extra-wings-4', name: 'Extra Wings (4 pcs)', price: 8.90, maxQuantity: 3, nutrition: N.chickenWings4 },
      { id: 'extra-dipping-sauce', name: 'Extra Dipping Sauce', price: 1.50, maxQuantity: 3, nutrition: N.dippingSauce30 },
    ],
    requiredChoice: {
      id: 'wing-flavor',
      title: 'Choose a flavor',
      defaultOptionId: undefined, // Nothing preselected
      options: [
        { id: 'spicy', name: 'Spicy', priceAdjustment: 0.00, color: '#DC2626', nutrition: N.spicyWingGlaze },
        { id: 'bbq', name: 'BBQ', priceAdjustment: 0.00, color: '#7C2D12', nutrition: N.bbqWingGlaze },
      ],
    },
  },

  // =========================================================================
  // 3. SAUCES
  // =========================================================================

  // 1. Cheese Sauce
  {
    id: 'cheese-sauce',
    estimatedMinutes: 2,
    name: 'Cheese Sauce',
    category: 'Sauces',
    sortOrder: 1,
    price: 3.90,
    description: 'A small cup of smooth, hot cheddar cheese sauce for dipping.',
    longDescription: 'A small cup of smooth, velvety hot cheddar cheese sauce, made for dipping fries, onion rings, or the crispy edges of your burger.',
    mainIngredients: [
      'Hot Cheddar Cheese Sauce',
    ],
    volume: '80 ml cup',
    allergens: ['Dairy [Placeholder]'],
    tags: ['Hot Cheese', 'Dip', 'New'],
    nutrition: sumNutrition(N.cheeseSauce80),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/cheese-sauce.jpg',
    imageLabel: 'Small ceramic cup of smooth hot cheddar cheese sauce on dark slate',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'cheese-sauce-tub', name: '80 ml Hot Cheese Sauce Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // 2. Ketchup
  {
    id: 'ketchup',
    estimatedMinutes: 2,
    name: 'Ketchup',
    category: 'Sauces',
    sortOrder: 2,
    price: 1.50,
    description: 'A small cup of classic tomato ketchup.',
    longDescription: 'A small cup of classic, rich tomato ketchup — sweet, tangy, and made for fries, onion rings, and wings.',
    mainIngredients: [
      'Classic Tomato Ketchup',
    ],
    volume: '30 ml cup',
    allergens: ['None [Placeholder]'],
    tags: ['Classic', 'Dip', 'New'],
    nutrition: sumNutrition(N.ketchup30),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/ketchup.jpg',
    imageLabel: 'Small bowl of glossy red tomato ketchup on a dark background',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'ketchup-cup', name: '30 ml Ketchup Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // 3. Cheese Injection
  {
    id: 'cheese-injection',
    estimatedMinutes: 5,
    name: 'Cheese Injection',
    category: 'Sauces',
    sortOrder: 3,
    price: 6.50,
    description: 'A food-safe, reusable stainless steel culinary injector filled with hot cheese sauce, ready to inject straight into your burger.',
    longDescription: 'An interactive treat for true cheese lovers. A food-safe, reusable stainless steel kitchen injector with a three-ring plunger and a long injection needle, filled with 60 ml of piping hot, velvety melted cheddar sauce ready to inject directly into the center of your burger.',
    mainIngredients: [
      'Reusable Stainless Steel Culinary Injector [Placeholder tool]',
      '60 ml Piping Hot Melted Cheddar Sauce',
    ],
    volume: '60 ml cheese sauce fill',
    allergens: ['Dairy [Placeholder]'],
    tags: ['Hot Cheese', 'Culinary Injector', 'Interactive', 'New'],
    nutrition: sumNutrition(N.cheeseSauce60),
    prepTime: '2 min',
    isBestseller: true,
    imageSlot: '/images/menu/cheese-injection.jpg',
    imageLabel: 'Stainless steel three-ring culinary injector on a rustic wooden board beside a pool of cheese sauce',
    imageStyle: 'scene',
    imagePosition: 'center 58%',
    includedIngredients: [
      { id: 'stainless-syringe', name: 'Stainless Steel Culinary Injector', isRequired: true },
      { id: 'hot-cheddar-fill', name: 'Hot Melted Cheddar Fill (60 ml)', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-cheese-refill', name: 'Extra Hot Cheese Syringe Refill', price: 4.00, maxQuantity: 2, nutrition: N.cheeseSauce60 },
      { id: 'jalapeno-cheese-refill', name: 'Jalapeño Hot Cheese Refill', price: 4.50, maxQuantity: 2, nutrition: sumNutrition(N.cheeseSauce60, N.jalapenos) },
    ],
  },

  // 4. House Special Sauce
  {
    id: 'sauce-house-secret',
    estimatedMinutes: 5,
    name: 'House Special Sauce',
    category: 'Sauces',
    sortOrder: 4,
    price: 3.00,
    description: 'Our proprietary blend of kewpie mayonnaise, coarse whole grain mustard, brine-pickled capers, and sweet relish.',
    longDescription: 'The savory backbone of our classic cheeseburgers. Prepared daily with rich mayonnaise, crushed capers, tangy pickle relish, and a house blend of ground roasted spices.',
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
    nutrition: sumNutrition(N.secretSauce80),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/sauce-house-secret.jpg',
    imageLabel: 'White porcelain ramekin of orange-tinted house burger sauce with cracked pepper',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'secret-sauce-tub', name: '80 ml House Special Sauce Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // 5. Black Truffle Aioli
  {
    id: 'sauce-truffle-aioli',
    estimatedMinutes: 5,
    name: 'Black Truffle Aioli',
    category: 'Sauces',
    sortOrder: 5,
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
    nutrition: sumNutrition(N.truffleAioli80),
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

  // 6. Smoky Bourbon Bacon Jam
  {
    id: 'smoky-bourbon-bacon-jam',
    estimatedMinutes: 5,
    name: 'Smoky Bourbon Bacon Jam',
    category: 'Sauces',
    sortOrder: 6,
    price: 4.50,
    description: 'House-made savory jam of slow-cooked caramelized onions, smoked bacon, bourbon, shallots, and dark molasses.',
    longDescription: 'Our signature condiment cooked low and slow for six hours. Caramelized onions break down with shallots, diced smoked bacon, and a splash of bourbon into an amber, deeply savory spread.',
    mainIngredients: [
      'Slow-Caramelized Onions',
      'Smoked Applewood Bacon',
      'Kentucky Bourbon',
      'Caramelized Shallots',
      'Dark Molasses & Cider Vinegar',
    ],
    volume: '80 ml jar',
    allergens: ['None [Placeholder]'],
    tags: ['House Specialty', 'Small Batch'],
    nutrition: sumNutrition(N.baconJam80),
    prepTime: '1 min',
    isBestseller: true,
    imageSlot: '/images/menu/smoky-bourbon-bacon-jam.jpg',
    imageLabel: 'Dark ramekin of chunky smoky onion and bourbon bacon jam with wooden paddle',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'bacon-jam-tub', name: '80 ml Smoky Bacon Jam Cup', isRequired: true },
    ],
    availableExtras: [],
  },

  // =========================================================================
  // 4. DESSERTS
  // =========================================================================

  // 1. Skillet Dark Chocolate Brownie
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
    nutrition: sumNutrition(N.fudgeBrownie, N.bourbonCaramel),
    prepTime: '4 min',
    isVegetarian: true,
    imageSlot: '/images/menu/warm-bourbon-caramel-brownie.jpg',
    imageLabel: 'Cast-iron mini skillet with dark chocolate brownie and caramel pool',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'fudge-brownie', name: 'Skillet Fudge Brownie Core', isRequired: true },
      { id: 'bourbon-caramel', name: 'Warm Bourbon Caramel Drizzle', isRequired: false, nutrition: N.bourbonCaramel },
      { id: 'flaky-sea-salt', name: 'Flaky Sea Salt Crystals', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'vanilla-scoop', name: 'Vanilla Custard Scoop', price: 3.50, maxQuantity: 2, nutrition: N.vanillaCustardScoop },
      { id: 'extra-caramel', name: 'Extra Bourbon Caramel', price: 1.50, maxQuantity: 2, nutrition: N.bourbonCaramel },
    ],
  },

  // 2. Lava Cake
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
    nutrition: sumNutrition(N.lavaCake, N.cocoaDusting),
    prepTime: '5 min',
    isVegetarian: true,
    imageSlot: '/images/menu/lava-cake.jpg',
    imageLabel: 'Warm dark chocolate lava cake cut open with rich chocolate flowing on black plate',
    imageStyle: 'scene',
    imagePosition: 'center 60%',
    includedIngredients: [
      { id: 'warm-lava-cake', name: 'Molten Chocolate Lava Cake', isRequired: true },
      { id: 'cocoa-dusting', name: 'Dutch Cocoa Powder Dusting', isRequired: false, nutrition: N.cocoaDusting },
    ],
    availableExtras: [
      { id: 'vanilla-ice-cream', name: 'Vanilla Ice Cream Scoop', price: 3.50, maxQuantity: 2, nutrition: N.vanillaIceCreamScoop },
      { id: 'warm-caramel-shot', name: 'Warm Bourbon Caramel Drizzle', price: 2.00, maxQuantity: 2, nutrition: N.bourbonCaramel },
    ],
  },

  // 3. Basque Cheesecake
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
    nutrition: sumNutrition(N.basqueCheesecake),
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
      { id: 'strawberry-sauce', name: 'Wild Strawberry Compote', price: 2.00, maxQuantity: 2, nutrition: N.strawberryCompote },
      { id: 'whipped-cream', name: 'Cultured Whipped Cream', price: 1.50, maxQuantity: 2, nutrition: N.whippedCream },
    ],
  },

  // =========================================================================
  // 5. DRINKS (soft drinks, Shake, Tea, then the Coffee subgroup)
  // =========================================================================

  // 1. Pepsi
  {
    id: 'pepsi-can',
    estimatedMinutes: 2,
    name: 'Pepsi',
    category: 'Drinks',
    sortOrder: 1,
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
    nutrition: sumNutrition(N.pepsi330, N.lemonWedge),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/pepsi.jpg',
    imageLabel: 'Chilled 330 ml Pepsi can with water droplets beside ice and lemon glass',
    imageStyle: 'isolated',
    imagePosition: 'center 60%',
    includedIngredients: [
      { id: 'pepsi-can-unit', name: 'Chilled Pepsi 330 ml Can', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false, nutrition: ZERO_NUTRITION },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false, nutrition: N.lemonWedge },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2, nutrition: N.lemonWedge },
    ],
  },

  // 2. Pepsi Zero Sugar
  {
    id: 'pepsi-zero-sugar',
    estimatedMinutes: 2,
    name: 'Pepsi Zero Sugar',
    category: 'Drinks',
    sortOrder: 2,
    price: 3.50,
    description: 'Chilled 330 ml can, zero sugar.',
    longDescription: 'Ice-cold 330 ml can of Pepsi Zero Sugar, served chilled from our beverage coolers. Served upon request with a glass tumbler of ice and a fresh slice of lemon.',
    mainIngredients: [
      'Chilled Pepsi Zero Sugar (330 ml Can)',
      'Optional Tumbler of Ice',
      'Optional Lemon Wedge',
    ],
    volume: '330 ml can',
    allergens: ['None (contains phenylalanine) [Placeholder]'],
    tags: ['Chilled Soda', 'Zero Sugar', 'New'],
    nutrition: sumNutrition(N.zeroSugar330, N.lemonWedge),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/pepsi-zero-sugar.jpg',
    imageLabel: 'Chilled black 330 ml Pepsi Zero Sugar can with condensation beside a glass of ice and lemon',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'pepsi-zero-can-unit', name: 'Chilled Pepsi Zero Sugar 330 ml Can', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false, nutrition: ZERO_NUTRITION },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false, nutrition: N.lemonWedge },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2, nutrition: N.lemonWedge },
    ],
  },

  // 3. Coca-Cola
  {
    id: 'coca-cola',
    estimatedMinutes: 2,
    name: 'Coca-Cola',
    category: 'Drinks',
    sortOrder: 3,
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
    nutrition: sumNutrition(N.cocaCola330, N.lemonWedge),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/coca-cola.jpg',
    imageLabel: 'Chilled red 330 ml Coca-Cola can with condensation beside a glass of ice and lemon',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'coca-cola-can-unit', name: 'Chilled Coca-Cola 330 ml Can', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false, nutrition: ZERO_NUTRITION },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false, nutrition: N.lemonWedge },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2, nutrition: N.lemonWedge },
    ],
  },

  // 4. Coca-Cola Zero Sugar
  {
    id: 'coca-cola-zero-sugar',
    estimatedMinutes: 2,
    name: 'Coca-Cola Zero Sugar',
    category: 'Drinks',
    sortOrder: 4,
    price: 3.50,
    description: 'Chilled 330 ml can, zero sugar.',
    longDescription: 'Ice-cold 330 ml can of Coca-Cola Zero Sugar, served chilled from our beverage coolers. Served upon request with a glass tumbler of ice and a fresh slice of lemon.',
    mainIngredients: [
      'Chilled Coca-Cola Zero Sugar (330 ml Can)',
      'Optional Tumbler of Ice',
      'Optional Lemon Wedge',
    ],
    volume: '330 ml can',
    allergens: ['None (contains phenylalanine) [Placeholder]'],
    tags: ['Chilled Soda', 'Zero Sugar', 'New'],
    nutrition: sumNutrition(N.zeroSugar330, N.lemonWedge),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/coca-cola-zero-sugar.jpg',
    imageLabel: 'Chilled red 330 ml Coca-Cola Zero Sugar can with black logo and condensation beside a glass of cola over ice',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'coca-cola-zero-can-unit', name: 'Chilled Coca-Cola Zero Sugar 330 ml Can', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false, nutrition: ZERO_NUTRITION },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false, nutrition: N.lemonWedge },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2, nutrition: N.lemonWedge },
    ],
  },

  // 5. Water
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
    nutrition: sumNutrition(N.lemonWedge),
    prepTime: '1 min',
    isVegetarian: true,
    imageSlot: '/images/menu/water.jpg',
    imageLabel: 'Clean unbranded 500 ml glass water bottle with fresh water droplets',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'water-bottle-unit', name: '500 ml Glass Water Bottle', isRequired: true },
      { id: 'glass-of-ice', name: 'Tumbler of Ice', isRequired: false, nutrition: ZERO_NUTRITION },
      { id: 'lemon-slice', name: 'Fresh Lemon Wedge', isRequired: false, nutrition: N.lemonWedge },
    ],
    availableExtras: [
      { id: 'extra-lemon-wedge', name: 'Extra Fresh Lemon Wedges', price: 0.50, maxQuantity: 2, nutrition: N.lemonWedge },
    ],
    requiredChoice: {
      id: 'water-type',
      title: 'Choose water type',
      defaultOptionId: 'still',
      options: [
        { id: 'still', name: 'Still', priceAdjustment: 0.00, color: '#38BDF8', nutrition: placeholderNutrition(0, 0, 0, 0) },
        { id: 'sparkling', name: 'Sparkling', priceAdjustment: 1.00, color: '#818CF8', nutrition: placeholderNutrition(0, 0, 0, 0) },
      ],
    },
  },

  // 6. Natural Juice
  {
    id: 'natural-juice',
    estimatedMinutes: 2,
    name: 'Natural Juice',
    category: 'Drinks',
    sortOrder: 6,
    price: 7.50,
    description: '300 ml glass of freshly squeezed natural juice, with no added sugar.',
    longDescription: '300 ml glass of freshly squeezed natural juice, with no added sugar. Prepared fresh to order from seasonal fruit. Choose your favorite flavor: orange, apple, pomegranate, pineapple, cherry, or a non-alcoholic mojito blend of fresh lime and mint.',
    mainIngredients: [
      'Freshly Squeezed 100% Natural Juice',
      'Whole Fresh Fruit',
      'No Added Sugar',
      'Optional Hand-Cut Ice',
    ],
    volume: '300 ml glass',
    allergens: ['None [Placeholder]'],
    tags: ['Freshly Squeezed', 'No Added Sugar', 'New'],
    // Base is zero: each flavor option carries the full juice nutrition
    nutrition: placeholderNutrition(0, 0, 0, 0),
    prepTime: '2 min',
    isVegetarian: true,
    imageSlot: '/images/menu/natural-juice.jpg',
    imageLabel: 'Freshly squeezed natural fruit juice in tall glass with orange, apple, and pomegranate',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'fresh-juice-base', name: 'Freshly Squeezed Natural Juice 300 ml', isRequired: true },
      { id: 'hand-cut-ice', name: 'Hand-Cut Ice', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'extra-mint-sprig', name: 'Fresh Wild Mint Sprig', price: 0.50, maxQuantity: 2, nutrition: placeholderNutrition(0, 0, 0, 0) },
    ],
    requiredChoice: {
      id: 'juice-flavor',
      title: 'Choose a flavor',
      defaultOptionId: undefined, // Nothing preselected!
      options: [
        { id: 'orange', name: 'Orange', priceAdjustment: 0.00, color: '#F97316', nutrition: placeholderNutrition(135, 30, 0, 2) },
        { id: 'apple', name: 'Apple', priceAdjustment: 0.00, color: '#84CC16', nutrition: placeholderNutrition(138, 33, 0, 0) },
        { id: 'pomegranate', name: 'Pomegranate', priceAdjustment: 0.00, color: '#991B1B', nutrition: placeholderNutrition(162, 39, 1, 0) },
        { id: 'pineapple', name: 'Pineapple', priceAdjustment: 0.00, color: '#FACC15', nutrition: placeholderNutrition(150, 37, 0, 1) },
        { id: 'cherry', name: 'Cherry', priceAdjustment: 0.00, color: '#BE123C', nutrition: placeholderNutrition(165, 38, 0, 1) },
        { id: 'mojito', name: 'Mojito (non-alcoholic)', priceAdjustment: 0.00, color: '#4ADE80', nutrition: placeholderNutrition(60, 15, 0, 0) },
      ],
    },
  },

  // 7. Shake
  {
    id: 'roasted-vanilla-bean-shake',
    estimatedMinutes: 2,
    name: 'Shake',
    category: 'Drinks',
    sortOrder: 7,
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
    nutrition: sumNutrition(N.frozenCustardShake, N.whippedCream),
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/roasted-vanilla-bean-shake.jpg',
    imageLabel: 'Heavy glass diner tumbler filled with thick vanilla shake and cream crown',
    imageStyle: 'isolated',
    imagePosition: 'center 45%',
    includedIngredients: [
      { id: 'frozen-custard', name: 'Frozen Dairy Custard Base', isRequired: true },
      { id: 'vanilla-caviar', name: 'Madagascar Vanilla Bean Caviar', isRequired: true },
      { id: 'whipped-cream', name: 'Cultured Whipped Cream Crown', isRequired: false, nutrition: N.whippedCream },
    ],
    availableExtras: [
      { id: 'caramel-swirl', name: 'Bourbon Caramel Swirl', price: 1.50, maxQuantity: 3, nutrition: N.bourbonCaramel },
      { id: 'fudge-swirl', name: 'Dark Chocolate Fudge Swirl', price: 1.50, maxQuantity: 3, nutrition: placeholderNutrition(100, 15, 4, 1) },
    ],
  },

  // 8. Tea
  {
    id: 'cold-steeped-lemon-ceylon-tea',
    estimatedMinutes: 2,
    name: 'Tea',
    category: 'Drinks',
    sortOrder: 8,
    price: 6.50,
    description: '18-hour cold brew Ceylon black tea, fresh lemon juice, and crushed lemon thyme over hand-cut ice.',
    longDescription: 'We steep high-grown single-origin Ceylon black tea leaves in cold filtered water for 18 hours to extract clean floral tannins without bitterness. Shaken with fresh lemon juice and a touch of honey, then poured over hand-cut ice with fresh lemon thyme.',
    mainIngredients: [
      '18-Hour Cold Brew Ceylon Black Tea',
      'Fresh Lemon Juice',
      'Lemon Thyme Sprig',
      'Pure Clover Honey Syrup',
    ],
    volume: '400 ml glass',
    allergens: ['None [Placeholder]'],
    tags: ['House Brewed', 'Botanical'],
    nutrition: sumNutrition(N.coldBrewTeaHoney, N.lemonJuice),
    prepTime: '2 min',
    isVegetarian: true,
    imageSlot: '/images/menu/cold-steeped-lemon-ceylon-tea.jpg',
    imageLabel: 'Tall ribbed glass of amber iced Ceylon tea with lemon wheel and thyme sprig',
    imageStyle: 'isolated',
    includedIngredients: [
      { id: 'tea-base', name: 'Cold-Steeped Ceylon Tea', isRequired: true },
      { id: 'lemon-juice', name: 'Fresh Lemon Juice', isRequired: false, nutrition: N.lemonJuice },
      { id: 'fresh-thyme', name: 'Fresh Lemon Thyme Sprig', isRequired: false, nutrition: ZERO_NUTRITION },
      { id: 'hand-cut-ice', name: 'Hand-Cut Ice', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'extra-sweetness', name: 'Add Honey Syrup Pump', price: 0.50, maxQuantity: 2, nutrition: N.honeyPump },
    ],
  },

  // 9. Espresso
  {
    id: 'espresso',
    estimatedMinutes: 5,
    name: 'Espresso',
    category: 'Drinks',
    subgroup: 'coffee',
    sortOrder: 9,
    price: 4.50,
    description: 'A single shot of rich espresso.',
    longDescription: 'A single shot of rich, freshly pulled specialty espresso with a thick golden crema and balanced chocolate-caramel notes.',
    mainIngredients: ['Single Shot of Specialty Espresso'],
    volume: '30 ml cup',
    allergens: ['None [Placeholder]'],
    tags: ['Coffee', 'Hot', 'New'],
    nutrition: sumNutrition(N.espressoShot),
    prepTime: '2 min',
    isVegetarian: true,
    imageSlot: '/images/menu/espresso.jpg',
    imageLabel: 'Dark ceramic espresso cup with golden crema on a slate board with coffee beans',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'espresso-shot', name: 'Espresso Shot', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-shot', name: 'Extra Espresso Shot', price: 1.50, maxQuantity: 2, nutrition: N.espressoShot },
      { id: 'side-milk', name: 'Splash of Milk', price: 0.50, maxQuantity: 2, nutrition: N.sideMilk },
    ],
  },

  // 10. Americano
  {
    id: 'americano',
    estimatedMinutes: 5,
    name: 'Americano',
    category: 'Drinks',
    subgroup: 'coffee',
    sortOrder: 10,
    price: 5.50,
    description: 'Espresso with hot water.',
    longDescription: 'Freshly pulled espresso lengthened with hot filtered water for a clean, aromatic cup of coffee.',
    mainIngredients: ['Specialty Espresso', 'Hot Filtered Water'],
    volume: '250 ml cup',
    allergens: ['None [Placeholder]'],
    tags: ['Coffee', 'Hot', 'New'],
    nutrition: sumNutrition(N.espressoShot, N.espressoShot),
    prepTime: '2 min',
    isVegetarian: true,
    imageSlot: '/images/menu/americano.jpg',
    imageLabel: 'Dark mug of americano coffee on a slate board',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'espresso-shot', name: 'Espresso Shot', isRequired: true },
      { id: 'hot-water', name: 'Hot Filtered Water', isRequired: true },
    ],
    availableExtras: [
      { id: 'extra-shot', name: 'Extra Espresso Shot', price: 1.50, maxQuantity: 2, nutrition: N.espressoShot },
      { id: 'side-milk', name: 'Splash of Milk', price: 0.50, maxQuantity: 2, nutrition: N.sideMilk },
    ],
  },

  // 11. Cappuccino
  {
    id: 'cappuccino',
    estimatedMinutes: 5,
    name: 'Cappuccino',
    category: 'Drinks',
    subgroup: 'coffee',
    sortOrder: 11,
    price: 6.50,
    description: 'Espresso with steamed milk and thick milk foam.',
    longDescription: 'Rich espresso topped with sweet steamed whole milk and a thick, silky layer of milk foam.',
    mainIngredients: ['Specialty Espresso', 'Steamed Whole Milk', 'Thick Milk Foam'],
    volume: '250 ml cup',
    allergens: ['Dairy [Placeholder]'],
    tags: ['Coffee', 'Hot', 'New'],
    nutrition: sumNutrition(N.espressoShot, N.milk150, N.milkFoam),
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/cappuccino.jpg',
    imageLabel: 'Cappuccino with thick milk foam in a dark ceramic cup',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'espresso-shot', name: 'Espresso Shot', isRequired: true },
      { id: 'steamed-milk', name: 'Steamed Whole Milk', isRequired: true },
      { id: 'milk-foam', name: 'Milk Foam', isRequired: false, nutrition: N.milkFoam },
    ],
    availableExtras: [
      { id: 'extra-shot', name: 'Extra Espresso Shot', price: 1.50, maxQuantity: 2, nutrition: N.espressoShot },
      { id: 'vanilla-syrup', name: 'Vanilla Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
      { id: 'caramel-syrup', name: 'Caramel Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
    ],
  },

  // 12. Latte
  {
    id: 'latte',
    estimatedMinutes: 5,
    name: 'Latte',
    category: 'Drinks',
    subgroup: 'coffee',
    sortOrder: 12,
    price: 7.00,
    description: 'Espresso with plenty of steamed milk and a thin layer of foam.',
    longDescription: 'Smooth espresso with a generous pour of silky steamed whole milk, finished with a thin layer of milk foam.',
    mainIngredients: ['Specialty Espresso', 'Steamed Whole Milk', 'Thin Milk Foam'],
    volume: '300 ml cup',
    allergens: ['Dairy [Placeholder]'],
    tags: ['Coffee', 'Hot', 'New'],
    nutrition: sumNutrition(N.espressoShot, N.milk250, N.milkFoam),
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/latte.jpg',
    imageLabel: 'Latte with latte art in a tall glass',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'espresso-shot', name: 'Espresso Shot', isRequired: true },
      { id: 'steamed-milk', name: 'Steamed Whole Milk', isRequired: true },
      { id: 'milk-foam', name: 'Milk Foam', isRequired: false, nutrition: N.milkFoam },
    ],
    availableExtras: [
      { id: 'extra-shot', name: 'Extra Espresso Shot', price: 1.50, maxQuantity: 2, nutrition: N.espressoShot },
      { id: 'vanilla-syrup', name: 'Vanilla Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
      { id: 'caramel-syrup', name: 'Caramel Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
    ],
  },

  // 13. Iced Coffee
  {
    id: 'iced-coffee',
    estimatedMinutes: 5,
    name: 'Iced Coffee',
    category: 'Drinks',
    subgroup: 'coffee',
    sortOrder: 13,
    price: 7.50,
    description: 'Chilled espresso with milk over ice.',
    longDescription: 'Freshly pulled espresso, chilled and poured over ice with cold whole milk.',
    mainIngredients: ['Chilled Specialty Espresso', 'Cold Whole Milk', 'Ice'],
    volume: '350 ml glass',
    allergens: ['Dairy [Placeholder]'],
    tags: ['Coffee', 'Iced', 'New'],
    nutrition: sumNutrition(N.espressoShot, N.espressoShot, N.milk150),
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/iced-coffee.jpg',
    imageLabel: 'Tall glass of iced coffee with milk swirling over ice',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'espresso-shot', name: 'Espresso Shot', isRequired: true },
      { id: 'cold-milk', name: 'Cold Whole Milk', isRequired: false, nutrition: N.milk150 },
      { id: 'ice-cubes', name: 'Ice Cubes', isRequired: false, nutrition: ZERO_NUTRITION },
    ],
    availableExtras: [
      { id: 'extra-shot', name: 'Extra Espresso Shot', price: 1.50, maxQuantity: 2, nutrition: N.espressoShot },
      { id: 'vanilla-syrup', name: 'Vanilla Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
      { id: 'caramel-syrup', name: 'Caramel Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
    ],
  },

  // 14. Iced Coffee with Ice Cream
  {
    id: 'glace',
    estimatedMinutes: 5,
    name: 'Iced Coffee with Ice Cream',
    category: 'Drinks',
    subgroup: 'coffee',
    sortOrder: 14,
    price: 9.00,
    description: 'Chilled coffee topped with a scoop of vanilla ice cream.',
    longDescription: 'Chilled freshly brewed coffee topped with a generous scoop of vanilla ice cream that slowly melts into the glass.',
    mainIngredients: ['Chilled Coffee', 'Vanilla Ice Cream Scoop'],
    volume: '350 ml glass',
    allergens: ['Dairy', 'Eggs [Placeholder]'],
    tags: ['Coffee', 'Iced', 'New'],
    nutrition: sumNutrition(N.espressoShot, N.espressoShot, N.vanillaIceCreamScoop),
    prepTime: '3 min',
    isVegetarian: true,
    imageSlot: '/images/menu/glace.jpg',
    imageLabel: 'Tall glass of iced coffee topped with a scoop of vanilla ice cream',
    imageStyle: 'scene',
    includedIngredients: [
      { id: 'chilled-coffee', name: 'Chilled Coffee', isRequired: true },
      { id: 'ice-cream-scoop', name: 'Vanilla Ice Cream Scoop', isRequired: false, nutrition: N.vanillaIceCreamScoop },
    ],
    availableExtras: [
      { id: 'extra-ice-cream-scoop', name: 'Extra Vanilla Ice Cream Scoop', price: 3.00, maxQuantity: 2, nutrition: N.vanillaIceCreamScoop },
      { id: 'caramel-syrup', name: 'Caramel Syrup', price: 1.00, maxQuantity: 2, nutrition: N.syrupShot },
    ],
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

// =============================================================================
// LEGACY ID MIGRATION
// Earlier versions of the menu used different stable IDs for three products and
// some of their ingredients/extras. Carts and orders saved in a browser before
// the rename still contain those IDs, so they are mapped to the current ones here.
// These legacy strings exist ONLY for migration and are never displayed.
// =============================================================================

const LEGACY_ITEM_IDS: Record<string, string> = {
  'peach-blossom-smash': 'bun-patty-smash',
  'sauce-peach-bourbon-jam': 'smoky-bourbon-bacon-jam',
  'peach-blossom-iced-tea': 'cold-steeped-lemon-ceylon-tea',
};

const LEGACY_INGREDIENT_IDS: Record<string, string> = {
  'peach-bacon-jam': 'bacon-jam',
  'peach-jam-tub': 'bacon-jam-tub',
  'peach-tea-base': 'tea-base',
  'peach-puree': 'lemon-juice',
};

const LEGACY_EXTRA_IDS: Record<string, string> = {
  'side-peach-jam': 'side-bacon-jam',
};

/** Maps a possibly-legacy item ID to the current one. */
export function resolveMenuItemId(itemId: string): string {
  return LEGACY_ITEM_IDS[itemId] || itemId;
}

/** Finds a menu item by ID, accepting legacy IDs from older saved carts/orders. */
export function getMenuItemById(itemId: string): MenuItem | undefined {
  const id = resolveMenuItemId(itemId);
  return MENU_ITEMS.find((m) => m.id === id);
}

export interface MigratableCustomization {
  selectedChoiceId?: string;
  removedIngredientIds?: string[];
  extraQuantities?: Record<string, number>;
  notes?: string;
}

/**
 * Migrates a saved customization to current IDs and drops anything the item no
 * longer offers (e.g. a juice flavor that was removed from the menu).
 * Returns `null` when the item requires a choice and the saved choice no longer exists.
 */
export function migrateCustomization<T extends MigratableCustomization>(
  item: MenuItem,
  customization: T | undefined
): T | null {
  const c = (customization || {}) as T;

  const removedIngredientIds = (c.removedIngredientIds || [])
    .map((id) => LEGACY_INGREDIENT_IDS[id] || id)
    .filter((id) => item.includedIngredients.some((ing) => ing.id === id && !ing.isRequired));

  const extraQuantities: Record<string, number> = {};
  Object.entries(c.extraQuantities || {}).forEach(([id, qty]) => {
    const newId = LEGACY_EXTRA_IDS[id] || id;
    if (qty > 0 && item.availableExtras.some((e) => e.id === newId)) {
      extraQuantities[newId] = (extraQuantities[newId] || 0) + qty;
    }
  });

  let selectedChoiceId = c.selectedChoiceId;
  if (item.requiredChoice) {
    const valid = item.requiredChoice.options.some((o) => o.id === selectedChoiceId);
    if (!valid) {
      selectedChoiceId = item.requiredChoice.defaultOptionId;
      if (!selectedChoiceId) return null;
    }
  } else {
    selectedChoiceId = undefined;
  }

  return { ...c, selectedChoiceId, removedIngredientIds, extraQuantities };
}

export function calculateOrderEstimatedMinutes(
  items: Array<{ itemId: string }>,
  orderType: "delivery" | "pickup" = "pickup",
  deliveryExtraMinutes: number = 0
): number {
  const BUFFER_MINUTES = 5;
  let maxMinutes = 0;
  for (const it of items ?? []) {
    const menuItem = getMenuItemById(it.itemId);
    if (!menuItem) continue;
    // Use the item's real prep time (e.g. "12 min"); fall back to estimatedMinutes
    const parsed = parseInt(menuItem.prepTime, 10);
    const itemEst = Number.isFinite(parsed) ? parsed : menuItem.estimatedMinutes;
    if (itemEst > maxMinutes) {
      maxMinutes = itemEst;
    }
  }
  const deliveryPadding = orderType === "delivery" ? deliveryExtraMinutes : 0;
  // Longest-prep item in the order + 5 min buffer
  return maxMinutes + BUFFER_MINUTES + deliveryPadding;
}
