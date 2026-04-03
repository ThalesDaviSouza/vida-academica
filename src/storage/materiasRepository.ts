import db from './database';
import { Materia } from '../models';

export const materiasRepository = {
  getBySemestre(semestreId: string): Materia[] {
    const rows = db.getAllSync<any>(
      'SELECT * FROM materias WHERE semestreId = ? ORDER BY nome',
      [semestreId]
    );
    return rows.map(deserialize);
  },

  getById(id: string): Materia | null {
    const row = db.getFirstSync<any>('SELECT * FROM materias WHERE id = ?', [id]);
    return row ? deserialize(row) : null;
  },

  insert(m: Materia): void {
    db.runSync(
      `INSERT INTO materias
        (id, nome, cor, professor, diasSemana, horario, dataFim, semestreId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id, m.nome, m.cor, m.professor ?? null,
        JSON.stringify(m.diasSemana), m.horario,
        m.dataFim, m.semestreId,
      ]
    );
  },

  update(m: Materia): void {
    db.runSync(
      `UPDATE materias SET
        nome = ?, cor = ?, professor = ?, diasSemana = ?,
        horario = ?, dataFim = ?
      WHERE id = ?`,
      [
        m.nome, m.cor, m.professor ?? null,
        JSON.stringify(m.diasSemana), m.horario,
        m.dataFim, m.id,
      ]
    );
  },

  delete(id: string): void {
    db.runSync('DELETE FROM materias WHERE id = ?', [id]);
  },
};

function deserialize(row: any): Materia {
  return { ...row, diasSemana: JSON.parse(row.diasSemana) };
}