'use strict';

// Traduce el vocabulario en ingles del dataset (target / muscle_group /
// secondary_muscles) a los IDs reales que usa react-body-highlighter en el
// front-web (ver tauros-front-web/src/features/tauros/components/MuscleSelector.js).
// Los terminos sin equivalente anatomico razonable (ankles, hands, feet, etc.)
// se omiten a proposito en vez de forzar un mapeo aproximado.
const MUSCLE_TO_SELECTOR_IDS = {
  abdominals: ['abs'],
  abs: ['abs'],
  abductors: ['abductors'],
  adductors: ['adductor'],
  biceps: ['biceps'],
  brachialis: ['biceps'],
  calves: ['calves'],
  chest: ['chest'],
  core: ['abs'],
  delts: ['front-deltoids', 'back-deltoids'],
  deltoids: ['front-deltoids', 'back-deltoids'],
  'rear deltoids': ['back-deltoids'],
  forearms: ['forearm'],
  'wrist extensors': ['forearm'],
  'wrist flexors': ['forearm'],
  'grip muscles': ['forearm'],
  glutes: ['gluteal'],
  groin: ['adductor'],
  'inner thighs': ['adductor'],
  hamstrings: ['hamstring'],
  'latissimus dorsi': ['upper-back'],
  lats: ['upper-back'],
  'lower back': ['lower-back'],
  spine: ['lower-back'],
  'lower abs': ['abs'],
  'levator scapulae': ['neck'],
  obliques: ['obliques'],
  pectorals: ['chest'],
  'upper chest': ['chest'],
  quadriceps: ['quadriceps'],
  quads: ['quadriceps'],
  rhomboids: ['upper-back'],
  'rotator cuff': ['back-deltoids'],
  'serratus anterior': ['chest'],
  shoulders: ['front-deltoids', 'back-deltoids'],
  soleus: ['left-soleus', 'right-soleus'],
  sternocleidomastoid: ['neck'],
  trapezius: ['trapezius'],
  traps: ['trapezius'],
  triceps: ['triceps'],
  'upper back': ['upper-back'],
  back: ['upper-back'],
  // Sin equivalente util en el selector: cardiovascular system, ankles,
  // ankle stabilizers, hands, wrists, feet, hip flexors, shins.
};

// body_part es el campo con enum fijo (10 valores) del dataset -- es la
// REGION general del cuerpo (brazo, pierna, pecho...). En el modelo de datos
// real de Tauros (confirmado contra la BD de produccion 2026-09-19) esto
// corresponde a la tabla Tipo, no a Categoria: Tipo = region general,
// Categoria = musculo especifico (ver TARGET_LABELS abajo). Los valores en
// espanol respetan EXACTAMENTE los nombres ya existentes en la tabla `tipo`
// (Brazos, Espalda, Pecho, Piernas, Core) mas los que hizo falta agregar
// (Cardio, Hombros, Cuello -- ver scripts/backfill-categoria-tipo.js).
const BODY_PART_LABELS = {
  back: 'Espalda',
  cardio: 'Cardio',
  chest: 'Pecho',
  'lower arms': 'Brazos',
  'lower legs': 'Piernas',
  neck: 'Cuello',
  shoulders: 'Hombros',
  'upper arms': 'Brazos',
  'upper legs': 'Piernas',
  waist: 'Core',
};

// target es el musculo ESPECIFICO que trabaja el ejercicio -- corresponde a
// la tabla Categoria (Cuadriceps, Femorales, Hombros, Pantorrillas, etc. ya
// existian; el resto se agrega via scripts/backfill-categoria-tipo.js).
const TARGET_LABELS = {
  abs: 'Abdominales',
  quads: 'Cuadriceps',
  lats: 'Dorsales',
  calves: 'Pantorrillas',
  pectorals: 'Pectorales',
  glutes: 'Gluteos',
  hamstrings: 'Femorales',
  adductors: 'Aductores',
  triceps: 'Triceps',
  'cardiovascular system': 'Cardio',
  spine: 'Espalda Baja',
  'upper back': 'Espalda Alta',
  biceps: 'Biceps',
  delts: 'Deltoides',
  forearms: 'Antebrazos',
  traps: 'Trapecios',
  'serratus anterior': 'Serrato Anterior',
  abductors: 'Abductores',
  'levator scapulae': 'Elevador De La Escapula',
};

function resolveMuscleIds(exercise) {
  const terms = [
    exercise.target,
    exercise.muscle_group,
    ...(Array.isArray(exercise.secondary_muscles) ? exercise.secondary_muscles : []),
  ].filter(Boolean);

  const ids = new Set();
  terms.forEach((term) => {
    const mapped = MUSCLE_TO_SELECTOR_IDS[term.toLowerCase()];
    if (mapped) {
      mapped.forEach((id) => ids.add(id));
    }
  });

  return Array.from(ids);
}

