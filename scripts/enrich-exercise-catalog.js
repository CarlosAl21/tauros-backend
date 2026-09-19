'use strict';

// Re-calcula los campos derivados (nombre en espanol, tipo, categoria) del
// catalogo YA migrado a Cloudinary, sin tocar Cloudinary para nada -- solo
// lee exercises-dataset y reescribe exerciseCatalog.json. Se corre cada vez
// que se ajusta el diccionario de traduccion o el mapeo de tipo/categoria en
// exercise-catalog-mapping.js.
//
// Uso: node scripts/enrich-exercise-catalog.js

const fs = require('fs');
const path = require('path');
const {
  resolveMuscleIds, resolveBodyPartLabel, resolveTargetLabel, translateExerciseName,
} = require('./exercise-catalog-mapping');

const DATASET_ROOT = path.resolve(__dirname, '../../exercises-dataset');
const DATASET_JSON = path.join(DATASET_ROOT, 'data/exercises.json');
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../../tauros-front-web/src/features/tauros/data/exerciseCatalog.json',
);

function main() {
  const allExercises = JSON.parse(fs.readFileSync(DATASET_JSON, 'utf8'));
  const byId = new Map(allExercises.map((exercise) => [exercise.id, exercise]));
  const existingCatalog = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

  const enriched = existingCatalog.map((item) => {
    const source = byId.get(item.id);
    if (!source) {
      return item;
    }

    return {
      id: item.id,
      name: source.name,
      nameEs: translateExerciseName(source.name),
      bodyPart: source.body_part,
      tipoLabel: resolveBodyPartLabel(source.body_part),
      target: source.target,
      categoriaLabel: resolveTargetLabel(source.target),
      equipment: source.equipment,
      muscleIds: resolveMuscleIds(source),
      videoUrl: item.videoUrl,
    };
  });

  const sorted = enriched.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  console.log(`Listo. Catalogo actualizado: ${sorted.length} ejercicios -> ${OUTPUT_PATH}`);
}

main();
