import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { encryptText, getKeyFromEnv } from '../utils/crypto';

async function run() {
  console.log('Iniciando script de migración de cifrado...');

  // Ensure key present
  try { getKeyFromEnv(); } catch (e) { console.error(e.message); process.exit(1); }

  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  // Mapping: table name, primary key column, columns to encrypt
  // Add or edit mappings as needed.
  const mappings: Array<{ table: string; pk: string; columns: string[] }> = [
    { table: 'usuario', pk: 'userId', columns: ['nombre', 'apellido', 'correo', 'telefono', 'cedula'] },
  ];

  for (const map of mappings) {
    console.log(`Procesando tabla ${map.table} columnas: ${map.columns.join(', ')}`);

    // Ensure encrypted columns exist (column_encrypted)
    for (const col of map.columns) {
      const encCol = `${col}_encrypted`;
      try {
        // Postgres syntax
        await ds.query(`ALTER TABLE "${map.table}" ADD COLUMN IF NOT EXISTS "${encCol}" text`);
      } catch (e) {
        console.warn(`No se pudo crear columna ${encCol} automáticamente. Revisar manualmente. Error: ${e.message}`);
      }
    }

    // Fetch rows
    const colsSelect = [map.pk, ...map.columns].map(c => `"${c}"`).join(', ');
    const rows: any[] = await ds.query(`SELECT ${colsSelect} FROM "${map.table}"`);
    console.log(`Filas encontradas: ${rows.length}`);

    let updated = 0;
    for (const row of rows) {
      const pkVal = row[map.pk];
      const updates: Array<{ col: string; val: string }> = [];
      for (const col of map.columns) {
        const encCol = `${col}_encrypted`;
        const currentEnc = row[encCol];
        const plain = row[col];
        if ((currentEnc === null || currentEnc === undefined || currentEnc === '') && plain !== null && plain !== undefined && plain !== '') {
          try {
            const cipher = encryptText(String(plain));
            updates.push({ col: encCol, val: cipher });
          } catch (e) {
            console.error(`Error cifrando ${map.table}.${col} id=${pkVal}: ${e.message}`);
          }
        }
      }

      if (updates.length) {
        // Build update query
        const setParts: string[] = [];
        const params: any[] = [];
        let idx = 1;
        for (const u of updates) {
          setParts.push(`"${u.col}" = $${idx}`);
          params.push(u.val);
          idx++;
        }
        params.push(pkVal);
        const q = `UPDATE "${map.table}" SET ${setParts.join(', ')} WHERE "${map.pk}" = $${idx}`;
        try {
          await ds.query(q, params);
          updated++;
        } catch (e) {
          console.error(`Error actualizando fila id=${pkVal}: ${e.message}`);
        }
      }
    }

    console.log(`Tabla ${map.table}: filas actualizadas con cifrado: ${updated}`);
  }

  await app.close();
  console.log('Migración finalizada. Hacer backup y verificar integridad.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
