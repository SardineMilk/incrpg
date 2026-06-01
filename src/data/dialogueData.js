export const DIALOGUES = {

// Swap action for result?
// More boilerplate but more flexibility
// Have action as special case?

// TODO set up message title filtering for known NPC names


title: {
    result: [
        eff.sendMessage("", ""),
        eff,presentChoice([
            { text: "", action: ""},
        ]),
    ],
},

albie_talk: {
    name: "Talk to Elder Albie",
    result: [ 
        eff.sendMessage("elder_albie", "How can I help you?"), 
        eff.presentChoice([
            { text: "Just passing through.", action: "albie_farewell" },
            { text: "Hello!", action: "albie_greet", requirements: [req.hasNotCondition("met_albie")] },
            { text: "Can you tell me more about the village?", action: "albie_lore_1", requirements: [req.hasCondition("met_albie")] },
        ]),
    ],
},

albie_greet: {
    result: [ 
        eff.sendMessage("elder_albie", "Hello there! I'm Albie."), 
        eff.applyCondition("met_albie"),
        eff.presentChoice([
            { text: "It's nice to meet you.", result: [eff.setActiveAction("albie_farewell")] },
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
        eff.sendMessage("SIGHT", "You wake up. This isn't your bed. You look around."),
        eff.sendMessage("SIGHT", "You're lying in a well-made straw bed, one of several in a spotlessly clean wooden room. The sun streams under the door, a light breeze coming with it."),
        eff.sendMessage("SIGHT", "A stout older woman with ginger hair and lightly tanned skin pushes through the door, carrying a wicker basket filled with folded sheets. Her eyes widen with surprise when she sees you."),
        eff.sendMessage("betty", "Oh, Haddow! I didn't expect to see you back so soon!"),
        eff.presentChoice([
            { text: "Where am I?", result: [eff.setActiveAction("betty_wakeup_2")] },
            { text: "Haddow?", result: [eff.setActiveAction("betty_wakeup_2")] },
            { text: "*Stay silent.*", result: [eff.setActiveAction("betty_wakeup_2_hide")] },
        ]),
    ]
},

betty_wakeup_2: {
    result: [
        eff.sendMessage("SIGHT", "The woman's bushy eyebrows shoot up."),
        eff.sendMessage("betty", "Do you... not remember? Oh dear, ressurection sickness shouldn't be this bad..."),
        eff.sendMessage("SIGHT", "She puts the basket down and takes a sheet of rough-looking paper from a shelf near the door."),
        eff.sendMessage("betty", "I'm going to ask you some questions, alright? Do you remember your name? Where you are right now? What you were doing before you woke up?"),
        eff.presentChoice([
            { text: "No, no, and no. Whats going on?", action: "betty_wakeup_3"},
            { text: "I.. should. I should know this! Why don't I?", action: "betty_wakeup_3"},
        ]),
    ],
},

betty_wakeup_3: {
    result: [
        eff.sendMessage("betty", "It seems you've got a wee case of... severe retrograde amnesia."),
        eff.sendMessage("SIGHT", "With a sigh, she sits in a small wooden chair facing your bed."),
        eff.sendMessage("betty", "My name's Betty. Among other things, I take care of the ressurection house for our village."),
        eff.sendMessage("betty", "And your name is - or was, at least - Haddow. You left the village a few months ago searching out some mystical whatnot."),
        eff.sendMessage("betty", "You must have failed, because you took the fast way home. Looks like your memories didn't make it back with you though."),
        eff.presentChoice([
            { text: "Ressurection house? And what do you mean, 'the fast way home'?", action: "betty_wakeup_ressurection"},
        ]),
    ],
},

betty_wakeup_ressurection: {
    result: [
        eff.sendMessage("betty", "You don't even remember that? What happened to you, Had-"),
        eff.sendMessage("SIGHT", "She cuts off her mumbling, looking up at you."),
        eff.sendMessage("betty", "Well, whenever you're too damaged, you die. Your body shuts down, and you wake up some time later in your bed."),
        eff.sendMessage("betty", "You're always a bit worse for wear after you die, but memory loss is a new one to me. Anyway, most large towns have a designated ressurection house, with beds that everyone collectively owns for easier ressurection."),
        eff.sendMessage("betty", "Apparently they're also very convinient for higher beings getting up to narrative shenanigans, but I wouldn't know anything about that."),
        eff.sendMessage("betty", "Does that answer your question?"),
        eff.presentChoice([
            { text: "You said most large towns have a ressurection house, but that we're in a small village?", action: "betty_wakeup_ressurection_b"},
            { text: "Higher beings?", action: "betty_wakeup_ressurection_c"},
        ]),
    ],
},

betty_wakeup_ressurection_b: {
    result: [
        eff.sendMessage("betty", "Ooh, still a sharp one, you are. Good to see the amnesia isn't anterograde!"),
        eff.sendMessage("betty", "Well, to answer your question, our village is a bit more... active than most. You're a fine example yourself!"),
        eff.sendMessage("betty", "If you want to know more, you should have a chat with Albie, he's much more involved in running the village."),
        eff.sendMessage("betty", "You should probably let him know you lost your memories first though, or he'd be mighty confused! Just tell him what happened, he'll take care of you."),
        eff,presentChoice([
            { text: "Where can I find Albie?", action: "betty_wakeup_albie"},
        ]),
    ],
},

betty_wakeup_ressurection_c: {
    result: [
        eff.sendMessage("SIGHT", "Her mouth crinkles up in mirth"),
        eff.sendMessage("betty", "Just said I wouldn't know anything about that, didn't I?"),
        eff.sendMessage("betty", "I'm not the best person to be talking to about all this, though. You should go see Albie"),
        eff.sendMessage("betty", "Just tell him what happened, he'll take care of you. You're not the first newcomer we've had, even if you're a wee bit of a... special case."),
        eff,presentChoice([
            { text: "Where can I find Albie?", action: "betty_wakeup_albie"},
        ]),
    ],
},

betty_wakeup_albie: {
    result: [
        eff.sendMessage("betty", "He's just a few houses down, on the left. His house has a turf roof, you can't miss it."),
        eff,presentChoice([
            { text: "I'll head over there then.", action: "betty_wakeup_goodbye"},
        ]),
    ],
},

betty_wakeup_goodbye: {
    result: [
        eff.sendMessage("SIGHT", "You climb out of bed, walking over to the door."),
        eff.sendMessage("betty", "Don't be afraid to come to me if you have any questions, or just want a blether!"),
        eff.setActiveAction(null),
    ],
},
}