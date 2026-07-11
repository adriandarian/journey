import { parseContentPack } from '../../model/schema'

const steps = [
  ['first-echo', 'The First Echo', 0.53, 0.83],
  ['village-in-need', 'Village in Need', 0.56, 0.71],
  ['into-the-wilds', 'Into the Wilds', 0.5, 0.6],
  ['lost-courier', 'Lost Courier', 0.39, 0.55],
  ['bamboo-shade', 'Bamboo Shade', 0.55, 0.49],
  ['river-crossing', 'River Crossing', 0.49, 0.4],
  ['stonewake-pass', 'Stonewake Pass', 0.45, 0.31],
  ['winds-test', "Wind's Test", 0.4, 0.22],
  ['silent-bell', 'The Silent Bell', 0.36, 0.18],
  ['debt-remembered', 'A Debt Remembered', 0.31, 0.27],
  ['lanterns-at-dusk', 'Lanterns at Dusk', 0.28, 0.38],
  ['broken-seal', 'The Broken Seal', 0.33, 0.47],
  ['jade-brook-whispers', 'Whispers at Jade Brook', 0.42, 0.64],
  ['ferrymans-oath', "The Ferryman's Oath", 0.58, 0.76],
  ['cloudrest-vigil', 'Cloudrest Vigil', 0.68, 0.68],
  ['hidden-courtyard', 'The Hidden Courtyard', 0.71, 0.55],
  ['ashes-on-wind', 'Ashes on the Wind', 0.67, 0.42],
  ['two-roads', 'Choice of the Two Roads', 0.55, 0.17],
  ['returning-crane', 'The Returning Crane', 0.61, 0.29],
  ['beyond-pass', 'Beyond the Pass', 0.49, 0.08],
] as const

const source = {
  id: 'schematic-seed-2026-07-11',
  kind: 'user-authored' as const,
  reference: 'Original Progression Atlas illustrative seed pack',
  contributor: 'Progression Atlas',
  verifiedAt: '2026-07-11',
  confidence: 'schematic' as const,
  permission: 'Original illustrative content for the project',
  contentVersion: 1,
}

const locations = steps.map(([id, title, x, y]) => ({
  id: `location-${id}`,
  mapId: 'qinghe',
  label: title,
  point: { x, y },
  sourceId: source.id,
}))

const questSteps = steps.map(([id, title]) => ({
  id,
  threadId: 'main-story',
  title,
  summary: `Follow the traced route and inspect the linked discoveries for ${title}.`,
  locationId: `location-${id}`,
  rewardIds: id === 'river-crossing' ? ['jade-token'] : [],
  sourceId: source.id,
}))

const primaryOrder = steps
  .map(([id]) => id)
  .filter((id) => id !== 'lost-courier')

const required = primaryOrder.slice(0, -1).flatMap((from, index) => {
  const to = primaryOrder[index + 1]
  if (from === 'two-roads' || from === 'returning-crane') return []
  return [
    {
      id: `edge-${from}-${to}`,
      from,
      to,
      kind: 'required' as const,
      sourceId: source.id,
    },
  ]
})

export const whereWindsMeetSeedPack = parseContentPack({
  manifest: {
    id: 'wwm',
    slug: 'where-winds-meet',
    title: 'Where Winds Meet',
    version: 1,
    adapterVersion: 1,
    capabilities: ['worlds', 'layers', 'regions', 'threads', 'discoveries'],
    theme: { primary: '#65c5a8', branch: '#d86c4a' },
    attribution: 'Original schematic content and map art by Progression Atlas',
    disclaimer:
      'Unofficial fan-made companion; not affiliated with the game publisher or developer.',
  },
  worlds: [{ id: 'qinghe', title: 'Qinghe', sourceId: source.id }],
  maps: [
    {
      id: 'qinghe',
      worldId: 'qinghe',
      width: 3840,
      height: 2160,
      imageUrl: '/games/where-winds-meet/maps/qinghe/source.webp',
      coordinateSystem: 'normalized-image',
      tileManifestUrl:
        '/games/where-winds-meet/maps/qinghe/map-manifest.json',
      layerIds: ['surface'],
      sourceId: source.id,
    },
  ],
  regions: [
    {
      id: 'qinghe',
      worldId: 'qinghe',
      mapId: 'qinghe',
      title: 'Qinghe',
      sourceId: source.id,
    },
  ],
  layers: [
    {
      id: 'surface',
      mapId: 'qinghe',
      title: 'Surface',
      kind: 'surface',
      sourceId: source.id,
    },
  ],
  locations,
  threads: [
    {
      id: 'main-story',
      title: 'Main story',
      kind: 'main',
      stepIds: steps.map(([id]) => id),
      sourceId: source.id,
    },
  ],
  quests: [
    {
      id: 'qinghe-main-story',
      threadId: 'main-story',
      title: 'Qinghe Main Story',
      stepIds: steps.map(([id]) => id),
      sourceId: source.id,
    },
  ],
  steps: questSteps,
  edges: [
    ...required,
    {
      id: 'optional-courier',
      from: 'into-the-wilds',
      to: 'lost-courier',
      kind: 'optional',
      sourceId: source.id,
    },
    {
      id: 'rejoin-courier',
      from: 'lost-courier',
      to: 'bamboo-shade',
      kind: 'rejoins',
      sourceId: source.id,
    },
    {
      id: 'choice-crane',
      from: 'two-roads',
      to: 'returning-crane',
      kind: 'choice',
      choiceGroup: 'final-road',
      sourceId: source.id,
    },
    {
      id: 'choice-pass',
      from: 'two-roads',
      to: 'beyond-pass',
      kind: 'choice',
      choiceGroup: 'final-road',
      sourceId: source.id,
    },
    {
      id: 'context-jade-brook',
      from: 'river-crossing',
      to: 'jade-brook-whispers',
      kind: 'context',
      sourceId: source.id,
    },
  ],
  discoveries: [
    ['river-tablet', 'River Tablet', 'lore', 'river-crossing'],
    ['courier-cache', "Courier's Cache", 'loot', 'lost-courier'],
    ['bamboo-riddle', 'Bamboo Riddle', 'puzzle', 'bamboo-shade'],
    ['silent-shrine', 'Silent Shrine', 'secret', 'silent-bell'],
    ['lantern-market', 'Lantern Market', 'event', 'lanterns-at-dusk'],
    [
      'jade-token-cache',
      'Jade Token Cache',
      'loot',
      'jade-brook-whispers',
    ],
    [
      'cloudrest-merchant',
      'Cloudrest Merchant',
      'merchant',
      'cloudrest-vigil',
    ],
    ['hidden-abode', 'Hidden Abode', 'abode', 'hidden-courtyard'],
  ].map(([id, title, kind, stepId]) => ({
    id,
    title,
    kind,
    locationId: `location-${stepId}`,
    relevantStepIds: [stepId],
    sourceId: source.id,
  })),
  rewards: [
    {
      id: 'jade-token',
      title: 'Jade Token',
      kind: 'item',
      sourceId: source.id,
    },
  ],
  sources: [source],
})
