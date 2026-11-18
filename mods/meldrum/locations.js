import { eff, evt, fml } from "../../api/index.js";

export const LOCATIONS = {
  /*
  * New Meldrum sits on the top of a rugged cliff, overlooking the sea to the south
  * To the north and west a forest surrounds the village 
  * To the east, a stream provides water
  * The stream comes from the eastern mountains
  *
  * On the beach, 
  * A dark cave in the cliff the the west
  * Tide pools to the east
  * A magical sea-spout draws water from near the rock pools
  *   Filters salt from the water
  *   Source of the stream
  *   You can hitch a ride up the cliff 
  * 
  * Beyond the forest,
  * West, moorland stretches out
  * Beyond the moors, the festering farm
  * North, the forest grows darker
  * 
  * 
  */
  new_meldrum:         { name: "New Meldrum",         tags: ["outside", "forest", "town"] },
  starter_hut:         { name: "Sturdy Hut",          tags: ["inside", "forest", "town", "building", "bed", "hearth"] },
  meldrum_library:     { name: "Meldrum Library",     tags: ["inside", "forest", "town", "building"] },

  meldrum_stream:      { name: "Meldrum Stream",      tags: ["outside", "water"] },

  meldrum_forest:      { name: "Meldrum Forest",      tags: ["outside", "forest"] },
  meldrum_forest_deep: { name: "Deep Meldrum Forest", tags: ["outside", "forest"] },
  meldrum_moor:        { name: "Windswept Moor",      tags: ["outside", "moor"] },

  meldrum_beach:      { name: "Meldrum Beach", tags: ["outside", "shore"] },
  meldrum_tide_pools: { name: "Tide Pools",    tags: ["outside", "shore"] },
  meldrum_sea_cave:   { name: "Sea Cave",      tags: ["inside", "dark"],  },

};