function resolveBodyPartLabel(bodyPart) {
  return BODY_PART_LABELS[(bodyPart || '').toLowerCase()] || bodyPart;
}

function resolveTargetLabel(target) {
  return TARGET_LABELS[(target || '').toLowerCase()] || target;
}

// --- Traduccion (parcial, a proposito) de nombres de ejercicio EN -> ES ---
//
// El dataset trae los 1324 nombres solo en ingles. Una traduccion 1:1
// palabra-por-palabra queda gramaticalmente rara ("Barbell Bench Press" ->
// "Barra Banco Press"), asi que esto hace dos pasadas:
//
// 1. PHRASE_MAP: reemplaza frases de movimiento conocidas (2-4 palabras) por
//    su nombre real en espanol de gimnasio ("bench press" -> "Press De
//    Banca"), probadas de la mas larga a la mas corta para no partir una
//    frase larga por una corta que este contenida en ella.
// 2. WORD_MAP: traduce las palabras sueltas que quedan (equipo, posicion,
//    partes del cuerpo, conectores). Lo que no esta en el diccionario queda
//    TAL CUAL en ingles -- es la parte de "solo lo que se pueda": mejor un
//    nombre mixto legible que una traduccion forzada que suene peor.
//
// Al final, si la PRIMERA palabra original era un equipo (mancuernas, barra,
// polea, etc.), se mueve al final como "Con/En <Equipo>" porque en espanol
// el equipo casi siempre va despues del movimiento ("Press De Banca Con
// Barra", no "Barra Press De Banca").
const PHRASE_MAP = [
  ['bench press', 'press de banca'],
  ['chest press', 'press de pecho'],
  ['shoulder press', 'press de hombro'],
  ['overhead press', 'press por encima de la cabeza'],
  ['military press', 'press militar'],
  ['leg press', 'prensa de pierna'],
  ['leg curl', 'curl de pierna'],
  ['leg extension', 'extension de pierna'],
  ['leg raise', 'elevacion de pierna'],
  ['calf press', 'prensa de pantorrilla'],
  ['calf raise', 'elevacion de pantorrilla'],
  ['lateral raise', 'elevacion lateral'],
  ['front raise', 'elevacion frontal'],
  ['rear delt raise', 'elevacion posterior de hombro'],
  ['rear raise', 'elevacion posterior'],
  ['bicep curl', 'curl de biceps'],
  ['biceps curl', 'curl de biceps'],
  ['hammer curl', 'curl martillo'],
  ['preacher curl', 'curl predicador'],
  ['concentration curl', 'curl concentrado'],
  ['wrist curl', 'curl de muneca'],
  ['zottman curl', 'curl zottman'],
  ['spider curl', 'curl araña'],
  ['triceps extension', 'extension de triceps'],
  ['tricep extension', 'extension de triceps'],
  ['triceps pushdown', 'jalon de triceps'],
  ['tricep pushdown', 'jalon de triceps'],
  ['triceps kickback', 'patada de triceps'],
  ['tricep kickback', 'patada de triceps'],
  ['skull crusher', 'press frances'],
  ['lat pulldown', 'jalon al pecho'],
  ['pulldown', 'jalon'],
  ['seated row', 'remo sentado'],
  ['bent over row', 'remo inclinado'],
  ['upright row', 'remo al menton'],
  ['face pull', 'jalon facial'],
  ['push up', 'flexion de brazos'],
  ['push-up', 'flexion de brazos'],
  ['pull up', 'dominada'],
  ['pull-up', 'dominada'],
  ['chin up', 'dominada supina'],
  ['chin-up', 'dominada supina'],
  ['sit up', 'abdominal'],
  ['sit-up', 'abdominal'],
  ['v up', 'abdominal en v'],
  ['v-up', 'abdominal en v'],
  ['hip thrust', 'empuje de cadera'],
  ['glute bridge', 'puente de gluteos'],
  ['russian twist', 'giro ruso'],
  ['mountain climber', 'escalador'],
  ['jumping jack', 'salto de tijera'],
  ['good morning', 'buenos dias'],
  ['romanian deadlift', 'peso muerto rumano'],
  ['stiff leg deadlift', 'peso muerto piernas rigidas'],
  ['sumo deadlift', 'peso muerto sumo'],
  ['deadlift', 'peso muerto'],
  ['goblet squat', 'sentadilla goblet'],
  ['front squat', 'sentadilla frontal'],
  ['back squat', 'sentadilla trasera'],
  ['bulgarian split squat', 'sentadilla bulgara'],
  ['split squat', 'sentadilla dividida'],
  ['hack squat', 'sentadilla hack'],
  ['pistol squat', 'sentadilla pistol'],
  ['sissy squat', 'sentadilla sissy'],
  ['squat', 'sentadilla'],
  ['reverse fly', 'aperturas invertidas'],
  ['chest fly', 'aperturas de pecho'],
  ['fly', 'aperturas'],
  ['cable crossover', 'cruce de poleas'],
  ['crossover', 'cruce'],
  ['arnold press', 'press arnold'],
  ['farmers walk', 'caminata del granjero'],
  ["farmer's walk", 'caminata del granjero'],
  ['side plank', 'plancha lateral'],
  ['jump squat', 'sentadilla con salto'],
  ['jump rope', 'salto de cuerda'],
  ['jumping rope', 'salto de cuerda'],
  ['box jump', 'salto al cajon'],
  ['calf stretch', 'estiramiento de pantorrilla'],
  ['shoulder shrug', 'encogimiento de hombros'],
  ['shrug', 'encogimiento de hombros'],
  ['cross trainer', 'eliptica'],
];

