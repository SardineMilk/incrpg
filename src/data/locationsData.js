export const LOCATIONS = {
  new_meldrum: {
    name: "New Meldrum",
    tags: ["outside", "forest", "town"],
  },

  starter_hut: {
    name: "Sturdy Hut",
    tags: ["inside", "forest", "town", "building"],
  },

  new_meldrum_library: {
    name: "New Meldrum Public Library",
    tags: ["inside", "forest", "town", "building"],
  },

  meldrum_shaw: {
    name: "Meldrum Shaw",
    tags: ["outside", "forest"],
  },


  /*
  * Realm Structure
  * An internal shell, like a spherical ring-world
  * Centre is a clockwork lighthouse
  * - this causes day/night cycle
  * - fight the clockwork to stop it rotating and fuck up the weather
  * - it was created to replicate natural magic fluctuations
  *   - so the realm doesn't become stagnant
  *   - give it a good stir
  * North+south poles have mountains attached to the core
  *  
  */


  /* 
  * Festering Fields
  *
  * The festering fields used to be a thriving necromancy-powered social commune
  * Increases in life-based agriculture caused the community to collapse
  * The workers were left to keep farming, but the farm slowly decayed over years
  * Undead went feral
  * Tongue-in-cheek social commentary
  * 
  * Get to the centre, meet a lich middle manager
  * - boss fight fakeout
  * Restart the farm by killing a lot of undead and bringing resources to the lich
  * Unlock gathering spots as you clear undead
  * 
  * Festering Labourer
  * - still-rotting corpse
  * - given menial labour to keep food sanitary
  * - racks attached to their back, sometimes holding crates
  * - unarmed, unarmoured
  * 
  * Skeletal Reaper
  * - Once a zombie labourer fully decomposes, it is cleaned and repurposed to harvest crops
  * - Shaped bone blades for arms
  * - Fast, dangerous but fragile
  * 
  * Mummified Scarecrow
  * - Dessicated undead with no legs, attached to a pole
  * - Used for pest control, worker upkeep etc
  * - Mage+healer+buffer
  * - Fear attack
  * 
  * Undead Fruit Treant
  * - Frankensteined undead fruit tree
  * - Buildup of mana due to low harvest makes fruit into elemental grenades
  * - Unable to dodge, high blunt damage limbs, random elemental damage fruit
  * - At night, they become partially dormant
  *   - Less dangerous, slower, less fruit thrown
  * 
  * Shambling Compost Heap
  * - Animated heap of decay
  * - Low defence, high health, slow but strong blunt attacks
  * - Poison-based attacks, regeneration
  * - Killing unlocks compost warrens
  * 
  * Combine Harvester
  * - A complex mass of bone from uncountable skeletons
  * - Modern heavy farm machinery + Fantasy undead bonemass
  * - Very dangerous, boss enemy
  * 
  * 
  * Gathering
  * - Harvest oats from the fields
  * - Dodge/pick fruits from the treants
  * - Dig for bones 
  * 
  */

  undead_farm_outskirts: {},
  undead_farm_fields: {},
  undead_farm_warrens: {},
  undead_farm_compound: {},


  /*
  * Walled City
  *
  * Surrounded by ancient floodplains, 
  * a massive, boxy walled city like pallas+liscor from twi.
  * Turn of 18-1900s Edinburgh vibes. Gas lamps, primitive electricity
  * Stacked warren of streets
  * Partially flooded and decayed from years of flood cycle
  * Bronze construct police patrol streets
  * Frankenstein-style boss
  * Furnace golem - uses heat resource system for stronger attacks
  * 
  * Climbing into the city is a skill gate
  * 
  * Inside, descend the tiers towards the centre
  * as you descend, it gets more flooded and the constructs become stronger
  * 
  * Gathering
  * - Mine the walls to strip strange copper channels
  * - Fish
  * - Gather aquatic herbs, algae etc
  * 
  * 
  */

  walled_city_bulwark: {},
  walled_city_promenade: {},
  walled_city_streets: {},
  walled_city_chambers: {},
};
