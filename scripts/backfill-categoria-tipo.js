'use strict';

// Inserta en Categoria y Tipo los valores que hacen falta para que el
// catalogo de ejercicios (ver exercise-catalog-mapping.js: TARGET_LABELS ->
// Categoria, BODY_PART_LABELS -> Tipo) pueda auto-matchear siempre. Solo
// INSERTA lo que falta (comparacion case-insensitive por nombre) -- nunca
// borra ni edita filas existentes.
//
// Uso: TAUROS_DB_URL=postgresql://... node scripts/backfill-categoria-tipo.js [--dry-run]

const { Client } = require('pg');
const crypto = require('crypto');
const { TARGET_LABELS, BODY_PART_LABELS } = require('./exercise-catalog-mapping');

const dryRun = process.argv.includes('--dry-run');

async function backfillTable(client, table, idColumn, desiredNames) {
  const { rows } = await client.query(`SELECT "${idColumn}", nombre FROM "${table}"`);
  const existingLower = new Set(rows.map((row) => row.nombre.trim().toLowerCase()));

  const missing = [...new Set(desiredNames)].filter(
    (name) => !existingLower.has(name.trim().toLowerCase()),
  );

  console.log(`\n=== ${table} ===`);
  console.log(`Existentes: ${rows.length} | Deseados: ${new Set(desiredNames).size} | Faltan: ${missing.length}`);
  missing.forEach((name) => console.log(`  + ${name}`));

  if (dryRun || !missing.length) {
    return missing.length;
  }

  for (const name of missing) {
    const id = crypto.randomUUID();
    // eslint-disable-next-line no-await-in-loop
    await client.query(`INSERT INTO "${table}" ("${idColumn}", nombre) VALUES ($1, $2)`, [id, name]);
  }

  return missing.length;
}

async function main() {
  const connectionString = process.env.TAUROS_DB_URL;
  if (!connectionString) {
    throw new Error('Falta TAUROS_DB_URL');
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('SET search_path TO "taurosBD", public');

  try {
    const categoriaAdded = await backfillTable(
      client,
      'categoria',
      'categoriaId',
      Object.values(TARGET_LABELS),
    );
    const tipoAdded = await backfillTable(
      client,
      'tipo',
      'tipoId',
      Object.values(BODY_PART_LABELS),
    );

    console.log(dryRun
      ? `\n(dry-run, no se escribio nada) Categoria: ${categoriaAdded} pendientes | Tipo: ${tipoAdded} pendientes`
      : `\nListo. Categoria: ${categoriaAdded} insertadas | Tipo: ${tipoAdded} insertadas`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
