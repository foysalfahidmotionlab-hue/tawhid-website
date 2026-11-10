/**
 * Site photography.
 * These are TEMPORARY stock photos from Unsplash (free licence) used to set
 * the visual mood. Replace any entry with your own photo path, e.g.
 *   heroField: '/images/our-paddy-field.jpg'
 * Factory, machinery and packaging slots stay as placeholders on purpose —
 * those should show the real Zinia facility.
 */
const u = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  // landscapes
  heroField: u('1608335715837-1994a535d5c3', 2400), // golden-hour paddy field
  villageField: u('1793114561853-1381735e42e4', 2400), // green paddy with village trees
  greenField: u('1651980460167-24e472327b64', 2000),

  // paddy close-ups
  goldenStalk: u('1651981350249-6173caeeb660', 1200),
  goldenField: u('1728895604559-a4e16081504e', 1400),
  darkStalks: u('1792818606160-b62791edf569', 1400),

  // rice
  riceBowl: u('1536304993881-ff6e9eefa2a6', 1200),
  riceBowlWarm: u('1680137248876-6ad53db8caef', 1200),
  rawRice: u('1586201375761-83865001e31c', 1200),
  riceBoard: u('1723475158232-819e29803f4d', 1200),
  riceScoop: u('1643622357625-c013987d90e7', 1200),
  paddyBasket: u('1536153635972-1fc2e818f642', 1200),
  riceSack: u('1645331465778-eb409d112198', 1200),
  riceHands: u('1711060221380-acfa2c82cc99', 1200),
};
