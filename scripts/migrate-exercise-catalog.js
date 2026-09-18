'use strict';

/**
 * Migracion unica: sube los GIFs del dataset de ejercicios a Cloudinary y
 * genera un catalogo liviano que el front-web bundlea para el selector
 * "Elegir del catalogo". Cada ejercicio hace dos subidas (ver uploadOne):
 * 1) el GIF como resource_type "image" (subirlo directo como "video" es
 *    rechazado por esta cuenta con "Unsupported file type gif"),
 * 2) su conversion a .mp4 -- descargada por HTTPS normal y re-subida como
 *    bytes -- como resource_type "video" de verdad bajo /video/upload/, para
 *    que el resto de la app (ExerciseVideoThumbnail, normalizeVideoUrl) la
 *    trate igual que un video subido a mano.
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
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { resolveMuscleIds, resolveBodyPartLabel } = require('./exercise-catalog-mapping');

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

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error || new Error('Cloudinary no devolvio resultado'));
        return;
      }
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo descargar ${url}: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadOne(exercise) {
  const videoPath = path.join(DATASET_ROOT, exercise.gif_url);
  const gifPublicId = `tauros/catalogo/gifs/ex-${exercise.id}`;
  const videoPublicId = `${CLOUDINARY_FOLDER}/ex-${exercise.id}`;

  // Paso 1: el GIF se sube como "image" (su tipo real en Cloudinary; subirlo
  // directo como resource_type "video" es rechazado por esta cuenta con
  // "Unsupported file type gif"). Pedirle a Cloudinary que lo entregue como
  // .mp4 SI funciona, pero unicamente por la ruta /image/upload/ -- probado
  // a mano: /video/upload/ para este mismo asset devuelve 404.
  await cloudinary.uploader.upload(videoPath, {
    resource_type: 'image',
    public_id: gifPublicId,
    overwrite: false,
  });

  const derivedMp4Url = cloudinary.url(gifPublicId, { format: 'mp4', secure: true });

  // Paso 2: bajamos ese .mp4 nosotros mismos (HTTPS normal, sin pasar por la
  // funcion de "fetch remoto" de Cloudinary -- esta cuenta la deshabilito a
  // mitad de la primera corrida con "action is disabled") y lo re-subimos
  // como bytes, como un asset resource_type "video" de verdad bajo
  // /video/upload/. Mismo path que los videos subidos a mano (ver
  // useTaurosApp.js), asi que ExerciseVideoThumbnail, normalizeVideoUrl, etc.
  // funcionan igual sin ningun caso especial.
  const mp4Buffer = await fetchBuffer(derivedMp4Url);
  const videoResult = await uploadBuffer(mp4Buffer, {
    resource_type: 'video',
    public_id: videoPublicId,
    overwrite: false,
  });

  const result = { secure_url: videoResult.secure_url };

  return {
    id: exercise.id,
    name: exercise.name,
    bodyPart: exercise.body_part,
    bodyPartLabel: resolveBodyPartLabel(exercise.body_part),
    target: exercise.target,
    equipment: exercise.equipment,
    muscleIds: resolveMuscleIds(exercise),
    videoUrl: result.secure_url,
  };
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
