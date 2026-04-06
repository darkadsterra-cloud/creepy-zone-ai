type Theme = { name: string; colors: [string, string] };
type ThemeGroup = { group: string; themes: Theme[] };

const CORE_IMAGE_THEMES: ThemeGroup[] = [
  {
    group: "FIRE & DARK SERIES",
    themes: [
      { name: "Hellfire", colors: ["#ff4500", "#8b0000"] },
      { name: "Dark Witch", colors: ["#4b0082", "#1a1a1a"] },
      { name: "Blood Moon", colors: ["#8a0303", "#3b0000"] },
      { name: "Shadow Reaper", colors: ["#2c2c2c", "#000000"] },
      { name: "Demon Lord", colors: ["#5c0000", "#111111"] },
      { name: "Volcanic Ash", colors: ["#808080", "#ff6b35"] },
      { name: "Cursed Flame", colors: ["#00ff00", "#003300"] },
      { name: "Death's Glow", colors: ["#cc2222", "#440000"] },
    ],
  },
  {
    group: "NEON SERIES",
    themes: [
      { name: "Neon City", colors: ["#ff00ff", "#00ffff"] },
      { name: "Cyber Punk", colors: ["#ffff00", "#ff007f"] },
      { name: "Electric Blue", colors: ["#0000ff", "#00008b"] },
      { name: "Toxic Green", colors: ["#39ff14", "#004d00"] },
      { name: "UV Rave", colors: ["#8a2be2", "#ff1493"] },
      { name: "Neon Pink", colors: ["#ff66cc", "#ff00ff"] },
      { name: "Laser Grid", colors: ["#00ffcc", "#000066"] },
      { name: "Synthwave", colors: ["#ff9933", "#6600cc"] },
    ],
  },
  {
    group: "HORROR SERIES",
    themes: [
      { name: "Jump Scare", colors: ["#ffffff", "#000000"] },
      { name: "Ghost House", colors: ["#aaaaaa", "#333333"] },
      { name: "Vampire Castle", colors: ["#800000", "#1a1a1a"] },
      { name: "Zombie Horde", colors: ["#4d4d00", "#1a3300"] },
      { name: "Creepy Clown", colors: ["#ff0000", "#ffff00"] },
      { name: "Haunted Mansion", colors: ["#3b3b3b", "#0d0d0d"] },
      { name: "Slender Man", colors: ["#cccccc", "#000000"] },
      { name: "Witch Brew", colors: ["#800080", "#00ff00"] },
    ],
  },
  {
    group: "ACTION/FIGHTING SERIES",
    themes: [
      { name: "Martial Arts", colors: ["#cc0000", "#ffffff"] },
      { name: "Street Fighter", colors: ["#ff9900", "#0000cc"] },
      { name: "Samurai", colors: ["#990000", "#333333"] },
      { name: "Gladiator", colors: ["#cc9900", "#663300"] },
      { name: "Battle Royale", colors: ["#0099ff", "#ff3300"] },
      { name: "War Zone", colors: ["#4b5320", "#1a1a1a"] },
      { name: "Military Ops", colors: ["#333300", "#000000"] },
      { name: "Ninja Assassin", colors: ["#111111", "#cc0000"] },
    ],
  },
  {
    group: "SCI-FI/ALIEN SERIES",
    themes: [
      { name: "Alien Invasion", colors: ["#00ff00", "#000000"] },
      { name: "Space Station", colors: ["#c0c0c0", "#000033"] },
      { name: "Galaxy Far Away", colors: ["#000000", "#ffffff"] },
      { name: "Cybernetic", colors: ["#00ffff", "#333333"] },
      { name: "Android", colors: ["#999999", "#00ffcc"] },
      { name: "Wormhole", colors: ["#6600cc", "#000000"] },
      { name: "Star Command", colors: ["#0033cc", "#ffcc00"] },
      { name: "Quantum", colors: ["#ff00ff", "#00ffff"] },
    ],
  },
  {
    group: "FANTASY SERIES",
    themes: [
      { name: "Dragon Rider", colors: ["#cc0000", "#ff9900"] },
      { name: "Dark Elf", colors: ["#4b0082", "#000000"] },
      { name: "Wizard Tower", colors: ["#0000cc", "#cc00cc"] },
      { name: "Crystal Cave", colors: ["#00ffff", "#ccffff"] },
      { name: "Elven Forest", colors: ["#009933", "#003300"] },
      { name: "Orc Warlord", colors: ["#663300", "#330000"] },
      { name: "Dungeon Boss", colors: ["#333333", "#990000"] },
      { name: "Ancient Rune", colors: ["#cc9900", "#000000"] },
    ],
  },
  {
    group: "ROMANCE/DRAMA",
    themes: [
      { name: "Sweet Romance", colors: ["#ff99cc", "#ffffff"] },
      { name: "Kissing Rain", colors: ["#99ccff", "#336699"] },
      { name: "Love Letter", colors: ["#ffcccc", "#cc0000"] },
      { name: "Moonlit Date", colors: ["#003366", "#ffffcc"] },
      { name: "Cherry Blossoms", colors: ["#ffb3e6", "#ff66b2"] },
      { name: "Valentines", colors: ["#ff0000", "#ff6666"] },
      { name: "Rose Garden", colors: ["#cc0000", "#006600"] },
      { name: "Sunset Kiss", colors: ["#ff6600", "#cc0066"] },
    ],
  },
  {
    group: "COMIC/MARVEL",
    themes: [
      { name: "Marvel Hero", colors: ["#cc0000", "#0000cc"] },
      { name: "DC Villain", colors: ["#339933", "#6600cc"] },
      { name: "Superhero Transform", colors: ["#ffff00", "#ff0000"] },
      { name: "Comic Explosion", colors: ["#ffcc00", "#ff3300"] },
      { name: "Power Surge", colors: ["#00ffff", "#0000ff"] },
      { name: "Hero Landing", colors: ["#999999", "#cc0000"] },
      { name: "Cape Flight", colors: ["#0000cc", "#ffffff"] },
      { name: "Infinity", colors: ["#cc00cc", "#ffcc00"] },
    ],
  },
];

