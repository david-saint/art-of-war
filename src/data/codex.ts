export type CodexEntry = {
  dictum: string
  bullets: string[]
  /** One line on using it, which is NOT allowed to be consultant pablum. */
  apply: string
}

/**
 * The fast-reference layer.
 *
 * GENERATED — do not edit by hand. Run `node scripts/gen-codex.mjs` after
 * changing a chapter's codex entry in src/data/chapters/chNN.ts.
 *
 * This is written out flat rather than derived from the chapter modules on
 * purpose. Codex Mode is a client component, so importing the modules here
 * would pull all thirteen — and their nine-hundred-word vignettes — into the
 * client bundle to render three bullets each.
 */
export const CHAPTER_CODEX: Record<number, CodexEntry> = {
  1: {
    dictum: "The battle does not decide the war; it audits a count you already made, and it charges for the errors.",
    bullets: [
      "Five fields, then seven questions, then a number. 道 天 地 將 法 — cohesion, season, ground, commander, administration — asked of both sides. The chapter's output is a margin, not a plan.",
      "道 is not virtue. It is defined in the text as the people sharing the ruler's intent to the point of dying without fear. Cohesion is a quantity. Measure it or lose it.",
      "Deception is downstream. 詭道 is a list of fourteen feints attached after the count, and its only job is to spoil the enemy's arithmetic. It does not repair yours.",
    ],
    apply: "Before the next thing you are about to commit to, write down the number you are betting the whole outcome on — the one figure that, if it is wrong by a third, makes everything else irrelevant. If you cannot write it down, you have not counted; you have hoped, and the temple is empty.",
  },
  2: {
    dictum: "An army is a fire, and what it burns is not the enemy — it is your own country, at a fixed rate, every day it stays lit.",
    bullets: [
      "The unit is the day, not the battle. A thousand in gold per day for a hundred thousand men, spent on glue, lacquer, axles, envoys and grain, before a single engagement. The bill starts when the army forms, not when it fights.",
      "拙速 is a concession, not a slogan. Crude and quick beats clever and slow. Sun Tzu is not praising speed; he is pricing duration, and duration is the only thing in the chapter that has no ceiling.",
      "Twenty to one. A measure of the enemy's grain is worth twenty of your own, because nineteen were going to be eaten by the road. That number is an indictment of your logistics and a description of what is about to happen to somebody's farm.",
    ],
    apply: "Find the thing you are currently paying for daily whether or not it produces anything — the standing commitment, not the project — and calculate what it has cost since it started. Then decide whether you would begin it today at that price. Most long campaigns are not chosen; they are inherited from a version of you who never saw the total.",
  },
  3: {
    dictum: "Victory is measured in what survives to be yours; a siege is a commander's written confession that he arrived too late to think.",
    bullets: [
      "The ladder is a cost curve, not a morality. Plans, then alliances, then armies, then walls. Each rung down multiplies what you spend and reduces what you get to keep. Siege is the bottom because three months of engines, three months of ramps, and a third of your men dead on the wall is what failure of foresight actually costs.",
      "全 before 破. Take it whole; breaking it is always the inferior option, at every scale from a state to a squad. A ruined prize is an expense you now own.",
      "不殆, not 百勝. 'Know the enemy and know yourself' promises freedom from peril, not a hundred wins — and the chapter has already said, twelve lines earlier, that a hundred wins is not excellence anyway. The popular version of this quotation contradicts the chapter it comes from.",
    ],
    apply: "The next time you are about to go at something directly, name the two people or conditions whose cooperation the other side is quietly relying on — and work out what it would take to make one of them merely neutral. If that is cheaper than the direct approach, the direct approach was never a plan; it was impatience with a budget attached.",
  },
  4: {
    dictum: "You can make yourself impossible to beat; you cannot make him possible to beat — so build the first, and wait, and the battle will be over before anyone swings.",
    bullets: [
      "The halves have different owners. Your unbeatability is work you can do this week. His collapse is not yours to schedule. Do the first completely; wait for the second without decorating the wait.",
      "Defence is the rich position, not the poor one. Take the older reading — in defending you have more than enough; in attacking you have too little. The attacker is the one who is short.",
      "Fame is a symptom of lateness. No reputation for wisdom, no merit for courage: a victory that looked brilliant is a victory that was nearly lost. Your instinct for spotting excellence is trained on the wrong evidence.",
    ],
    apply: "Watch any contest already in progress and ask one question — which side needs luck? That side lost before it started; everything after is paperwork. If the answer is you, the useful move is never on the field, and it is never today.",
  },
  5: {
    dictum: "Force is not something your men have; it is something your arrangement does to them — so stop demanding courage and start building slope.",
    bullets: [
      "勢 is height; 節 is when you stop holding it. Rolling water moves rock because of the drop. A hawk breaks a spine because of the instant. Steep potential, short release — the two are one specification.",
      "奇 has no meaning alone. The extraordinary force acts only on the commitment the ordinary force extracted. Surprise with nothing fixed in place is not 奇, it is a raid, and it is how clever people lose.",
      "Courage is an output. Order and disorder come from organisation; bravery and cowardice come from configuration. The same men, differently arranged, are different men.",
    ],
    apply: "Next time you catch yourself calling someone weak, find the arrangement in which their best effort was never going to be enough — and note who built it. The arrangement is the fact. The person is the anecdote.",
  },
  6: {
    dictum: "Do not go looking for his weak point — make one, by forcing him to answer somewhere he cannot afford to ignore, and then arrive at the place his answer just emptied.",
    bullets: [
      "Weak points are made, not found. Attack what he cannot fail to rescue, and he will leave a position no assault could have taken. Every answer he gives thins him somewhere else.",
      "Uncertainty is a force multiplier you do not have to fund. Give him a shape, keep none yourself, and he must be strong everywhere — which is the technical definition of being weak everywhere. He divides into ten and you are still one.",
      "Water is not a poem about flexibility. Water is cited because it is pitiless and predictable: it refuses height, always, and takes the low ground, always. Be that unsentimental about where you spend force. Do not attack a thing because it is important.",
    ],
    apply: "In any exchange, one party is setting the appointments and the other is keeping them. Count who is answering whom. If it takes you more than a minute to work out which one you are, you are the one answering — and you have been for a while.",
  },
  7: {
    dictum: "The longer road, taken first, arrives first — and every hour you buy with speed is paid for in men who never arrive at all.",
    bullets: [
      "以迂為直 is a claim about time, not cleverness. The circuitous route is the direct route when it delivers you usable.",
      "The chapter prices itself. 100 li → one man in ten and your three commanders taken. 50 li → half. 30 li → two-thirds. No other classic invoices its own advice this precisely.",
      "風林火山 is a gearbox, not a battle cry — and the received text has six terms, not four. The four-character banner is a later Japanese device.",
    ],
    apply: "Before you accept a deadline, write down what will not arrive with you. Not “risks”: names, or the specific things that will be left in the road. If you cannot produce that list, you have not chosen speed, you have only chosen not to count.",
  },
  8: {
    dictum: "Every rule in this book has a case where it must be broken — including the order you were given — and the qualities you are proudest of are the exact places the enemy will take hold of you.",
    bullets: [
      "Five refusals, and the fifth is the live wire. Roads, armies, cities, ground — and 君命有所不受, the sovereign’s order. This is a doctrine about who owns the decision, not a note about flexibility.",
      "雜於利害. The wise man’s calculation always mixes the two: find the loss inside the gain and the gain inside the loss before choosing, not after.",
      "The five 危 are virtues, not vices. Courage, prudence, spirit, integrity, compassion. Each is a documented way to be steered. If your enemy can name your best quality, he has your route.",
      "Textual honesty: the chapter never clearly lists nine of anything, and its opening duplicates Chapter 11. The received text is a reconstruction, and the most visibly disordered chapter in the book.",
    ],
    apply: "Write down the quality your colleagues would name if asked what you are like. That is the input someone hostile already has, and every plan they make about you assumes you will do it again. You do not have to stop being that. You have to stop being that on schedule.",
  },
  9: {
    dictum: "Everything the enemy is about to do is already visible in something he cannot help doing — and none of it is a mystery, it is just physics you have not bothered to learn.",
    bullets: [
      "These are not omens, they are mechanics. Dust high and sharp is chariots because chariot wheels throw a narrow column. Birds rising is an ambush because men underneath put them up. Chapter 13 forbids foreknowledge from spirits, portents and calculation of the heavens — this chapter is what it permits instead.",
      "The three-line register everyone should memorise. Humble words while defences grow: attack coming. Loud words and forward movement: withdrawal coming. Terms offered that nobody asked for: he needs time.",
      "The chapter ends on discipline, not scouting. 令之以文，齊之以武 — command with civility, align with the axe. Punish men who are not yet yours and they resent you; fail to punish men who are and they are useless. A catalogue of signs is worthless in an army that will not report what it saw.",
    ],
    apply: "The next time someone tells you everything is fine, note what changed while they said it: what got quietly reinforced, who stopped travelling, whose calendar emptied. Then hold both readings without acting for one full day. The whole chapter is a bet that the sign arrives before the event, and that the only thing you actually lack is the patience to keep looking at something dull.",
  },
  10: {
    dictum: "Ground is an ally, never an alibi: it will multiply whatever you already are, and every army that dies on it dies of something its commander did.",
    bullets: [
      "Six grounds, and five of the six rules are about arriving first or not going at all. 通 accessible · 挂 entangling (easy in, hard out) · 支 deadlocked (bad for whoever moves first) · 隘 narrow (occupy and fill it) · 險 precipitous (take the high sunny side, or leave) · 遠 distant (equal forces at long range: do not offer battle). The verbs are occupy, decline, withdraw. Barely one of them is attack.",
      "Six defeats, and not one is caused by terrain. 走 flight (one thrown against ten) · 弛 slackness (strong ranks, weak officers) · 陷 collapse (strong officers, weak ranks) · 崩 ruin (a senior subordinate fighting on his own resentment) · 亂 disorder (a lax, unclear commander) · 北 rout (a commander who cannot read the enemy and fields no picked shock troops). 非天之災，將之過也.",
      "The chapter licenses disobedience, then charges for it. 戰道必勝，主曰無戰，必戰可也 — fight when victory is certain and the sovereign forbids it; refuse when it is not and he commands it. The price of that licence is 進不求名，退不避罪: you may not take the credit, and you may not duck the blame. Sun Tzu also closes the loop on his most-quoted line — 知彼知己 is not enough; 知天知地，勝乃可全.",
    ],
    apply: "After the next thing of yours that fails, do not write the post-mortem until you have tried all six of Sun Tzu's names on it — 走 弛 陷 崩 亂 北. If none of the six fits, you were genuinely unlucky and you should say so. One of them almost always fits, and the one that fits is the sentence you did not want to write.",
  },
  11: {
    dictum: "Courage is a property of ground, not of men: take away every road but the one through the enemy, and you will get from ordinary soldiers a ferocity you could never have ordered out of them.",
    bullets: [
      "The nine are one axis, and the axis is distance from home. 散地 dispersive (your own soil — do not fight) · 輕地 light (just inside his — do not halt) · 爭地 contentious (good for whoever holds it — do not assault it) · 交地 open (both can move freely — do not let your columns be cut) · 衢地 intersecting highways (three states meet — make alliances) · 重地 serious (deep, his cities behind you — forage) · 圮地 difficult (mountain, forest, marsh — keep moving) · 圍地 hemmed-in (narrow in, long way out — use stratagem) · 死地 death (fight now or perish — fight). 深入則專: the deeper in, the tighter they hold.",
      "The mechanism is jeopardy, not loyalty. Wu and Yue hated each other and rowed like one body in a storm. Nothing about the men changed; the boat did. This is also why the chapter is candid about deceiving one's own army — 若驅群羊, driven like sheep, out and back, none of them knowing where.",
      "The asymmetry is the ethics, and it is stated in the text. You close your exits; you leave his open (圍師必闕, Ch. 7). 死地 is item nine of nine because eight items were instructions for not being there. Burning the boats is not the strategy. It is what remains after the strategy.",
    ],
    apply: "When someone tells you the story of a leader who burned the boats, do not ask how brave he was. Ask the two questions the story is built to skip: who else was in the boats, and how did he get to the far bank with three days of food in the first place. The burning is the famous part because it is the only part that looks like a decision instead of a bill.",
  },
  12: {
    dictum: "Fire is not a weapon you aim; it is a bet you place on the weather — and the only instruments in war that cannot be recalled are the ones you must therefore never light in anger.",
    bullets: [
      "Five things to burn, in descending order of what it says about you: men in camp (火人), stored grain (火積), the baggage train (火輜), the arsenal (火庫), and a fifth (火隊) whose reading is genuinely disputed — supply routes, or fire dropped onto formations. Flagged: the received text is unstable here and we say so.",
      "The mansions are a calendar, not an omen. 箕 Sieve · 壁 Wall · 翼 Wing · 軫 Cross-bar mark windy dates in a dry season. Chapter 13 will forbid taking foreknowledge from spirits — so the moon here is an almanac, and reading it as mysticism gets the book exactly backwards.",
      "The fire is not the last word; the temper is. 怒可以復喜 — wrath turns back to joy. 死者不可以復生 — the dead do not turn back. Anger is fire with the same failure mode: cheap to start, dependent on wind, impossible to recall.",
    ],
    apply: "Before you use a method that continues working after you stop — a public accusation, a resignation, a mass email, a fire — say out loud what the weather has to do for it to land where you intended, and notice how much of your case rests on that. If the honest answer is 'the wind will hold,' you are not making a decision. You are betting, in a mood, with other people's material. And if what is actually moving you is that you were humiliated: that condition resolves by Thursday. Nothing you do tonight does.",
  },
  13: {
    dictum: "Foreknowledge cannot be prayed for, inferred, or calculated — it can only be bought from a human being, and a commander who finds that price too high has already decided which of his own men are cheaper.",
    bullets: [
      "Five classes, one hinge. 鄉間 local · 內間 inward · 反間 converted · 死間 doomed · 生間 surviving. Four of them are recruited, validated and run by the third. Everything you know, you know because you turned one of his — so the converted spy is not a resource, he is the aperture.",
      "The arithmetic is the argument. A hundred thousand men in the field: a thousand in gold a day, seven hundred thousand households idled. A man who tells you what is on the other side of the hill: a hundred, once. Sun Tzu does not call refusing that trade unwise. He calls it 不仁之至 — the utmost inhumanity.",
      "The fourth class is not a hero, and we do not translate him into one. 死間 is your own man, given a lie he believes, and sent to be caught proving it. The text says this in one flat clause and moves on. Where the book is cruel, we cite it and let it stand.",
    ],
    apply: "Look at what you are currently prepared to spend to be right — the months, the argument, the relationship, the standing you are grinding down — and then at the far smaller, far more embarrassing thing you would have to do to simply find out: ask the person who actually knows, and pay them in whatever currency they use, which is usually credit you would rather keep. You are not cautious. You have priced your own discomfort above the outcome, and the bill is being paid by whoever is standing downstream of you. The gold was never the expensive part.",
  },
}
