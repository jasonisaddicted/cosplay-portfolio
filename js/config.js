// ============================================================
//  PORTFOLIO CONFIGURATION — jianshen.cos.visual
//
//  ✏️  HOW TO UPDATE THIS SITE:
//     1. Edit this file only — no coding knowledge needed.
//     2. Save the file.
//     3. Refresh your browser (or redeploy to GitHub Pages).
//
//  📌  STRUCTURE AT A GLANCE:
//     photographer / subtitle / tagline / heroLabel
//     featured[]   — home page hero + picks grid
//     events[]     — event album cards + photo grids
//     studio[]     — studio album cards (grouped by cosplayer)
//     collaborators[] — collabs page profiles
// ============================================================

const CONFIG = {

  // ── Site Identity ────────────────────────────────────────
  photographer: "jianshen.cos.visual",
  subtitle:     "建伸",
  tagline:      "Cosplay Photography",
  heroLabel:    "March 2025 — Featured Shots",

  // ── Featured / Home Page Picks ───────────────────────────
  // First entry = large hero image at the top.
  // The remaining entries appear in the monthly picks grid (show up to 9).
  //
  // Fields:
  //   src       — image URL or local path  (e.g. "images/hero.jpg")
  //   character — character name
  //   series    — game / anime / series name
  //   credit    — cosplayer @handle
  featured: [
    { src: "https://picsum.photos/seed/hero2025/1600/900",  character: "Hu Tao",          series: "Genshin Impact",         credit: "@sakurahime_cos"  },
    { src: "https://picsum.photos/seed/fp01/800/1000",      character: "2B",               series: "NieR: Automata",          credit: "@voidvessel_cos"  },
    { src: "https://picsum.photos/seed/fp02/800/1000",      character: "Ganyu",            series: "Genshin Impact",         credit: "@luminacraft"     },
    { src: "https://picsum.photos/seed/fp03/800/1000",      character: "Makima",           series: "Chainsaw Man",            credit: "@mirrorshade_x"   },
    { src: "https://picsum.photos/seed/fp04/800/1000",      character: "Zero Two",         series: "Darling in the FranXX",  credit: "@neonbloom_cos"   },
    { src: "https://picsum.photos/seed/fp05/800/1000",      character: "Power",            series: "Chainsaw Man",            credit: "@crystalwing_cos" },
    { src: "https://picsum.photos/seed/fp06/800/1000",      character: "Malenia",          series: "Elden Ring",              credit: "@voidvessel_cos"  },
    { src: "https://picsum.photos/seed/fp07/800/1000",      character: "Yae Miko",         series: "Genshin Impact",         credit: "@sakurahime_cos"  },
    { src: "https://picsum.photos/seed/fp08/800/1000",      character: "Rem",              series: "Re:Zero",                 credit: "@neonbloom_cos"   },
    { src: "https://picsum.photos/seed/fp09/800/1000",      character: "Yor Forger",       series: "Spy x Family",            credit: "@mirrorshade_x"   }
  ],

  // ── Events ───────────────────────────────────────────────
  // Each event = one album card on the Events page.
  // Album cards auto-slideshow through photos every 3 seconds.
  // Hover over a card to see the cosplayer name.
  //
  // Photo fields:
  //   src       — image URL or local path
  //   coser     — cosplayer @handle (shown on hover)
  //   character — character name
  //   series    — game / anime / series name
  events: [
    {
      id: "fanimecon-2024",
      name: "FanimeCon 2024",
      date: "May 2024",
      location: "San Jose, CA",
      description: "Annual anime convention held at the San José McEnery Convention Center.",
      cover: "https://picsum.photos/seed/ev1cv/800/600",
      photos: [
        // @sakurahime_cos — Hu Tao — Genshin Impact
        { src: "https://picsum.photos/seed/e1a1/800/1000",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a2/800/1100",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a3/900/1000",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a4/800/1000",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a5/800/950",   coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a6/800/1100",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a7/700/1000",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a8/800/1000",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1a9/900/1100",  coser: "@sakurahime_cos",  character: "Hu Tao",    series: "Genshin Impact" },
        // @voidvessel_cos — 2B — NieR: Automata
        { src: "https://picsum.photos/seed/e1b1/800/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b2/800/1100",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b3/900/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b4/800/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b5/800/950",   coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b6/800/1100",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b7/700/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b8/800/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e1b9/900/1100",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        // @luminacraft — Ganyu — Genshin Impact
        { src: "https://picsum.photos/seed/e1c1/800/1000",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c2/800/1100",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c3/900/1000",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c4/800/1000",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c5/800/950",   coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c6/800/1100",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c7/700/1000",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c8/800/1000",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e1c9/900/1100",  coser: "@luminacraft",     character: "Ganyu",     series: "Genshin Impact" }
      ]
    },
    {
      id: "anime-expo-2024",
      name: "Anime Expo 2024",
      date: "July 2024",
      location: "Los Angeles, CA",
      description: "The largest anime convention in North America, held at the LA Convention Center.",
      cover: "https://picsum.photos/seed/ev2cv/800/600",
      photos: [
        // @sakurahime_cos — Keqing — Genshin Impact
        { src: "https://picsum.photos/seed/e2a1/800/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a2/800/1100",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a3/900/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a4/800/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a5/800/950",   coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a6/800/1100",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a7/700/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a8/800/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e2a9/900/1100",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        // @mirrorshade_x — Makima — Chainsaw Man
        { src: "https://picsum.photos/seed/e2b1/800/1000",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b2/800/1100",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b3/900/1000",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b4/800/1000",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b5/800/950",   coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b6/800/1100",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b7/700/1000",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b8/800/1000",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e2b9/900/1100",  coser: "@mirrorshade_x",   character: "Makima",    series: "Chainsaw Man"   },
        // @neonbloom_cos — Zero Two — Darling in the FranXX
        { src: "https://picsum.photos/seed/e2c1/800/1000",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c2/800/1100",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c3/900/1000",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c4/800/1000",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c5/800/950",   coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c6/800/1100",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c7/700/1000",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c8/800/1000",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" },
        { src: "https://picsum.photos/seed/e2c9/900/1100",  coser: "@neonbloom_cos",   character: "Zero Two",  series: "Darling in the FranXX" }
      ]
    },
    {
      id: "sakura-con-2025",
      name: "Sakura-Con 2025",
      date: "March 2025",
      location: "Seattle, WA",
      description: "Northwest's premier anime convention at the Washington State Convention Center.",
      cover: "https://picsum.photos/seed/ev3cv/800/600",
      photos: [
        // @sakurahime_cos — Yae Miko — Genshin Impact
        { src: "https://picsum.photos/seed/e3a1/800/1000",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a2/800/1100",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a3/900/1000",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a4/800/1000",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a5/800/950",   coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a6/800/1100",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a7/700/1000",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a8/800/1000",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e3a9/900/1100",  coser: "@sakurahime_cos",  character: "Yae Miko",  series: "Genshin Impact" },
        // @voidvessel_cos — Malenia — Elden Ring
        { src: "https://picsum.photos/seed/e3b1/800/1000",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b2/800/1100",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b3/900/1000",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b4/800/1000",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b5/800/950",   coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b6/800/1100",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b7/700/1000",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b8/800/1000",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e3b9/900/1100",  coser: "@voidvessel_cos",  character: "Malenia",   series: "Elden Ring"     },
        // @crystalwing_cos — Power — Chainsaw Man
        { src: "https://picsum.photos/seed/e3c1/800/1000",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c2/800/1100",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c3/900/1000",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c4/800/1000",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c5/800/950",   coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c6/800/1100",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c7/700/1000",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c8/800/1000",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   },
        { src: "https://picsum.photos/seed/e3c9/900/1100",  coser: "@crystalwing_cos", character: "Power",     series: "Chainsaw Man"   }
      ]
    },
    {
      id: "comic-con-2024",
      name: "Comic-Con 2024",
      date: "July 2024",
      location: "San Diego, CA",
      description: "San Diego Comic-Con International — the world's largest comic and entertainment convention.",
      cover: "https://picsum.photos/seed/ev4cv/800/600",
      photos: [
        // @luminacraft — Fischl — Genshin Impact
        { src: "https://picsum.photos/seed/e4a1/800/1000",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a2/800/1100",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a3/900/1000",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a4/800/1000",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a5/800/950",   coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a6/800/1100",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a7/700/1000",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a8/800/1000",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e4a9/900/1100",  coser: "@luminacraft",     character: "Fischl",    series: "Genshin Impact" },
        // @mirrorshade_x — Yor Forger — Spy x Family
        { src: "https://picsum.photos/seed/e4b1/800/1000",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b2/800/1100",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b3/900/1000",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b4/800/1000",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b5/800/950",   coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b6/800/1100",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b7/700/1000",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b8/800/1000",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        { src: "https://picsum.photos/seed/e4b9/900/1100",  coser: "@mirrorshade_x",   character: "Yor Forger",series: "Spy x Family"   },
        // @neonbloom_cos — Rem — Re:Zero
        { src: "https://picsum.photos/seed/e4c1/800/1000",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c2/800/1100",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c3/900/1000",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c4/800/1000",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c5/800/950",   coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c6/800/1100",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c7/700/1000",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c8/800/1000",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e4c9/900/1100",  coser: "@neonbloom_cos",   character: "Rem",       series: "Re:Zero"        }
      ]
    },
    {
      id: "pax-west-2024",
      name: "PAX West 2024",
      date: "August 2024",
      location: "Seattle, WA",
      description: "PAX West — premier gaming and geek culture festival at the Washington State Convention Center.",
      cover: "https://picsum.photos/seed/ev5cv/800/600",
      photos: [
        // @voidvessel_cos — A2 — NieR: Automata
        { src: "https://picsum.photos/seed/e5a1/800/1000",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a2/800/1100",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a3/900/1000",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a4/800/1000",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a5/800/950",   coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a6/800/1100",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a7/700/1000",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a8/800/1000",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e5a9/900/1100",  coser: "@voidvessel_cos",  character: "A2",        series: "NieR: Automata"  },
        // @crystalwing_cos — Ram — Re:Zero
        { src: "https://picsum.photos/seed/e5b1/800/1000",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b2/800/1100",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b3/900/1000",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b4/800/1000",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b5/800/950",   coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b6/800/1100",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b7/700/1000",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b8/800/1000",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        { src: "https://picsum.photos/seed/e5b9/900/1100",  coser: "@crystalwing_cos", character: "Ram",       series: "Re:Zero"        },
        // @sakurahime_cos — Nilou — Genshin Impact
        { src: "https://picsum.photos/seed/e5c1/800/1000",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c2/800/1100",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c3/900/1000",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c4/800/1000",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c5/800/950",   coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c6/800/1100",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c7/700/1000",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c8/800/1000",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e5c9/900/1100",  coser: "@sakurahime_cos",  character: "Nilou",     series: "Genshin Impact" }
      ]
    },
    {
      id: "otakon-2024",
      name: "Otakon 2024",
      date: "July 2024",
      location: "Washington, DC",
      description: "Otakon — celebration of East Asian pop culture at the Walter E. Washington Convention Center.",
      cover: "https://picsum.photos/seed/ev6cv/800/600",
      photos: [
        // @neonbloom_cos — Nezuko — Demon Slayer
        { src: "https://picsum.photos/seed/e6a1/800/1000",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a2/800/1100",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a3/900/1000",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a4/800/1000",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a5/800/950",   coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a6/800/1100",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a7/700/1000",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a8/800/1000",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        { src: "https://picsum.photos/seed/e6a9/900/1100",  coser: "@neonbloom_cos",   character: "Nezuko",    series: "Demon Slayer"   },
        // @mirrorshade_x — Asuka — Neon Genesis Evangelion
        { src: "https://picsum.photos/seed/e6b1/800/1000",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b2/800/1100",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b3/900/1000",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b4/800/1000",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b5/800/950",   coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b6/800/1100",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b7/700/1000",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b8/800/1000",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        { src: "https://picsum.photos/seed/e6b9/900/1100",  coser: "@mirrorshade_x",   character: "Asuka",     series: "Neon Genesis Evangelion" },
        // @luminacraft — Raiden Ei — Genshin Impact
        { src: "https://picsum.photos/seed/e6c1/800/1000",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c2/800/1100",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c3/900/1000",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c4/800/1000",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c5/800/950",   coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c6/800/1100",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c7/700/1000",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c8/800/1000",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e6c9/900/1100",  coser: "@luminacraft",     character: "Raiden Ei", series: "Genshin Impact" }
      ]
    },
    {
      id: "anime-boston-2025",
      name: "Anime Boston 2025",
      date: "March 2025",
      location: "Boston, MA",
      description: "New England's premier anime convention at the Hynes Convention Center.",
      cover: "https://picsum.photos/seed/ev7cv/800/600",
      photos: [
        // @crystalwing_cos — Saber — Fate/Stay Night
        { src: "https://picsum.photos/seed/e7a1/800/1000",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a2/800/1100",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a3/900/1000",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a4/800/1000",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a5/800/950",   coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a6/800/1100",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a7/700/1000",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a8/800/1000",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        { src: "https://picsum.photos/seed/e7a9/900/1100",  coser: "@crystalwing_cos", character: "Saber",     series: "Fate/Stay Night"  },
        // @voidvessel_cos — Ranni — Elden Ring
        { src: "https://picsum.photos/seed/e7b1/800/1000",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b2/800/1100",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b3/900/1000",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b4/800/1000",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b5/800/950",   coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b6/800/1100",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b7/700/1000",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b8/800/1000",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        { src: "https://picsum.photos/seed/e7b9/900/1100",  coser: "@voidvessel_cos",  character: "Ranni",     series: "Elden Ring"       },
        // @neonbloom_cos — Marin Kitagawa — My Dress-Up Darling
        { src: "https://picsum.photos/seed/e7c1/800/1000",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c2/800/1100",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c3/900/1000",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c4/800/1000",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c5/800/950",   coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c6/800/1100",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c7/700/1000",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c8/800/1000",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" },
        { src: "https://picsum.photos/seed/e7c9/900/1100",  coser: "@neonbloom_cos",   character: "Marin Kitagawa", series: "My Dress-Up Darling" }
      ]
    },
    {
      id: "megacon-2025",
      name: "Megacon 2025",
      date: "February 2025",
      location: "Orlando, FL",
      description: "MegaCon Orlando — one of the largest pop-culture conventions on the East Coast.",
      cover: "https://picsum.photos/seed/ev8cv/800/600",
      photos: [
        // @sakurahime_cos — Ganyu — Genshin Impact
        { src: "https://picsum.photos/seed/e8a1/800/1000",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a2/800/1100",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a3/900/1000",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a4/800/1000",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a5/800/950",   coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a6/800/1100",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a7/700/1000",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a8/800/1000",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8a9/900/1100",  coser: "@sakurahime_cos",  character: "Ganyu",     series: "Genshin Impact" },
        // @luminacraft — Nahida — Genshin Impact
        { src: "https://picsum.photos/seed/e8b1/800/1000",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b2/800/1100",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b3/900/1000",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b4/800/1000",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b5/800/950",   coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b6/800/1100",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b7/700/1000",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b8/800/1000",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e8b9/900/1100",  coser: "@luminacraft",     character: "Nahida",    series: "Genshin Impact" },
        // @mirrorshade_x — Ranni — Elden Ring
        { src: "https://picsum.photos/seed/e8c1/800/1000",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c2/800/1100",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c3/900/1000",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c4/800/1000",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c5/800/950",   coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c6/800/1100",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c7/700/1000",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c8/800/1000",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     },
        { src: "https://picsum.photos/seed/e8c9/900/1100",  coser: "@mirrorshade_x",   character: "Ranni",     series: "Elden Ring"     }
      ]
    },
    {
      id: "wondercon-2025",
      name: "WonderCon 2025",
      date: "March 2025",
      location: "Anaheim, CA",
      description: "WonderCon Anaheim — comics, film, and cosplay at the Anaheim Convention Center.",
      cover: "https://picsum.photos/seed/ev9cv/800/600",
      photos: [
        // @voidvessel_cos — 2B — NieR: Automata
        { src: "https://picsum.photos/seed/e9a1/800/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a2/800/1100",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a3/900/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a4/800/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a5/800/950",   coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a6/800/1100",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a7/700/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a8/800/1000",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        { src: "https://picsum.photos/seed/e9a9/900/1100",  coser: "@voidvessel_cos",  character: "2B",        series: "NieR: Automata"  },
        // @crystalwing_cos — Albedo — Genshin Impact
        { src: "https://picsum.photos/seed/e9b1/800/1000",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b2/800/1100",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b3/900/1000",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b4/800/1000",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b5/800/950",   coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b6/800/1100",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b7/700/1000",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b8/800/1000",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9b9/900/1100",  coser: "@crystalwing_cos", character: "Albedo",    series: "Genshin Impact" },
        // @sakurahime_cos — Keqing — Genshin Impact
        { src: "https://picsum.photos/seed/e9c1/800/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c2/800/1100",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c3/900/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c4/800/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c5/800/950",   coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c6/800/1100",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c7/700/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c8/800/1000",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" },
        { src: "https://picsum.photos/seed/e9c9/900/1100",  coser: "@sakurahime_cos",  character: "Keqing",    series: "Genshin Impact" }
      ]
    }
  ],

  // ── Studio Shoots ────────────────────────────────────────
  // Studio albums are organised by cosplayer section.
  // Each cosplayer gets a header + their own photo grid.
  //
  // Fields per cosplayer:
  //   name      — display name
  //   handle    — social @handle
  //   character — character they cosplayed
  //   series    — game / anime / series name
  //   photos    — their photos from this shoot
  studio: [
    {
      id: "genshin-jan-2025",
      name: "Genshin Impact Session",
      date: "January 2025",
      description: "Studio shoot with custom backdrop setups inspired by Teyvat environments.",
      cover: "https://picsum.photos/seed/st1cv/800/600",
      cosplayers: [
        { name: "Sakura Hime",  handle: "@sakurahime_cos",  character: "Hu Tao",  series: "Genshin Impact",
          photos: [
            { src: "https://picsum.photos/seed/s1a1/800/1100" }, { src: "https://picsum.photos/seed/s1a2/800/1000" },
            { src: "https://picsum.photos/seed/s1a3/900/1000" }, { src: "https://picsum.photos/seed/s1a4/800/1100" },
            { src: "https://picsum.photos/seed/s1a5/700/1000" }, { src: "https://picsum.photos/seed/s1a6/800/1000" },
            { src: "https://picsum.photos/seed/s1a7/800/1100" }, { src: "https://picsum.photos/seed/s1a8/900/1000" },
            { src: "https://picsum.photos/seed/s1a9/800/950"  }
          ]
        },
        { name: "Lumina Craft",  handle: "@luminacraft",    character: "Ganyu",   series: "Genshin Impact",
          photos: [
            { src: "https://picsum.photos/seed/s1b1/800/1100" }, { src: "https://picsum.photos/seed/s1b2/800/1000" },
            { src: "https://picsum.photos/seed/s1b3/900/1000" }, { src: "https://picsum.photos/seed/s1b4/800/1100" },
            { src: "https://picsum.photos/seed/s1b5/700/1000" }, { src: "https://picsum.photos/seed/s1b6/800/1000" },
            { src: "https://picsum.photos/seed/s1b7/800/1100" }, { src: "https://picsum.photos/seed/s1b8/900/1000" },
            { src: "https://picsum.photos/seed/s1b9/800/950"  }
          ]
        }
      ]
    },
    {
      id: "nier-march-2025",
      name: "NieR: Automata Session",
      date: "March 2025",
      description: "High-contrast black and white studio shoot with dramatic lighting inspired by the game's aesthetic.",
      cover: "https://picsum.photos/seed/st2cv/800/600",
      cosplayers: [
        { name: "Void Vessel",   handle: "@voidvessel_cos", character: "2B",      series: "NieR: Automata",
          photos: [
            { src: "https://picsum.photos/seed/s2a1/800/1000" }, { src: "https://picsum.photos/seed/s2a2/800/1100" },
            { src: "https://picsum.photos/seed/s2a3/900/1000" }, { src: "https://picsum.photos/seed/s2a4/800/1000" },
            { src: "https://picsum.photos/seed/s2a5/700/1100" }, { src: "https://picsum.photos/seed/s2a6/800/950"  },
            { src: "https://picsum.photos/seed/s2a7/800/1000" }, { src: "https://picsum.photos/seed/s2a8/900/1100" },
            { src: "https://picsum.photos/seed/s2a9/800/1000" }
          ]
        },
        { name: "Crystal Wing",  handle: "@crystalwing_cos",character: "A2",      series: "NieR: Automata",
          photos: [
            { src: "https://picsum.photos/seed/s2b1/800/1000" }, { src: "https://picsum.photos/seed/s2b2/800/1100" },
            { src: "https://picsum.photos/seed/s2b3/900/1000" }, { src: "https://picsum.photos/seed/s2b4/800/1000" },
            { src: "https://picsum.photos/seed/s2b5/700/1100" }, { src: "https://picsum.photos/seed/s2b6/800/950"  },
            { src: "https://picsum.photos/seed/s2b7/800/1000" }, { src: "https://picsum.photos/seed/s2b8/900/1100" },
            { src: "https://picsum.photos/seed/s2b9/800/1000" }
          ]
        }
      ]
    },
    {
      id: "chainsaw-man-feb-2025",
      name: "Chainsaw Man Session",
      date: "February 2025",
      description: "Dark and moody studio shoot drawing on Chainsaw Man's horror and action atmosphere.",
      cover: "https://picsum.photos/seed/st3cv/800/600",
      cosplayers: [
        { name: "Mirror Shade",  handle: "@mirrorshade_x",  character: "Makima",  series: "Chainsaw Man",
          photos: [
            { src: "https://picsum.photos/seed/s3a1/800/1100" }, { src: "https://picsum.photos/seed/s3a2/800/1000" },
            { src: "https://picsum.photos/seed/s3a3/900/1000" }, { src: "https://picsum.photos/seed/s3a4/800/1100" },
            { src: "https://picsum.photos/seed/s3a5/700/1000" }, { src: "https://picsum.photos/seed/s3a6/800/1000" },
            { src: "https://picsum.photos/seed/s3a7/800/1100" }, { src: "https://picsum.photos/seed/s3a8/900/1000" },
            { src: "https://picsum.photos/seed/s3a9/800/950"  }
          ]
        },
        { name: "Crystal Wing",  handle: "@crystalwing_cos",character: "Power",   series: "Chainsaw Man",
          photos: [
            { src: "https://picsum.photos/seed/s3b1/800/1100" }, { src: "https://picsum.photos/seed/s3b2/800/1000" },
            { src: "https://picsum.photos/seed/s3b3/900/1000" }, { src: "https://picsum.photos/seed/s3b4/800/1100" },
            { src: "https://picsum.photos/seed/s3b5/700/1000" }, { src: "https://picsum.photos/seed/s3b6/800/1000" },
            { src: "https://picsum.photos/seed/s3b7/800/1100" }, { src: "https://picsum.photos/seed/s3b8/900/1000" },
            { src: "https://picsum.photos/seed/s3b9/800/950"  }
          ]
        }
      ]
    },
    {
      id: "demon-slayer-dec-2024",
      name: "Demon Slayer Session",
      date: "December 2024",
      description: "Atmospheric studio shoot with traditional Japanese backdrop elements.",
      cover: "https://picsum.photos/seed/st4cv/800/600",
      cosplayers: [
        { name: "Neon Bloom",    handle: "@neonbloom_cos",  character: "Nezuko",  series: "Demon Slayer",
          photos: [
            { src: "https://picsum.photos/seed/s4a1/800/1000" }, { src: "https://picsum.photos/seed/s4a2/800/1100" },
            { src: "https://picsum.photos/seed/s4a3/900/1000" }, { src: "https://picsum.photos/seed/s4a4/800/1000" },
            { src: "https://picsum.photos/seed/s4a5/700/1100" }, { src: "https://picsum.photos/seed/s4a6/800/950"  },
            { src: "https://picsum.photos/seed/s4a7/800/1000" }, { src: "https://picsum.photos/seed/s4a8/900/1100" },
            { src: "https://picsum.photos/seed/s4a9/800/1000" }
          ]
        },
        { name: "Sakura Hime",  handle: "@sakurahime_cos",  character: "Kanao",   series: "Demon Slayer",
          photos: [
            { src: "https://picsum.photos/seed/s4b1/800/1000" }, { src: "https://picsum.photos/seed/s4b2/800/1100" },
            { src: "https://picsum.photos/seed/s4b3/900/1000" }, { src: "https://picsum.photos/seed/s4b4/800/1000" },
            { src: "https://picsum.photos/seed/s4b5/700/1100" }, { src: "https://picsum.photos/seed/s4b6/800/950"  },
            { src: "https://picsum.photos/seed/s4b7/800/1000" }, { src: "https://picsum.photos/seed/s4b8/900/1100" },
            { src: "https://picsum.photos/seed/s4b9/800/1000" }
          ]
        }
      ]
    },
    {
      id: "rezero-nov-2024",
      name: "Re:Zero Session",
      date: "November 2024",
      description: "Soft pastel lighting shoot with twin maids — Rem and Ram from Re:Zero.",
      cover: "https://picsum.photos/seed/st5cv/800/600",
      cosplayers: [
        { name: "Neon Bloom",    handle: "@neonbloom_cos",  character: "Rem",     series: "Re:Zero",
          photos: [
            { src: "https://picsum.photos/seed/s5a1/800/1100" }, { src: "https://picsum.photos/seed/s5a2/800/1000" },
            { src: "https://picsum.photos/seed/s5a3/900/1000" }, { src: "https://picsum.photos/seed/s5a4/800/1100" },
            { src: "https://picsum.photos/seed/s5a5/700/1000" }, { src: "https://picsum.photos/seed/s5a6/800/1000" },
            { src: "https://picsum.photos/seed/s5a7/800/1100" }, { src: "https://picsum.photos/seed/s5a8/900/1000" },
            { src: "https://picsum.photos/seed/s5a9/800/950"  }
          ]
        },
        { name: "Crystal Wing",  handle: "@crystalwing_cos",character: "Ram",     series: "Re:Zero",
          photos: [
            { src: "https://picsum.photos/seed/s5b1/800/1100" }, { src: "https://picsum.photos/seed/s5b2/800/1000" },
            { src: "https://picsum.photos/seed/s5b3/900/1000" }, { src: "https://picsum.photos/seed/s5b4/800/1100" },
            { src: "https://picsum.photos/seed/s5b5/700/1000" }, { src: "https://picsum.photos/seed/s5b6/800/1000" },
            { src: "https://picsum.photos/seed/s5b7/800/1100" }, { src: "https://picsum.photos/seed/s5b8/900/1000" },
            { src: "https://picsum.photos/seed/s5b9/800/950"  }
          ]
        }
      ]
    },
    {
      id: "spy-family-oct-2024",
      name: "Spy x Family Session",
      date: "October 2024",
      description: "Elegant assassin aesthetic — crimson and white studio setup.",
      cover: "https://picsum.photos/seed/st6cv/800/600",
      cosplayers: [
        { name: "Mirror Shade",  handle: "@mirrorshade_x",  character: "Yor Forger", series: "Spy x Family",
          photos: [
            { src: "https://picsum.photos/seed/s6a1/800/1000" }, { src: "https://picsum.photos/seed/s6a2/800/1100" },
            { src: "https://picsum.photos/seed/s6a3/900/1000" }, { src: "https://picsum.photos/seed/s6a4/800/1000" },
            { src: "https://picsum.photos/seed/s6a5/700/1100" }, { src: "https://picsum.photos/seed/s6a6/800/950"  },
            { src: "https://picsum.photos/seed/s6a7/800/1000" }, { src: "https://picsum.photos/seed/s6a8/900/1100" },
            { src: "https://picsum.photos/seed/s6a9/800/1000" }
          ]
        },
        { name: "Lumina Craft",  handle: "@luminacraft",    character: "Fiona Frost", series: "Spy x Family",
          photos: [
            { src: "https://picsum.photos/seed/s6b1/800/1000" }, { src: "https://picsum.photos/seed/s6b2/800/1100" },
            { src: "https://picsum.photos/seed/s6b3/900/1000" }, { src: "https://picsum.photos/seed/s6b4/800/1000" },
            { src: "https://picsum.photos/seed/s6b5/700/1100" }, { src: "https://picsum.photos/seed/s6b6/800/950"  },
            { src: "https://picsum.photos/seed/s6b7/800/1000" }, { src: "https://picsum.photos/seed/s6b8/900/1100" },
            { src: "https://picsum.photos/seed/s6b9/800/1000" }
          ]
        }
      ]
    },
    {
      id: "elden-ring-sep-2024",
      name: "Elden Ring Session",
      date: "September 2024",
      description: "Epic fantasy studio shoot with gothic architecture props and atmospheric fog.",
      cover: "https://picsum.photos/seed/st7cv/800/600",
      cosplayers: [
        { name: "Void Vessel",   handle: "@voidvessel_cos", character: "Malenia",  series: "Elden Ring",
          photos: [
            { src: "https://picsum.photos/seed/s7a1/800/1100" }, { src: "https://picsum.photos/seed/s7a2/800/1000" },
            { src: "https://picsum.photos/seed/s7a3/900/1000" }, { src: "https://picsum.photos/seed/s7a4/800/1100" },
            { src: "https://picsum.photos/seed/s7a5/700/1000" }, { src: "https://picsum.photos/seed/s7a6/800/1000" },
            { src: "https://picsum.photos/seed/s7a7/800/1100" }, { src: "https://picsum.photos/seed/s7a8/900/1000" },
            { src: "https://picsum.photos/seed/s7a9/800/950"  }
          ]
        },
        { name: "Mirror Shade",  handle: "@mirrorshade_x",  character: "Ranni",    series: "Elden Ring",
          photos: [
            { src: "https://picsum.photos/seed/s7b1/800/1100" }, { src: "https://picsum.photos/seed/s7b2/800/1000" },
            { src: "https://picsum.photos/seed/s7b3/900/1000" }, { src: "https://picsum.photos/seed/s7b4/800/1100" },
            { src: "https://picsum.photos/seed/s7b5/700/1000" }, { src: "https://picsum.photos/seed/s7b6/800/1000" },
            { src: "https://picsum.photos/seed/s7b7/800/1100" }, { src: "https://picsum.photos/seed/s7b8/900/1000" },
            { src: "https://picsum.photos/seed/s7b9/800/950"  }
          ]
        }
      ]
    },
    {
      id: "cyberpunk-aug-2024",
      name: "Cyberpunk 2077 Session",
      date: "August 2024",
      description: "Neon-lit cyberpunk aesthetic with custom LED backdrop and futuristic props.",
      cover: "https://picsum.photos/seed/st8cv/800/600",
      cosplayers: [
        { name: "Neon Bloom",    handle: "@neonbloom_cos",  character: "Female V", series: "Cyberpunk 2077",
          photos: [
            { src: "https://picsum.photos/seed/s8a1/800/1000" }, { src: "https://picsum.photos/seed/s8a2/800/1100" },
            { src: "https://picsum.photos/seed/s8a3/900/1000" }, { src: "https://picsum.photos/seed/s8a4/800/1000" },
            { src: "https://picsum.photos/seed/s8a5/700/1100" }, { src: "https://picsum.photos/seed/s8a6/800/950"  },
            { src: "https://picsum.photos/seed/s8a7/800/1000" }, { src: "https://picsum.photos/seed/s8a8/900/1100" },
            { src: "https://picsum.photos/seed/s8a9/800/1000" }
          ]
        },
        { name: "Lumina Craft",  handle: "@luminacraft",    character: "Judy Alvarez", series: "Cyberpunk 2077",
          photos: [
            { src: "https://picsum.photos/seed/s8b1/800/1000" }, { src: "https://picsum.photos/seed/s8b2/800/1100" },
            { src: "https://picsum.photos/seed/s8b3/900/1000" }, { src: "https://picsum.photos/seed/s8b4/800/1000" },
            { src: "https://picsum.photos/seed/s8b5/700/1100" }, { src: "https://picsum.photos/seed/s8b6/800/950"  },
            { src: "https://picsum.photos/seed/s8b7/800/1000" }, { src: "https://picsum.photos/seed/s8b8/900/1100" },
            { src: "https://picsum.photos/seed/s8b9/800/1000" }
          ]
        }
      ]
    }
  ],

  // ── Collaborators ─────────────────────────────────────────
  // One entry per cosplayer you collaborate with.
  // Appears on the /collabs.html page.
  //
  // Fields:
  //   id      — unique slug (used in page anchors, no spaces)
  //   name    — cosplayer display name
  //   handle  — social handle (e.g. @username)
  //   bio     — short paragraph (2–4 sentences)
  //   cover   — portrait photo for their profile
  //   gankUrl — full URL to their Gank page
  //   photos  — 6 showcase photos (caption optional)
  collaborators: [
    {
      id: "sakura-hime",
      name: "Sakura Hime",
      handle: "@sakurahime_cos",
      instagram: "@sakurahime_cosplay",
      bio: "A passionate cosplayer specialising in fantasy and JRPG characters from Genshin Impact, Demon Slayer, and beyond. Known for intricate handcrafted details and stunning editorial compositions. Based in Los Angeles and available for convention shoots nationwide.",
      cover: "https://picsum.photos/seed/cl1cv/600/800",
      gankUrl: "https://www.ganknow.com/",
      photos: [
        { src: "https://picsum.photos/seed/cl1p1/600/800", caption: "Hu Tao · Genshin Impact"   },
        { src: "https://picsum.photos/seed/cl1p2/600/800", caption: "Keqing · Genshin Impact"   },
        { src: "https://picsum.photos/seed/cl1p3/600/800", caption: "Yae Miko · Genshin Impact" },
        { src: "https://picsum.photos/seed/cl1p4/600/800", caption: "FanimeCon 2024"             },
        { src: "https://picsum.photos/seed/cl1p5/600/800", caption: "Genshin Studio Session"     },
        { src: "https://picsum.photos/seed/cl1p6/600/800", caption: "Sakura-Con 2025"            }
      ]
    },
    {
      id: "void-vessel",
      name: "Void Vessel",
      handle: "@voidvessel_cos",
      instagram: "@voidvessel_cosplay",
      bio: "Specialising in dark fantasy and action cosplay — from NieR's androids to Elden Ring's demigods. Builds every prop and armour piece from scratch with theatrical precision. Has been featured in multiple gaming publications and streams build progress live.",
      cover: "https://picsum.photos/seed/cl2cv/600/800",
      gankUrl: "https://www.ganknow.com/",
      photos: [
        { src: "https://picsum.photos/seed/cl2p1/600/800", caption: "2B · NieR: Automata"       },
        { src: "https://picsum.photos/seed/cl2p2/600/800", caption: "A2 · NieR: Automata"       },
        { src: "https://picsum.photos/seed/cl2p3/600/800", caption: "Malenia · Elden Ring"       },
        { src: "https://picsum.photos/seed/cl2p4/600/800", caption: "Ranni · Elden Ring"         },
        { src: "https://picsum.photos/seed/cl2p5/600/800", caption: "FanimeCon 2024"             },
        { src: "https://picsum.photos/seed/cl2p6/600/800", caption: "NieR Studio Session"        }
      ]
    },
    {
      id: "lumina-craft",
      name: "Lumina Craft",
      handle: "@luminacraft",
      instagram: "@luminacraft",
      bio: "Award-winning cosplay creator celebrated for luminous, light-integrated builds. Featured in multiple international cosplay magazines and a regular stage competitor. Specialises in Genshin Impact's ethereal characters and brings a painterly quality to every shot.",
      cover: "https://picsum.photos/seed/cl3cv/600/800",
      gankUrl: "https://www.ganknow.com/",
      photos: [
        { src: "https://picsum.photos/seed/cl3p1/600/800", caption: "Ganyu · Genshin Impact"    },
        { src: "https://picsum.photos/seed/cl3p2/600/800", caption: "Raiden Ei · Genshin Impact"},
        { src: "https://picsum.photos/seed/cl3p3/600/800", caption: "Nahida · Genshin Impact"   },
        { src: "https://picsum.photos/seed/cl3p4/600/800", caption: "Comic-Con 2024"             },
        { src: "https://picsum.photos/seed/cl3p5/600/800", caption: "Genshin Studio Session"     },
        { src: "https://picsum.photos/seed/cl3p6/600/800", caption: "Cyberpunk Studio Session"   }
      ]
    },
    {
      id: "mirror-shade",
      name: "Mirror Shade",
      handle: "@mirrorshade_x",
      instagram: "@mirrorshade.cos",
      bio: "A master of editorial and villain aesthetics — Makima's corporate menace, Yor Forger's lethal grace, and Asuka's iconic pilot suit. Brings a cinematic edge to every project with self-made wigs and hand-painted props. Available for commercial bookings.",
      cover: "https://picsum.photos/seed/cl4cv/600/800",
      gankUrl: "https://www.ganknow.com/",
      photos: [
        { src: "https://picsum.photos/seed/cl4p1/600/800", caption: "Makima · Chainsaw Man"     },
        { src: "https://picsum.photos/seed/cl4p2/600/800", caption: "Yor Forger · Spy x Family" },
        { src: "https://picsum.photos/seed/cl4p3/600/800", caption: "Asuka · NGE"               },
        { src: "https://picsum.photos/seed/cl4p4/600/800", caption: "Ranni · Elden Ring"         },
        { src: "https://picsum.photos/seed/cl4p5/600/800", caption: "Anime Expo 2024"            },
        { src: "https://picsum.photos/seed/cl4p6/600/800", caption: "Chainsaw Man Session"       }
      ]
    },
    {
      id: "neon-bloom",
      name: "Neon Bloom",
      handle: "@neonbloom_cos",
      instagram: "@neonbloom_cosplay",
      bio: "Vibrant anime cosplayer with a gift for capturing emotional depth — from Nezuko's quiet ferocity to Zero Two's fierce tenderness. Neon Bloom's shoots feel alive, full of movement and colour. Based in Seattle and a frequent Sakura-Con stage finalist.",
      cover: "https://picsum.photos/seed/cl5cv/600/800",
      gankUrl: "https://www.ganknow.com/",
      photos: [
        { src: "https://picsum.photos/seed/cl5p1/600/800", caption: "Zero Two · DITF"           },
        { src: "https://picsum.photos/seed/cl5p2/600/800", caption: "Rem · Re:Zero"              },
        { src: "https://picsum.photos/seed/cl5p3/600/800", caption: "Nezuko · Demon Slayer"      },
        { src: "https://picsum.photos/seed/cl5p4/600/800", caption: "Marin · My Dress-Up Darling"},
        { src: "https://picsum.photos/seed/cl5p5/600/800", caption: "Otakon 2024"                },
        { src: "https://picsum.photos/seed/cl5p6/600/800", caption: "Re:Zero Studio Session"     }
      ]
    },
    {
      id: "crystal-wing",
      name: "Crystal Wing",
      handle: "@crystalwing_cos",
      instagram: "@crystalwing.cosplay",
      bio: "Armour and action specialist known for flawless craftsmanship in foam, resin, and worbla. Crystal Wing's builds are stage-ready works of art — from Power's raw energy to Saber's royal armour. Ships custom prop commissions worldwide.",
      cover: "https://picsum.photos/seed/cl6cv/600/800",
      gankUrl: "https://www.ganknow.com/",
      photos: [
        { src: "https://picsum.photos/seed/cl6p1/600/800", caption: "Power · Chainsaw Man"      },
        { src: "https://picsum.photos/seed/cl6p2/600/800", caption: "Ram · Re:Zero"              },
        { src: "https://picsum.photos/seed/cl6p3/600/800", caption: "Saber · Fate/Stay Night"   },
        { src: "https://picsum.photos/seed/cl6p4/600/800", caption: "A2 · NieR: Automata"       },
        { src: "https://picsum.photos/seed/cl6p5/600/800", caption: "Sakura-Con 2025"            },
        { src: "https://picsum.photos/seed/cl6p6/600/800", caption: "Chainsaw Man Session"       }
      ]
    }
  ]

};
