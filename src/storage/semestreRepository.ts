import db from './database';
import { Semestre } from '../models';

export const semestresRepository = {
  getAll(): Semestre[] {
    const rows = db.getAllSync<any>('SELECT * FROM semestres ORDER BY dataInicio DESC');
    return rows.map(deserialize);
  },

  getAtivo(): Semestre | null {
    const row = db.getFirstSync<any>('SELECT * FROM semestres WHERE ativo = 1 LIMIT 1');
    return row ? deserialize(row) : null;
  },

  getById(id: string): Semestre | null {
    const row = db.getFirstSync<any>('SELECT * FROM semestres WHERE id = ?', [id]);
    return row ? deserialize(row) : null;
  },

  insert(s: Semestre): void {
    db.runSync(
      'INSERT INTO semestres (id, nome, dataInicio, dataFim, ativo) VALUES (?, ?, ?, ?, ?)',
      [s.id, s.nome, s.dataInicio, s.dataFim, s.ativo ? 1 : 0]
    );
  },

  update(s: Semestre): void {
    db.runSync(
      'UPDATE semestres SET nome = ?, dataInicio = ?, dataFim = ?, ativo = ? WHERE id = ?',
      [s.nome, s.dataInicio, s.dataFim, s.ativo ? 1 : 0, s.id]
    );
  },

  setAtivo(id: string): void {
    db.execSync('UPDATE semestres SET ativo = 0');
    db.runSync('UPDATE semestres SET ativo = 1 WHERE id = ?', [id]);
  },

  delete(id: string): void {
    db.runSync('DELETE FROM semestres WHERE id = ?', [id]);
  },
};

function deserialize(row: any): Semestre {
  return { ...row, ativo: row.ativo === 1 };
}