const CORE_VIDEO_THEMES: ThemeGroup[] = [
  {
    group: "CINEMATIC",
    themes: [
      { name: "Epic Reveal", colors: ["#cc9900", "#000000"] },
      { name: "Movie Trailer", colors: ["#333333", "#1a1a1a"] },
      { name: "Slow Burn", colors: ["#ff3300", "#330000"] },
      { name: "Dramatic Pan", colors: ["#ffffff", "#000000"] },
      { name: "Zoom Blast", colors: ["#00ffff", "#0000cc"] },
      { name: "Title Card", colors: ["#ffcc00", "#000000"] },
      { name: "Fade Glory", colors: ["#cccccc", "#333333"] },
      { name: "Lens Flare", colors: ["#ffffff", "#ffcc00"] },
    ],
  },
  {
    group: "ACTION",
    themes: [
      { name: "Power Up", colors: ["#ffff00", "#ff9900"] },
      { name: "Combat Intro", colors: ["#cc0000", "#000000"] },
      { name: "Battle Cry", colors: ["#ff3300", "#cc0000"] },
      { name: "Arena Enter", colors: ["#663300", "#331a00"] },
      { name: "Fight Club", colors: ["#1a1a1a", "#cc0000"] },
      { name: "Speed Burst", colors: ["#00ffff", "#ffffff"] },
      { name: "Impact Hit", colors: ["#ffcc00", "#ff0000"] },
      { name: "Shockwave", colors: ["#ffffff", "#0000ff"] },
    ],
  },
  {
    group: "HORROR",
    themes: [
      { name: "Creep In", colors: ["#333333", "#000000"] },
      { name: "Ghost Emerge", colors: ["#cccccc", "#333333"] },
      { name: "Jump Scare Intro", colors: ["#ffffff", "#ff0000"] },
      { name: "Fade to Dark", colors: ["#1a1a1a", "#000000"] },
      { name: "Blood Drip", colors: ["#cc0000", "#330000"] },
      { name: "Shadow Rise", colors: ["#0d0d0d", "#000000"] },
      { name: "Skull Reveal", colors: ["#cccccc", "#1a1a1a"] },
      { name: "Decay", colors: ["#666633", "#333300"] },
    ],
  },
  {
    group: "GAMING",
    themes: [
      { name: "Spawn In", colors: ["#00ff00", "#000000"] },
      { name: "Respawn", colors: ["#00ffff", "#0000cc"] },
      { name: "Level Up", colors: ["#ffcc00", "#ffffff"] },
      { name: "Achievement", colors: ["#cc9900", "#000000"] },
      { name: "Victory Lap", colors: ["#ffff00", "#ff9900"] },
      { name: "Quest Start", colors: ["#cc00cc", "#330066"] },
      { name: "Boss Intro", colors: ["#cc0000", "#000000"] },
      { name: "Game Over", colors: ["#ff0000", "#1a1a1a"] },
    ],
  },
  {
    group: "MAGIC/FANTASY",
    themes: [
      { name: "Spell Cast", colors: ["#cc00cc", "#00ffff"] },
      { name: "Portal Open", colors: ["#0000cc", "#cc00cc"] },
      { name: "Enchant", colors: ["#ff66cc", "#ffffff"] },
      { name: "Dragon Breath", colors: ["#ff3300", "#cc0000"] },
      { name: "Crystal Form", colors: ["#ccffff", "#00ffff"] },
      { name: "Rune Appear", colors: ["#ffcc00", "#cc3300"] },
      { name: "Fairy Dust", colors: ["#ffffcc", "#ff99cc"] },
      { name: "Summon", colors: ["#4b0082", "#ffffff"] },
    ],
  },
  {
    group: "NEON/CYBER",
    themes: [
      { name: "Glitch In", colors: ["#ff00ff", "#00ffff"] },
      { name: "Data Stream", colors: ["#00ff00", "#003300"] },
      { name: "Hack Reveal", colors: ["#39ff14", "#000000"] },
      { name: "Matrix Drop", colors: ["#00cc00", "#000000"] },
      { name: "Circuit Trace", colors: ["#00ffff", "#0000cc"] },
      { name: "Scan Line", colors: ["#ff00ff", "#1a1a1a"] },
      { name: "Pixel Build", colors: ["#cccccc", "#333333"] },
      { name: "Signal", colors: ["#ff3300", "#000000"] },
    ],
  },
  {
    group: "NATURE",
    themes: [
      { name: "Fire Storm", colors: ["#ff3300", "#cc0000"] },
      { name: "Lightning Strike", colors: ["#ffff00", "#0000ff"] },
      { name: "Tsunami", colors: ["#0066cc", "#000066"] },
      { name: "Earthquake", colors: ["#663300", "#331a00"] },
      { name: "Volcanic", colors: ["#cc0000", "#ff6600"] },
      { name: "Blizzard", colors: ["#ffffff", "#ccffff"] },
      { name: "Thunder Cloud", colors: ["#333333", "#000000"] },
      { name: "Meteor", colors: ["#ff6600", "#cc0000"] },
    ],
  },
];

