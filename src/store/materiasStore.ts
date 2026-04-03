import { create } from 'zustand';
import { Materia } from '../models';
import { materiasRepository } from '../storage/materiasRepository';
import * as Crypto from 'expo-crypto';

interface MateriasState {
  materias: Materia[];
  load: (semestreId: string) => void;
  criar: (dados: Omit<Materia, 'id'>) => void;
  editar: (materia: Materia) => void;
  deletar: (id: string) => void;
}

export const useMateriasStore = create<MateriasState>((set, get) => ({
  materias: [],

  load: (semestreId) => {
    const materias = materiasRepository.getBySemestre(semestreId);
    set({ materias });
  },

  criar: (dados) => {
    const nova: Materia = { id: Crypto.randomUUID(), ...dados };
    materiasRepository.insert(nova);
    const materias = materiasRepository.getBySemestre(dados.semestreId);
    set({ materias });
  },

  editar: (materia) => {
    materiasRepository.update(materia);
    const materias = materiasRepository.getBySemestre(materia.semestreId);
    set({ materias });
  },

  deletar: (id) => {
    const { materias } = get();
    materiasRepository.delete(id);
    const semestreId = materias.find((m) => m.id === id)?.semestreId ?? '';
    set({ materias: materiasRepository.getBySemestre(semestreId) });
  },
}));