const WORD_MAP = {
  // equipo / herramientas
  dumbbell: 'mancuerna',
  dumbbells: 'mancuernas',
  barbell: 'barra',
  cable: 'polea',
  band: 'banda',
  bands: 'bandas',
  'resistance band': 'banda de resistencia',
  kettlebell: 'pesa rusa',
  machine: 'maquina',
  smith: 'smith',
  ez: 'ez',
  rope: 'cuerda',
  sled: 'trineo',
  roller: 'rueda',
  wheel: 'rueda',
  medicine: 'medicinal',
  stability: 'de estabilidad',
  bosu: 'bosu',
  weighted: 'con peso',
  assisted: 'asistido',
  bodyweight: 'peso corporal',
  body: 'cuerpo',
  weight: 'peso',
  leverage: 'palanca',
  olympic: 'olimpica',
  trap: 'trap',
  lever: 'palanca',
  hammer: 'martillo',
  // posicion / orientacion
  seated: 'sentado',
  standing: 'de pie',
  lying: 'acostado',
  kneeling: 'arrodillado',
  prone: 'boca abajo',
  supine: 'boca arriba',
  incline: 'inclinado',
  decline: 'declinado',
  close: 'cerrado',
  wide: 'abierto',
  narrow: 'estrecho',
  grip: 'agarre',
  reverse: 'inverso',
  single: 'individual',
  alternate: 'alternado',
  alternating: 'alternado',
  behind: 'detras de',
  overhead: 'por encima de la cabeza',
  front: 'frontal',
  rear: 'posterior',
  high: 'alto',
  low: 'bajo',
  hanging: 'colgante',
  cross: 'cruzado',
  bent: 'inclinado',
  upright: 'vertical',
  straight: 'recto',
  floor: 'en el suelo',
  wall: 'en la pared',
  flat: 'plano',
  neutral: 'neutro',
  underhand: 'agarre supino',
  palm: 'palma',
  parallel: 'paralelo',
  vertical: 'vertical',
  horizontal: 'horizontal',
  external: 'externo',
  internal: 'interno',
  isometric: 'isometrico',
  modified: 'modificado',
  fixed: 'fijo',
  extended: 'extendido',
  raised: 'elevado',
  stance: 'postura',
  half: 'medio',
  full: 'completo',
  two: 'dos',
  one: 'un',
  double: 'doble',
  // partes del cuerpo
  chest: 'pecho',
  back: 'espalda',
  shoulder: 'hombro',
  shoulders: 'hombros',
  leg: 'pierna',
  legs: 'piernas',
  arm: 'brazo',
  arms: 'brazos',
  calf: 'pantorrilla',
  calves: 'pantorrillas',
  bicep: 'biceps',
  biceps: 'biceps',
  tricep: 'triceps',
  triceps: 'triceps',
  glute: 'gluteo',
  hip: 'cadera',
  hips: 'caderas',
  wrist: 'muneca',
  knee: 'rodilla',
  knees: 'rodillas',
  neck: 'cuello',
  lat: 'dorsal',
  delt: 'deltoides',
  hamstring: 'femoral',
  quad: 'cuadriceps',
  quads: 'cuadriceps',
  ab: 'abdominal',
  abs: 'abdominales',
  oblique: 'obliquo',
  forearm: 'antebrazo',
  scapula: 'escapula',
  spine: 'columna',
  groin: 'ingle',
  toe: 'dedo del pie',
  hand: 'mano',
  hands: 'manos',
  elbow: 'codo',
  finger: 'dedo',
  // movimiento generico
  curl: 'curl',
  press: 'press',
  row: 'remo',
  raise: 'elevacion',
  extension: 'extension',
  crunch: 'crunch',
  twist: 'giro',
  stretch: 'estiramiento',
  plank: 'plancha',
  bridge: 'puente',
  kickback: 'patada',
  jump: 'salto',
  lunge: 'zancada',
  dip: 'fondo',
  dips: 'fondos',
  pullover: 'pullover',
  burpee: 'burpee',
  thruster: 'thruster',
  swing: 'swing',
  snatch: 'arrancada',
  clean: 'cargada',
  jerk: 'envion',
  march: 'marcha',
  climber: 'escalador',
  crawl: 'reptado',
  circles: 'circulos',
  circular: 'circular',
  rotation: 'rotacion',
  adduction: 'aduccion',
  abduction: 'abduccion',
  flexion: 'flexion',
  extended2: 'extendido',
  tap: 'toque',
  touch: 'toque',
  kick: 'patada',
  kicks: 'patadas',
  walk: 'caminata',
  walking: 'caminata',
  hang: 'colgado',
  pushdown: 'jalon',
  pulley: 'polea',
  squeeze: 'apreton',
  tuck: 'encogido',
  pike: 'pike',
  frog: 'rana',
  windmill: 'molino',
  archer: 'arquero',
  superman: 'superman',
  ball: 'balon',
  exercise: 'ejercicio',
  bench: 'banco',
  side: 'lateral',
  push: 'empuje',
  pull: 'jalon',
  step: 'paso',
  forward: 'adelante',
  lower: 'inferior',
  lift: 'levantamiento',
  throw: 'lanzamiento',
  run: 'carrera',
  resistance: 'resistencia',
  inner: 'interno',
  outer: 'externo',
  head: 'cabeza',
  bend: 'flexion',
  attachment: 'accesorio',
  male: 'hombre',
  female: 'mujer',
  twisting: 'de giro',
  towel: 'toalla',
  support: 'apoyo',
  inverted: 'invertido',
  chair: 'silla',
  trainer: 'entrenador',
  // conectores
  with: 'con',
  to: 'a',
  on: 'en',
  and: 'y',
  the: '',
  in: 'en',
  from: 'desde',
  of: 'de',
  over: 'sobre',
  against: 'contra',
  between: 'entre',
  around: 'alrededor de',
  down: 'abajo',
  up: 'arriba',
  through: 'a traves de',
  off: 'fuera',
};

