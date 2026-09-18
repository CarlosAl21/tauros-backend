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

// body_part es el campo con enum fijo (10 valores) del dataset; category lo
// espeja. Se traduce a las mismas etiquetas en espanol que ya usa la app
// movil para "categoria" (ver Tauros-Movil/lib/tauros-data.ts: "Pierna",
// "Pecho", "Espalda"), para que el auto-match contra las Categorias
// existentes en el panel tenga chance real de encontrar coincidencia.
const BODY_PART_LABELS = {
  back: 'Espalda',
  cardio: 'Cardio',
  chest: 'Pecho',
  'lower arms': 'Antebrazo',
  'lower legs': 'Pantorrilla',
  neck: 'Cuello',
  shoulders: 'Hombro',
  'upper arms': 'Brazo',
  'upper legs': 'Pierna',
  waist: 'Abdomen',
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

module.exports = { MUSCLE_TO_SELECTOR_IDS, BODY_PART_LABELS, resolveMuscleIds, resolveBodyPartLabel };
