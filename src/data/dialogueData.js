import { eff } from "../structures/effectDefs.js";
import { req } from "../structures/requirementDefs.js";

export const DIALOGUES = {
  // Swap action for result?
  // More boilerplate but more flexibility
  // Have action as special case?

  // TODO set up message title filtering for known NPC names

  title: {
    result: [
      eff.sendMessage("", ""),
      eff.presentChoice([{ text: "", action: "" }]),
    ],
  },

  albie_talk: {
    name: "Talk to Elder Albie",
    result: [
      eff.sendMessage("elder_albie", "How can I help you?"),
      eff.presentChoice([
        { text: "Just passing through.", action: "albie_farewell" },
        {
          text: "Hello!",
          action: "albie_greet",
          requirements: [req.hasNotCondition("met_albie")],
        },
        {
          text: "Can you tell me more about the village?",
          action: "albie_lore_1",
          requirements: [req.hasCondition("met_albie")],
        },
      ]),
    ],
  },

  albie_greet: {
    result: [
      eff.sendMessage("elder_albie", "Hello there! I'm Albie."),
      eff.applyCondition("met_albie"),
      eff.presentChoice([
        {
          text: "It's nice to meet you.",
          result: [eff.setActiveAction("albie_farewell")],
        },
      ]),
    ],
  },

  albie_lore_1: {
    result: [
      eff.sendMessage("elder_albie", "This village was founded"),
      eff.presentChoice([
        { text: "Thanks, very informative.", action: "albie_farewell" },
      ]),
    ],
  },

  albie_farewell: {
    result: [
      eff.sendMessage("elder_albie", "Safe travels."),
      eff.setActiveAction(null),
    ],
  },

  betty_wakeup: {
    result: [
      eff.sendMessage(
        "SIGHT",
        "You wake up and look around.",
      ),
      eff.sendMessage(
        "SIGHT",
        "You're lying in a well-made straw bed, one of several in a spotlessly clean wooden room. The sun streams under the door, a light breeze coming with it.",
      ),
      eff.sendMessage(
        "SIGHT",
        "A stout older woman with ginger hair and lightly tanned skin pushes through the door, carrying a wicker basket filled with folded sheets. Her face falls when she sees you.",
      ),
      eff.sendMessage(
        "betty",
        "Oh, dear. I assume it worked, then?",
      ),
      eff.presentChoice([
        {
          text: "I think so. I'm not in control of myself, anyway.",
          result: [eff.setActiveAction("betty_wakeup_2")],
        },
        { 
          text: "Yeah, it worked. I don't know what's in here with me, but there's definitely something.", 
          result: [eff.setActiveAction("betty_wakeup_2")] 
        },

      ]),
    ],
  },

  betty_wakeup_2: {
    result: [
      eff.sendMessage(
        "SIGHT",
        "She puts the basket down and takes a sheet of rough-looking paper from a shelf near the door, reading over it.",
      ),
      eff.sendMessage(
        "SIGHT",
        "Her bushy eyebrows steadily rise as she repeatedly unfolds the paper, the end trailing on the floor by the time she looks up.",
      ),
      eff.sendMessage(
        "betty",
        "You certainly made these instructions extensive, didn't you? Alrighty then, what am I meant to start with...",
      ),

      eff.presentChoice([
        { text: "Section 3. My personality is intact, but my ego is fully taken over by the entity's.", action: "betty_wakeup_3" },
      ]),
      eff.presentChoice([
        { text: "Don't bother with that. I'm hosting an eldritch horror, my ramblings won't make much difference to the final outcome. I'm going to leave now.", action: "betty_leave" },
      ]),
    ],
  },

  betty_wakeup_3: {
    result: [
      eff.sendMessage(
        "SIGHT",
        "She is clearly saddened by the news. This was expected, but not desired"
      ),
      eff.sendMessage(
        "betty",
        "Oh. I'm sorry, dearie. I hope it's worth the sacrifice"
      ),
      eff.sendMessage(
        "SOUND",
        "She clears her throat, before starting to read from the paper"
      ),
      eff.sendMessage(
        "betty",
        "Greetings, whoever is currently piloting my body. I hope you make good use of it, as I once did."
      ),
      eff.sendMessage(
        "betty",
        "The process that invited you here also crippled my cultivation, leaving me a blank slate for you to carve. Your current goal is simple: Explore, grow stronger and find your path."
      ),
      eff.sendMessage(
        "betty",
        "Explore, and discover the same truths I did. Gain the strength to break the shackles that bind us. I faltered at the final step, but you will not."
      ),
      eff.sendMessage(
        "SOUND",
        "She finishes reading the paper, and laughs."
      ),
      eff.sendMessage(
        "betty",
        "Always had a flair for the dramatic, you did. I hope that doesn't change now you're some kind of... finger puppet."
      ),
      eff.presentChoice([
        { text: "Tasteful. Well, what should I do now? This entity doesn't have any of my memories, just my personality.", action: "betty_leave"}
      ])
    ]
  },

  betty_leave: {
    result: [
      eff.sendMessage(
        "SIGHT",
        "Her body slumps as she realises what your situation means"
      ),
      eff.sendMessage(
        "betty",
        "Just... head out into the village. Get to know people. Maybe stop by Elder Albie, his hut is the one with the turf roof."
      )

    ]
  }

};
