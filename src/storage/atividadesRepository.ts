import db from './database';
import { Atividade } from '../models';

export const atividadesRepository = {
  getBySemestre(semestreId: string): Atividade[] {
    const rows = db.getAllSync<any>(
      `SELECT a.*
       FROM atividades a
       INNER JOIN materias m ON m.id = a.materiaId
       WHERE m.semestreId = ?
       ORDER BY
         CASE a.status WHEN 'pendente' THEN 0 ELSE 1 END,
         a.dataEntrega,
         a.titulo`,
      [semestreId]
    );
    return rows.map(deserialize);
  },

  getByMateria(materiaId: string): Atividade[] {
    const rows = db.getAllSync<any>(
      'SELECT * FROM atividades WHERE materiaId = ? ORDER BY dataEntrega',
      [materiaId]
    );
    return rows.map(deserialize);
  },

  getPendentes(): Atividade[] {
    const rows = db.getAllSync<any>(
      "SELECT * FROM atividades WHERE status = 'pendente' ORDER BY dataEntrega"
    );
    return rows.map(deserialize);
  },

  insert(a: Atividade): void {
    db.runSync(
      `INSERT INTO atividades
        (id, materiaId, titulo, dataEntrega, recorrente, regraRecorrencia, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        a.id, a.materiaId, a.titulo, a.dataEntrega,
        a.recorrente ? 1 : 0,
        a.regraRecorrencia ? JSON.stringify(a.regraRecorrencia) : null,
        a.status,
      ]
    );
  },

  updateStatus(id: string, status: Atividade['status']): void {
    db.runSync('UPDATE atividades SET status = ? WHERE id = ?', [status, id]);
  },

  update(a: Atividade): void {
    db.runSync(
      `UPDATE atividades SET
        titulo = ?, dataEntrega = ?, recorrente = ?,
        regraRecorrencia = ?, status = ?
       WHERE id = ?`,
      [
        a.titulo, a.dataEntrega, a.recorrente ? 1 : 0,
        a.regraRecorrencia ? JSON.stringify(a.regraRecorrencia) : null,
        a.status, a.id,
      ]
    );
  },

  delete(id: string): void {
    db.runSync('DELETE FROM atividades WHERE id = ?', [id]);
  },
};

function deserialize(row: any): Atividade {
  return {
    ...row,
    recorrente: row.recorrente === 1,
    regraRecorrencia: row.regraRecorrencia
      ? JSON.parse(row.regraRecorrencia)
      : undefined,
  };
}