const EQUIPMENT_LEADING_WORDS = new Set([
  'dumbbell', 'dumbbells', 'barbell', 'cable', 'band', 'bands', 'kettlebell',
  'machine', 'smith', 'ez', 'rope', 'sled', 'roller', 'wheel', 'bosu',
  'weighted', 'assisted', 'bodyweight', 'leverage', 'olympic', 'trap',
  'lever', 'hammer', 'medicine', 'stability',
]);

const EQUIPMENT_USES_EN = new Set(['maquina', 'smith', 'polea']);

function titleCase(text) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function applyPhraseMap(lowerName) {
  let result = lowerName;
  PHRASE_MAP.forEach(([en, es]) => {
    const pattern = new RegExp(`\\b${en.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
    result = result.replace(pattern, es);
  });
  return result;
}

function translateExerciseName(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return originalName;
  }

  const lower = originalName
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9/ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const firstWord = lower.split(' ')[0];
  const isLeadingEquipment = EQUIPMENT_LEADING_WORDS.has(firstWord);

  const afterPhrases = applyPhraseMap(isLeadingEquipment ? lower.slice(firstWord.length).trim() : lower);

  const translatedWords = afterPhrases
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (Object.prototype.hasOwnProperty.call(WORD_MAP, word) ? WORD_MAP[word] : word))
    .filter((word) => word !== '');

  let finalWords = translatedWords;
  if (isLeadingEquipment) {
    const equipmentEs = WORD_MAP[firstWord] || firstWord;
    const alreadyHasPreposition = /^(con|en) /.test(equipmentEs);
    const preposition = EQUIPMENT_USES_EN.has(equipmentEs) ? 'en' : 'con';
    finalWords = alreadyHasPreposition
      ? [...translatedWords, equipmentEs]
      : [...translatedWords, preposition, equipmentEs];
  }

  return titleCase(finalWords.join(' '));
}

module.exports = {
  MUSCLE_TO_SELECTOR_IDS,
  BODY_PART_LABELS,
  TARGET_LABELS,
  resolveMuscleIds,
  resolveBodyPartLabel,
  resolveTargetLabel,
  translateExerciseName,
};
