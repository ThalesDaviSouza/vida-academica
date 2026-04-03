import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vida_academica.db');

export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS semestres (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      dataInicio TEXT NOT NULL,
      dataFim TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS materias (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      cor TEXT NOT NULL,
      professor TEXT,
      diasSemana TEXT NOT NULL,
      horario TEXT NOT NULL,
      dataFim TEXT NOT NULL,
      semestreId TEXT NOT NULL,
      FOREIGN KEY (semestreId) REFERENCES semestres(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS presencas (
      id TEXT PRIMARY KEY NOT NULL,
      materiaId TEXT NOT NULL,
      data TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('presente','falta','auto_presente','cancelada')),
      FOREIGN KEY (materiaId) REFERENCES materias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS provas (
      id TEXT PRIMARY KEY NOT NULL,
      materiaId TEXT NOT NULL,
      data TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('prova','trabalho','seminario')),
      peso REAL,
      FOREIGN KEY (materiaId) REFERENCES materias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS atividades (
      id TEXT PRIMARY KEY NOT NULL,
      materiaId TEXT NOT NULL,
      titulo TEXT NOT NULL,
      dataEntrega TEXT NOT NULL,
      recorrente INTEGER NOT NULL DEFAULT 0,
      regraRecorrencia TEXT,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','concluido')),
      FOREIGN KEY (materiaId) REFERENCES materias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notificacoes (
      id TEXT PRIMARY KEY NOT NULL,
      tipo TEXT NOT NULL,
      refId TEXT NOT NULL,
      expoId TEXT NOT NULL,
      fireAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo_refId ON notificacoes (tipo, refId);
  `);
}

export default db;