function chunkThemes(themes: Theme[], size: number, titlePrefix: string): ThemeGroup[] {
  const groups: ThemeGroup[] = [];
  for (let i = 0; i < themes.length; i += size) {
    groups.push({
      group: `${titlePrefix} ${String(groups.length + 1).padStart(2, "0")}`,
      themes: themes.slice(i, i + size),
    });
  }
  return groups;
}

function createGeneratedThemes(limit: number, nounBase: string): Theme[] {
  const adjectives = [
    "Abyssal", "Arcane", "Astral", "Blood", "Celestial", "Chrono", "Crimson", "Cryptic",
    "Cyber", "Dark", "Doom", "Dream", "Ember", "Ethereal", "Feral", "Frost", "Ghost",
    "Glitch", "Infernal", "Iron", "Lunar", "Mythic", "Nebula", "Neon", "Night", "Obsidian",
    "Phantom", "Primal", "Quantum", "Rogue", "Runic", "Savage", "Shadow", "Solar", "Spectral",
    "Storm", "Toxic", "Twilight", "Ultra", "Void", "Wild", "Wraith",
  ];
  const nouns = [
    `${nounBase} Arena`, `${nounBase} Dungeon`, `${nounBase} Citadel`, `${nounBase} Dominion`,
    `${nounBase} Frontier`, `${nounBase} Harbor`, `${nounBase} Legacy`, `${nounBase} Matrix`,
    `${nounBase} Nexus`, `${nounBase} Outpost`, `${nounBase} Protocol`, `${nounBase} Realm`,
    `${nounBase} Rift`, `${nounBase} Sanctuary`, `${nounBase} Signal`, `${nounBase} Storm`,
    `${nounBase} Temple`, `${nounBase} Throne`, `${nounBase} Vault`, `${nounBase} Zone`,
  ];
  const palettes: Array<[string, string]> = [
    ["#ff4500", "#8b0000"], ["#00ffff", "#000066"], ["#39ff14", "#003300"], ["#4b0082", "#0f0f0f"],
    ["#cc0000", "#1a1a1a"], ["#ff00ff", "#2b004d"], ["#00b7ff", "#002b4d"], ["#ffcc00", "#4d2d00"],
    ["#a8a8a8", "#111111"], ["#7df9ff", "#003d4d"], ["#fd5e53", "#460000"], ["#99ccff", "#1a3352"],
  ];

  const generated: Theme[] = [];
  const names = new Set<string>();
  let paletteIndex = 0;

  for (const adjective of adjectives) {
    for (const noun of nouns) {
      const name = `${adjective} ${noun}`;
      if (names.has(name)) continue;
      names.add(name);
      generated.push({ name, colors: palettes[paletteIndex % palettes.length] });
      paletteIndex += 1;
      if (generated.length >= limit) return generated;
    }
  }
  return generated;
}

const GENERATED_IMAGE_THEMES = chunkThemes(
  createGeneratedThemes(200, "Stream"),
  20,
  "PRO IMAGE BUNDLE",
);

const GENERATED_VIDEO_THEMES = chunkThemes(
  createGeneratedThemes(120, "Motion"),
  20,
  "PRO VIDEO BUNDLE",
);

export const IMAGE_THEMES = [...CORE_IMAGE_THEMES, ...GENERATED_IMAGE_THEMES];
export const VIDEO_THEMES = [...CORE_VIDEO_THEMES, ...GENERATED_VIDEO_THEMES];
