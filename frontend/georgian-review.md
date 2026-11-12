# Georgian Culinary & Localization Review (ქართული ლოკალიზაციის მიმოხილვა)

This document reviews the Georgian culinary translations, tone of voice, formatting choices, and localization architecture implemented across the **BUN & PATTY** web application.

---

## 1. Core Brand & Culinary Terminology Decisions

| English Term | Georgian Translation | Linguistic & Culinary Context | Notes / Recommendations |
| :--- | :--- | :--- | :--- |
| **Smash Burger** | **სმეშ ბურგერი** | Borrowed loan term universally recognized in contemporary Georgian gastronomy. Retains artisan association with thin, crispy-edge searing technique. | *Alternative considered:* „დაწნეხილი ბურგერი“ (felt overly mechanical/industrial). „სმეშ ბურგერი“ is the natural menu standard across Tbilisi craft burger bars. |
| **Plancha / Carbon Steel Griddle** | **პლანშა / ფოლადის პლანშა** | Classical culinary term derived from Spanish/French plancha (260°C high-heat solid steel plate). | Widely used among professional chefs in Georgia. |
| **Basque Burnt Cheesecake** | **ბასკური ჩიზქეიქი** | Denotes the deeply caramelized, parchment-baked crust and creamy center. | Cult favorite in Tbilisi specialty cafés. |
| **Double Smashed Bacon Burger** | **ორმაგი სმეშ ბეკონ ბურგერი** | Clear, appetizing descriptor indicating two 90 g beef patties, crispy bacon, melted cheddar, and brioche. | Gram weights specified in description (`2 × 90 გრ`). |
| **The Big One** | **The Big One (დიდი ბურგერი)** | Retains the punchy signature title while adding the Georgian culinary description. | Marked with `გათვლილია გასაზიარებლად` ("Made for sharing") and highlights the 750 g beef patty. |
| **Fries with Cheese and Bacon** | **ფრი ყველითა და ბეკონით** | Natural phrasing for loaded fries with warm cheddar cheese sauce and crispy bacon. | Replaces previous generic fries. |
| **Caesar Salad** | **ცეზარი** | Universally understood across Georgia. | Includes crisp romaine, aged parmesan shavings, and house dressing. |
| **Cheese Injection** | **ყველის ინექცია (ჩიზ ინჯექშენი)** | Signature hot cheese dipping cup / injection serving. | Retains novelty branding. |
| **Lava Cake** | **შოკოლადის ლავა ქეიქი / ფონდანი** | Warm molten dark chocolate cake. | Explicitly describes molten chocolate center. |
| **Saperavi Wine Onions** | **საფერავში დამარინადებული ხახვი** | Localized Kakhetian touch: sweet onions gently steeped in indigenous dry red Saperavi wine. | Celebrates authentic Georgian culinary heritage. |
| **Brioche Bun** | **ბრიოშის ფუნთუშა** | Milk and potato cold-fermented brioche griddled with clarified butter. | Recognized premium bakery craft standard. |

---

## 2. Interactive Customization Terminology

| Component | English | Georgian Translation | Rationale |
| :--- | :--- | :--- | :--- |
| **Included Ingredients Toggle** | Included Ingredients (Free to remove) | **შემავალი ინგრედიენტები (ამოღება უფასოა)** | Crystal clear to the guest that toggling off is free and customizes their sandwich. |
| **Struck-through State** | Struck through / muted | **გარეშე: {ინგრედიენტი}** | Visual strike-through + badge makes kitchen modifications unmistakable. |
| **Required Ingredients** | Required | **სავალდებულო** | Bun and the last remaining beef patty are non-removable to preserve core item integrity. |
| **Paid Extras** | Extras (Up to 3 each) | **დამატებითი ინგრედიენტები (მაქს. 3 თითოეულზე)** | Clear limit and unit pricing displayed per increment. |
| **Kitchen Special Request** | Kitchen Note | **სპეციალური მოთხოვნა სამზარეულოს** | Distinct from ingredient toggles; designated for napkins, cutting in half, etc. |

---

## 3. Currency, Units, and Formatting Standards

- **Currency Symbol**: Georgian Lari (`₾`), formatted with space following the amount:
  - Example: `26.90 ₾`, `49.90 ₾`, `14.90 ₾`, `5.00 ₾`
- **Taxes**: In accordance with Georgian commercial practice, prices displayed on the menu and checkout already include the standard 18% VAT (`18% დღგ გათვალისწინებულია`).
- **Delivery Fee**: `5.00 ₾` flat courier fee across Tbilisi. Free courier delivery for orders `50.00 ₾` and above (`უფასო მიწოდება 50.00 ₾-დან`).
- **Weights & Measures**:
  - `750 გრ` (grams)
  - `90 გრ`
  - `330 მლ` (milliliters)
  - `260°C` (degrees Celsius plancha temperature)
- **Time & Dates**:
  - Operating hours in 24-hour notation: `11:30 – 23:00`
  - Dates: `05.11.2026`

---

## 4. Georgian Typography & Script Rules

1. **No Standard Capitalization**:
   The Georgian Mkhedruli script does not have standard upper/lower case distinctions. Applying CSS `text-transform: uppercase` to Georgian text can create inconsistent glyph rendering. We added an explicit override in SCSS:
   ```scss
   html[lang="ka"], [lang="ka"], :lang(ka) {
     text-transform: none !important;
     * {
       text-transform: none !important;
     }
   }
   ```
2. **Font Loading**:
   Google's `Noto Sans Georgian` is loaded with weights 400, 500, 600, 700, and 800 to ensure crisp rendering at all screen sizes.

---

## 5. Bilingual Architecture & Cart Persistence

- **State Persistence**: The guest's language preference (`ka` or `en`) is stored in `localStorage` under `bun_patty_lang_preference`.
- **Default Language**: Georgian (`ka`) is set as the default on first arrival.
- **Dynamic Cart Re-rendering**: Cart items and customizations store stable item and ingredient IDs (`removedIngredientIds`, `extraQuantities`). When toggling between `ქარ` and `EN`, the cart drawer and checkout re-render instantly in the active language without any page reload or cart loss.
- **Bilingual Search**: Guests can search menu offerings in Georgian (e.g., „ბეკონი“, „ჩიზქეიქი“, „ფრი“) or English („bacon“, „cheesecake“, „fries“) with matching across both language dictionaries.
