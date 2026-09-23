-- Creates "taurosBD".registro_carga exactly as TypeORM 0.3.28 would generate it
-- for src/registro-carga/entities/registro-carga.entity.ts, so synchronize()
-- sees zero diff. DDL and constraint/index names were produced from TypeORM's
-- own metadata + PostgresQueryRunner SQL builders (no DB connection).
--
-- search_path matters: uuid_generate_v4() lives in "taurosBD" (uuid-ossp), and
-- TypeORM only recognises the default as a generated uuid when it reads back
-- as the unqualified `uuid_generate_v4()` (the app connects with taurosBD on
-- its search_path, so this holds).
-- "unidad" default reads back as 'kg'::character varying; TypeORM strips the
-- cast and compares 'kg' = 'kg' (no diff).
BEGIN;

SET LOCAL search_path TO "taurosBD", public;

CREATE TABLE "taurosBD"."registro_carga" (
    "registroCargaId" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "cargaKg" numeric(6,2) NOT NULL,
    "unidad" character varying(2) NOT NULL DEFAULT 'kg',
    "fechaRegistro" TIMESTAMP NOT NULL DEFAULT now(),
    "usuarioId" uuid NOT NULL,
    "ejercicioId" uuid NOT NULL,
    "rutinaEjercicioId" uuid,
    CONSTRAINT "PK_c115d125e7d7eb3ee5a24d6ef52" PRIMARY KEY ("registroCargaId")
);

CREATE INDEX "IDX_413e6587d2e312e164f49f9990" ON "taurosBD"."registro_carga" ("usuarioId", "ejercicioId", "fechaRegistro");

ALTER TABLE "taurosBD"."registro_carga" ADD CONSTRAINT "FK_f4e63d171ea4d95f9c6619fc225" FOREIGN KEY ("usuarioId") REFERENCES "taurosBD"."usuario"("userId") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "taurosBD"."registro_carga" ADD CONSTRAINT "FK_8d2809f0fedccf39dd85bf1fa18" FOREIGN KEY ("ejercicioId") REFERENCES "taurosBD"."ejercicio"("ejercicioId") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "taurosBD"."registro_carga" ADD CONSTRAINT "FK_cf3719971dbefc8a7447139374c" FOREIGN KEY ("rutinaEjercicioId") REFERENCES "taurosBD"."rutina_ejercicio"("rutinaEjercicioId") ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;
