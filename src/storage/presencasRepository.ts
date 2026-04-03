import db from './database';
import { Presenca } from '../models';

export const presencasRepository = {
  getByMateria(materiaId: string): Presenca[] {
    return db.getAllSync<Presenca>(
      'SELECT * FROM presencas WHERE materiaId = ? ORDER BY data',
      [materiaId]
    );
  },

  getByMateriaEData(materiaId: string, data: string): Presenca | null {
    return db.getFirstSync<Presenca>(
      'SELECT * FROM presencas WHERE materiaId = ? AND data = ?',
      [materiaId, data]
    );
  },

  insert(p: Presenca): void {
    db.runSync(
      'INSERT INTO presencas (id, materiaId, data, status) VALUES (?, ?, ?, ?)',
      [p.id, p.materiaId, p.data, p.status]
    );
  },

  updateStatus(id: string, status: Presenca['status']): void {
    db.runSync('UPDATE presencas SET status = ? WHERE id = ?', [status, id]);
  },

  delete(id: string): void {
    db.runSync('DELETE FROM presencas WHERE id = ?', [id]);
  },
};