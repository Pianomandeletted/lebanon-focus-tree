import { PrismaClient, FocusStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ---------------------------------------------------------------------
// This seed exists to prove the data model end-to-end (branching,
// merging, four statuses, cross-path connections like Chamounist -> NLP,
// and a deliberately larger Russia branch) - NOT to hand-author the full
// game. Every faction/country/category below gets a small starter chain;
// add depth for the rest through the admin panel once it's running.
// ---------------------------------------------------------------------

type FocusDef = {
  slug: string;
  title: string;
  status: FocusStatus;
  x: number;
  y: number;
  requires?: string[]; // slugs of prerequisite focuses (within or across paths)
  description?: string;
  requirements?: string[];
};

type PathDef = {
  slug: string;
  name: string;
  description: string;
  color: string;
  category: "faction" | "diplomacy" | "national";
  parentSlug?: string;
  order: number;
  focuses: FocusDef[];
};

const statuses: FocusStatus[] = [
  FocusStatus.COMPLETE,
  FocusStatus.COMPLETING,
  FocusStatus.INCOMPLETE,
  FocusStatus.INCOMPLETE
];

// A standard 4-node "organize -> two branches -> unify" chain, reused for
// factions and national-development categories so every branch at least
// demonstrates split + merge on load.
function standardChain(slug: string, name: string, baseX: number, baseY: number): FocusDef[] {
  return [
    {
      slug: `${slug}_organize`,
      title: `Organize the ${name}`,
      status: statuses[0],
      x: baseX,
      y: baseY,
      description: `Lay the organizational groundwork for ${name}.`,
      requirements: ["No prerequisites"]
    },
    {
      slug: `${slug}_branch_a`,
      title: `Expand ${name} Influence`,
      status: statuses[1],
      x: baseX - 90,
      y: baseY + 120,
      requires: [`${slug}_organize`],
      description: `Grow ${name}'s reach and grassroots support.`,
      requirements: [`Organize the ${name}`]
    },
    {
      slug: `${slug}_branch_b`,
      title: `Consolidate ${name} Base`,
      status: statuses[2],
      x: baseX + 90,
      y: baseY + 120,
      requires: [`${slug}_organize`],
      description: `Secure and formalize ${name}'s existing base of support.`,
      requirements: [`Organize the ${name}`]
    },
    {
      slug: `${slug}_unify`,
      title: `Unify ${name} Strategy`,
      status: statuses[3],
      x: baseX,
      y: baseY + 240,
      requires: [`${slug}_branch_a`, `${slug}_branch_b`],
      description: `Bring both wings of ${name} onto a single long-term strategy.`,
      requirements: [`Expand ${name} Influence`, `Consolidate ${name} Base`]
    }
  ];
}

function diplomacyChain(slug: string, name: string, baseX: number, baseY: number): FocusDef[] {
  return [
    {
      slug: `${slug}_open`,
      title: `Open Relations - ${name}`,
      status: statuses[1],
      x: baseX,
      y: baseY,
      requires: ["diplomacy_root"],
      description: `Establish a formal diplomatic channel with ${name}.`,
      requirements: ["Diplomacy"]
    },
    {
      slug: `${slug}_deepen`,
      title: `Deepen Ties - ${name}`,
      status: statuses[2],
      x: baseX,
      y: baseY + 120,
      requires: [`${slug}_open`],
      description: `Expand cooperation with ${name} beyond initial contact.`,
      requirements: [`Open Relations - ${name}`]
    }
  ];
}

// --- Faction paths -----------------------------------------------------
const FACTIONS: { slug: string; name: string; color: string }[] = [
  { slug: "amal", name: "Amal Movement", color: "#2E7D5B" },
  { slug: "hezbollah", name: "Hezbollah", color: "#3C8C57" },
  { slug: "lebanese_forces", name: "Lebanese Forces", color: "#3B6EA5" },
  { slug: "future_movement", name: "Future Movement", color: "#2F86C9" },
  { slug: "psp", name: "Progressive Socialist Party", color: "#C0392B" },
  { slug: "kataeb", name: "Kataeb", color: "#4B6EAF" },
  { slug: "nlp", name: "National Liberal Party", color: "#8E6BC1" },
  { slug: "laf", name: "Lebanese Armed Forces", color: "#5D6D7E" },
  { slug: "fpm", name: "Free Patriotic Movement", color: "#E67E22" },
  { slug: "fakhreddine", name: "Fakhreddine Dynasty", color: "#B7950B" },
  { slug: "cedar_guardians", name: "Guardians of the Cedar", color: "#1E8449" },
  { slug: "phoenicia", name: "Phoenicia", color: "#7D3C98" },
  { slug: "muslim_brotherhood", name: "Muslim Brotherhood", color: "#117864" },
  { slug: "pan_arab", name: "Pan Arab Path", color: "#A93226" },
  { slug: "chamounist", name: "Chamounist Path", color: "#6C5CB5", parent: "nlp" as const },
  { slug: "lcp", name: "Lebanese Communist Party", color: "#B03A2E" },
  { slug: "ssnp", name: "SSNP", color: "#7B241C" },
  { slug: "sla", name: "South Lebanon Army", color: "#616A6B" },
  { slug: "march14", name: "March 14 Alliance", color: "#2874A6" }
];

// --- Diplomacy branches --------------------------------------------------
const DIPLOMACY_COUNTRIES: { slug: string; name: string }[] = [
  { slug: "usa", name: "United States" },
  { slug: "palestine", name: "Palestine" },
  { slug: "israel", name: "Israel" },
  { slug: "france", name: "France" },
  { slug: "greece_cyprus", name: "Greece / Cyprus" },
  { slug: "turkey", name: "Turkey" },
  { slug: "iran", name: "Iran" },
  { slug: "syria", name: "Syria" },
  { slug: "iraq", name: "Iraq" },
  { slug: "gulf", name: "Gulf Countries" },
  { slug: "nato_csto", name: "NATO-CSTO" },
  { slug: "north_africa", name: "North Africa" },
  { slug: "egypt", name: "Egypt" },
  { slug: "asian_countries", name: "Asian Countries" },
  { slug: "germany", name: "Germany" },
  { slug: "mayflower", name: "Mayflower (Union of Columbia)" }
];

// --- Extra national-development categories ------------------------------
const NATIONAL_CATEGORIES: { slug: string; name: string; color: string }[] = [
  { slug: "economy", name: "Economy", color: "#C9A24B" },
  { slug: "infrastructure", name: "Infrastructure", color: "#7F8C8D" },
  { slug: "military_dev", name: "Military Development", color: "#5D6D7E" },
  { slug: "laf_dev", name: "LAF Development", color: "#566573" },
  { slug: "internal_admin", name: "Internal Administration", color: "#8E735B" },
  { slug: "national_unity", name: "National Unity", color: "#D4AC0D" },
  { slug: "culture", name: "Culture", color: "#AF7AC5" },
  { slug: "technology", name: "Technology", color: "#5DADE2" },
  { slug: "education", name: "Education", color: "#48C9B0" },
  { slug: "reconstruction", name: "Reconstruction", color: "#DC7633" },
  { slug: "cities_regions", name: "Cities and Regions", color: "#7DCEA0" },
  { slug: "intl_orgs", name: "International Organizations", color: "#5499C7" },
  { slug: "constitutional_dev", name: "Constitutional Development", color: "#AAB7B8" },
  { slug: "elections", name: "Elections", color: "#F4D03F" },
  { slug: "government_reforms", name: "Government Reforms", color: "#EB984E" },
  { slug: "major_projects", name: "Major National Projects", color: "#CA6F1E" }
];

async function main() {
  // --- Administrator account ---------------------------------------
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env before seeding.");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db.user.upsert({
    where: { email: adminEmail },
    update: { password: passwordHash, role: "ADMIN", name: process.env.ADMIN_NAME ?? "Admin" },
    create: {
      email: adminEmail,
      password: passwordHash,
      role: "ADMIN",
      name: process.env.ADMIN_NAME ?? "Admin"
    }
  });

  const paths: PathDef[] = [];

  // Faction paths, laid out left-to-right in a grid.
  FACTIONS.forEach((f, i) => {
    const baseX = (i % 5) * 420 + 100;
    const baseY = Math.floor(i / 5) * 500 + 100;
    paths.push({
      slug: f.slug,
      name: f.name,
      description: `Political and organizational path for ${f.name}.`,
      color: f.color,
      category: "faction",
      parentSlug: "parent" in f ? (f.parent as string) : undefined,
      order: i,
      focuses:
        f.slug === "chamounist"
          ? [
              {
                slug: "chamounist_emerge",
                title: "The Chamounist Current Emerges",
                status: FocusStatus.INCOMPLETE,
                x: baseX + 260,
                y: baseY + 340,
                requires: ["nlp_unify"],
                description:
                  "A distinct current within the National Liberal Party coalesces around Camille Chamoun's legacy.",
                requirements: ["Unify National Liberal Party Strategy"]
              },
              {
                slug: "chamounist_press",
                title: "Press the Chamounist Line",
                status: FocusStatus.INCOMPLETE,
                x: baseX + 260,
                y: baseY + 460,
                requires: ["chamounist_emerge"],
                description: "Push the current's positions further within and beyond the NLP.",
                requirements: ["The Chamounist Current Emerges"]
              }
            ]
          : standardChain(f.slug, f.name, baseX, baseY)
    });
  });

  // Diplomacy root + country branches.
  const diplomacyBaseY = Math.ceil(FACTIONS.length / 5) * 500 + 200;
  paths.push({
    slug: "diplomacy",
    name: "Diplomacy",
    description: "The root of Lebanon's foreign-policy tree. Every country branch connects from here.",
    color: "#C9A24B",
    category: "diplomacy",
    order: 0,
    focuses: [
      {
        slug: "diplomacy_root",
        title: "Diplomacy",
        status: FocusStatus.COMPLETE,
        x: 100,
        y: diplomacyBaseY,
        description: "Establish the foreign ministry apparatus needed to pursue every relationship below.",
        requirements: ["No prerequisites"]
      }
    ]
  });

  DIPLOMACY_COUNTRIES.forEach((c, i) => {
    const baseX = (i % 6) * 340 + 300;
    const baseY = diplomacyBaseY + 160 + Math.floor(i / 6) * 300;
    paths.push({
      slug: `dip_${c.slug}`,
      name: c.name,
      description: `Foreign-policy branch toward ${c.name}.`,
      color: "#8FA6BF",
      category: "diplomacy",
      parentSlug: "diplomacy",
      order: i + 1,
      focuses: diplomacyChain(c.slug, c.name, baseX, baseY)
    });
  });

  // Russia: deliberately larger than the other diplomacy branches.
  const ruX = 300;
  const ruY = diplomacyBaseY + 900;
  paths.push({
    slug: "dip_russia",
    name: "Russia",
    description: "Lebanon's most developed foreign-policy branch, reflecting its outsized strategic weight.",
    color: "#B03A2E",
    category: "diplomacy",
    parentSlug: "diplomacy",
    order: 99,
    focuses: [
      {
        slug: "russia_open",
        title: "Open Relations - Russia",
        status: FocusStatus.COMPLETING,
        x: ruX,
        y: ruY,
        requires: ["diplomacy_root"],
        description: "Establish a formal diplomatic channel with Russia.",
        requirements: ["Diplomacy"]
      },
      {
        slug: "russia_trade",
        title: "Russia Trade Framework",
        status: FocusStatus.INCOMPLETE,
        x: ruX - 160,
        y: ruY + 130,
        requires: ["russia_open"],
        description: "Negotiate a bilateral trade and investment framework.",
        requirements: ["Open Relations - Russia"]
      },
      {
        slug: "russia_military",
        title: "Russia Military Cooperation",
        status: FocusStatus.INCOMPLETE,
        x: ruX + 160,
        y: ruY + 130,
        requires: ["russia_open"],
        description: "Explore training, equipment, and advisory cooperation.",
        requirements: ["Open Relations - Russia"]
      },
      {
        slug: "russia_strategic_partnership",
        title: "Russia-Lebanon Strategic Partnership",
        status: FocusStatus.INCOMPLETE,
        x: ruX,
        y: ruY + 260,
        requires: ["russia_trade", "russia_military"],
        description: "Formalize trade and military cooperation into a single strategic partnership.",
        requirements: ["Russia Trade Framework", "Russia Military Cooperation"]
      },
      {
        slug: "russia_energy_corridor",
        title: "Black Sea Energy Corridor",
        status: FocusStatus.IMPOSSIBLE,
        x: ruX,
        y: ruY + 390,
        requires: ["russia_strategic_partnership"],
        description: "A proposed energy corridor, currently blocked by regional circumstances.",
        requirements: ["Russia-Lebanon Strategic Partnership"]
      }
    ]
  });

  // National-development categories.
  const natBaseY = ruY + 600;
  NATIONAL_CATEGORIES.forEach((n, i) => {
    const baseX = (i % 5) * 420 + 100;
    const baseY = natBaseY + Math.floor(i / 5) * 500;
    paths.push({
      slug: n.slug,
      name: n.name,
      description: `National-development path: ${n.name}.`,
      color: n.color,
      category: "national",
      order: i,
      focuses: standardChain(n.slug, n.name, baseX, baseY)
    });
  });

  // --- Write paths first (two passes, so parentSlug can resolve) ------
  const pathIdBySlug = new Map<string, string>();
  for (const p of paths) {
    const created = await db.path.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        color: p.color,
        category: p.category,
        order: p.order
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        color: p.color,
        category: p.category,
        order: p.order
      }
    });
    pathIdBySlug.set(p.slug, created.id);
  }
  for (const p of paths) {
    if (p.parentSlug) {
      await db.path.update({
        where: { slug: p.slug },
        data: { parentPathId: pathIdBySlug.get(p.parentSlug) }
      });
    }
  }

  // --- Write focuses ---------------------------------------------------
  const focusIdBySlug = new Map<string, string>();
  for (const p of paths) {
    const pathId = pathIdBySlug.get(p.slug)!;
    for (const [order, f] of p.focuses.entries()) {
      const created = await db.focus.upsert({
        where: { slug: f.slug },
        update: {
          title: f.title,
          description: f.description ?? "",
          status: f.status,
          x: f.x,
          y: f.y,
          order,
          requirements: f.requirements ?? [],
          pathId
        },
        create: {
          slug: f.slug,
          title: f.title,
          description: f.description ?? "",
          status: f.status,
          x: f.x,
          y: f.y,
          order,
          requirements: f.requirements ?? [],
          pathId
        }
      });
      focusIdBySlug.set(f.slug, created.id);
    }
  }

  // --- Write connections -------------------------------------------------
  for (const p of paths) {
    for (const f of p.focuses) {
      for (const reqSlug of f.requires ?? []) {
        const fromFocusId = focusIdBySlug.get(reqSlug);
        const toFocusId = focusIdBySlug.get(f.slug);
        if (!fromFocusId || !toFocusId) continue;
        await db.focusConnection.upsert({
          where: { fromFocusId_toFocusId: { fromFocusId, toFocusId } },
          update: {},
          create: { fromFocusId, toFocusId }
        });
      }
    }
  }

  // --- Statistics ----------------------------------------------------
  const stats = [
    { key: "population", label: "Population", value: 6_800_000, unit: "", order: 0 },
    { key: "gdp", label: "GDP", value: 23_000_000_000, unit: "$", order: 1 },
    { key: "military_strength", label: "Military Strength", value: 42, maxValue: 100, order: 2 },
    { key: "political_stability", label: "Political Stability", value: 35, maxValue: 100, order: 3 },
    { key: "national_unity", label: "National Unity", value: 48, maxValue: 100, order: 4 },
    { key: "diplomatic_relations", label: "Diplomatic Relations", value: 60, maxValue: 100, order: 5 }
  ];
  for (const s of stats) {
    await db.statistic.upsert({
      where: { key: s.key },
      update: { label: s.label, value: s.value, maxValue: s.maxValue, unit: s.unit ?? "", order: s.order },
      create: {
        key: s.key,
        label: s.label,
        value: s.value,
        maxValue: s.maxValue,
        unit: s.unit ?? "",
        order: s.order
      }
    });
  }

  // --- Sample announcement + music track placeholder -------------------
  const existingAnnouncement = await db.announcement.findFirst();
  if (!existingAnnouncement) {
    await db.announcement.create({
      data: {
        title: "Focus tree is live",
        body: "The national focus tree is now live and under active development. Expect new branches regularly.",
        isPinned: true
      }
    });
  }

  const existingTrack = await db.musicTrack.findFirst();
  if (!existingTrack) {
    await db.musicTrack.create({
      data: {
        title: "Add your first track in /admin/music",
        artist: "",
        url: "/audio/placeholder.mp3",
        order: 0,
        isEnabled: false
      }
    });
  }

  console.log(`Seeded ${paths.length} paths and ${focusIdBySlug.size} focuses.`);
  console.log(`Admin account ready: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
