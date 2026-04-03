import * as Crypto from 'expo-crypto';
import db from './database';

export type NotificacaoTipo =
  | 'atividade_prazo'
  | 'prova_data'
  | 'frequencia_risco';

export interface NotificacaoRow {
  id: string;
  tipo: NotificacaoTipo;
  refId: string;
  expoId: string;
  fireAt: string; // ISO string
  createdAt: string; // SQLite datetime
}

export const notificacoesRepository = {
  getByTipoRef(tipo: NotificacaoTipo, refId: string): NotificacaoRow[] {
    return db.getAllSync<NotificacaoRow>(
      'SELECT * FROM notificacoes WHERE tipo = ? AND refId = ? ORDER BY createdAt DESC',
      [tipo, refId]
    );
  },

  getLatestByTipoRef(tipo: NotificacaoTipo, refId: string): NotificacaoRow | null {
    const row = db.getFirstSync<NotificacaoRow>(
      'SELECT * FROM notificacoes WHERE tipo = ? AND refId = ? ORDER BY createdAt DESC LIMIT 1',
      [tipo, refId]
    );
    return row ?? null;
  },

  insert(tipo: NotificacaoTipo, refId: string, expoId: string, fireAt: string): void {
    db.runSync(
      'INSERT INTO notificacoes (id, tipo, refId, expoId, fireAt) VALUES (?, ?, ?, ?, ?)',
      [Crypto.randomUUID(), tipo, refId, expoId, fireAt]
    );
  },

  deleteByTipoRef(tipo: NotificacaoTipo, refId: string): void {
    db.runSync('DELETE FROM notificacoes WHERE tipo = ? AND refId = ?', [tipo, refId]);
  },

  deleteByExpoId(expoId: string): void {
    db.runSync('DELETE FROM notificacoes WHERE expoId = ?', [expoId]);
  },
};
