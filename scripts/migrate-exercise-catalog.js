'use strict';

/**
 * Migracion unica: sube los GIFs del dataset de ejercicios a Cloudinary y
 * genera un catalogo liviano que el front-web bundlea para el selector
 * "Elegir del catalogo".
 *
 * Un GIF es, para Cloudinary, un tipo de imagen -- no lo acepta como
 * resource_type "video" directo ("Unsupported file type gif"). En vez de
 * pedirle a Cloudinary que lo suba como imagen y despues re-subir su
 * conversion a .mp4 (dos llamadas por ejercicio, doble superficie para
 * problemas de cuenta), la conversion se hace ACA con ffmpeg y se sube una
 * sola vez como resource_type "video" real bajo /video/upload/ -- el mismo
 * path que usan los videos subidos a mano (ver useTaurosApp.js), asi que
 * ExerciseVideoThumbnail/normalizeVideoUrl funcionan sin ningun caso
 * especial. Requiere ffmpeg instalado (`ffmpeg -version`).
 *
 * No se ejecuta como parte de la app: se corre una sola vez a mano.
 *
 * Uso:
 *   node --env-file=.env scripts/migrate-exercise-catalog.js --test=3
 *   node --env-file=.env scripts/migrate-exercise-catalog.js
 *
 * Es resumible: si se corta a mitad de camino, relanzarlo saltea los
 * ejercicios que ya estan en el catalogo de salida.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { v2: cloudinary } = require('cloudinary');
const {
  resolveMuscleIds, resolveBodyPartLabel, resolveTargetLabel, translateExerciseName,
} = require('./exercise-catalog-mapping');

const DATASET_ROOT = path.resolve(__dirname, '../../exercises-dataset');
const DATASET_JSON = path.join(DATASET_ROOT, 'data/exercises.json');
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../../tauros-front-web/src/features/tauros/data/exerciseCatalog.json',
);
const CLOUDINARY_FOLDER = 'tauros/catalogo/videos';
const CONCURRENCY = 6;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta ${name}. Corre el script con: node --env-file=.env scripts/migrate-exercise-catalog.js`,
    );
  }
  return value;
}

function parseArgs() {
  const testArg = process.argv.find((arg) => arg.startsWith('--test='));
  const testLimit = testArg ? Number(testArg.split('=')[1]) : null;
  return { testLimit: Number.isFinite(testLimit) ? testLimit : null };
}

function loadExistingCatalog() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveCatalog(catalog) {
  const sorted = [...catalog].sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
}

function convertGifToMp4(gifPath, mp4Path) {
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', [
      '-y',
      '-i', gifPath,
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      mp4Path,
    ], (error) => {
      if (error) {
        reject(new Error(`ffmpeg fallo: ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

async function uploadOne(exercise) {
  const gifPath = path.join(DATASET_ROOT, exercise.gif_url);
  const videoPublicId = `${CLOUDINARY_FOLDER}/ex-${exercise.id}`;
  const tmpMp4Path = path.join(os.tmpdir(), `tauros-catalogo-ex-${exercise.id}.mp4`);

  try {
    await convertGifToMp4(gifPath, tmpMp4Path);

    const videoResult = await cloudinary.uploader.upload(tmpMp4Path, {
      resource_type: 'video',
      public_id: videoPublicId,
      overwrite: false,
    });

    return {
      id: exercise.id,
      name: exercise.name,
      nameEs: translateExerciseName(exercise.name),
      bodyPart: exercise.body_part,
      tipoLabel: resolveBodyPartLabel(exercise.body_part),
      target: exercise.target,
      categoriaLabel: resolveTargetLabel(exercise.target),
      equipment: exercise.equipment,
      muscleIds: resolveMuscleIds(exercise),
      videoUrl: videoResult.secure_url,
    };
  } finally {
    fs.rm(tmpMp4Path, { force: true }, () => {});
  }
}

async function processInBatches(items, catalogById) {
  let processed = 0;
  let failed = 0;

  for (let start = 0; start < items.length; start += CONCURRENCY) {
    const batch = items.slice(start, start + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(uploadOne));

    results.forEach((result, index) => {
      const exercise = batch[index];
      if (result.status === 'fulfilled') {
        catalogById.set(result.value.id, result.value);
        processed += 1;
      } else {
        failed += 1;
        console.error(`  x ${exercise.id} ${exercise.name}: ${result.reason?.message || result.reason}`);
      }
    });

    saveCatalog(Array.from(catalogById.values()));
    console.log(`  progreso: ${Math.min(start + CONCURRENCY, items.length)}/${items.length} (fallidos: ${failed})`);
  }

  return { processed, failed };
}

async function main() {
  cloudinary.config({
    cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: requireEnv('CLOUDINARY_API_KEY'),
    api_secret: requireEnv('CLOUDINARY_API_SECRET'),
  });

  const { testLimit } = parseArgs();
  const allExercises = JSON.parse(fs.readFileSync(DATASET_JSON, 'utf8'));
  const existingCatalog = loadExistingCatalog();
  const catalogById = new Map(existingCatalog.map((item) => [item.id, item]));

  let pending = allExercises.filter((exercise) => !catalogById.has(exercise.id));
  if (testLimit) {
    pending = pending.slice(0, testLimit);
    console.log(`Modo prueba: subiendo solo ${pending.length} ejercicios.`);
  }

  console.log(`Total dataset: ${allExercises.length} | ya migrados: ${catalogById.size} | pendientes: ${pending.length}`);

  if (!pending.length) {
    console.log('Nada para subir.');
    return;
  }

  const { processed, failed } = await processInBatches(pending, catalogById);

  console.log(`\nListo. Subidos en esta corrida: ${processed}. Fallidos: ${failed}.`);
  console.log(`Catalogo total: ${catalogById.size}/${allExercises.length} -> ${OUTPUT_PATH}`);
  if (failed) {
    console.log('Volve a correr el mismo comando para reintentar solo los que fallaron.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
