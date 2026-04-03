import db from './database';
import { Prova } from '../models';

export const provasRepository = {
  getByMateria(materiaId: string): Prova[] {
    return db.getAllSync<Prova>(
      'SELECT * FROM provas WHERE materiaId = ? ORDER BY data',
      [materiaId]
    );
  },

  getProximas(diasLimite: number = 7): Prova[] {
    const hoje = new Date().toISOString().split('T')[0];
    const limite = new Date(Date.now() + diasLimite * 86400000)
      .toISOString().split('T')[0];
    return db.getAllSync<Prova>(
      'SELECT * FROM provas WHERE data BETWEEN ? AND ? ORDER BY data',
      [hoje, limite]
    );
  },

  insert(p: Prova): void {
    db.runSync(
      'INSERT INTO provas (id, materiaId, data, tipo, peso) VALUES (?, ?, ?, ?, ?)',
      [p.id, p.materiaId, p.data, p.tipo, p.peso ?? null]
    );
  },

  update(p: Prova): void {
    db.runSync(
      'UPDATE provas SET data = ?, tipo = ?, peso = ? WHERE id = ?',
      [p.data, p.tipo, p.peso ?? null, p.id]
    );
  },

  delete(id: string): void {
    db.runSync('DELETE FROM provas WHERE id = ?', [id]);
  },
};