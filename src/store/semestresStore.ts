import { create } from 'zustand';
import { Semestre } from '../models';
import { semestresRepository } from '../storage/semestreRepository';
import { randomUUID } from 'expo-crypto';

interface SemestresState {
  semestres: Semestre[];
  semestreAtivo: Semestre | null;
  load: () => void;
  criar: (dados: Omit<Semestre, 'id' | 'ativo'>) => void;
  editar: (semestre: Semestre) => void;
  setAtivo: (id: string) => void;
  deletar: (id: string) => void;
}

export const useSemestresStore = create<SemestresState>((set) => ({
  semestres: [],
  semestreAtivo: null,

  load: () => {
    const semestres = semestresRepository.getAll();
    const semestreAtivo = semestresRepository.getAtivo();
    set({ semestres, semestreAtivo });
  },

  criar: (dados) => {
    const novo: Semestre = {
      id: randomUUID(),
      ativo: false,
      ...dados,
    };
    semestresRepository.insert(novo);
    const semestres = semestresRepository.getAll();
    set({ semestres });
  },

  editar: (semestre) => {
    semestresRepository.update(semestre);
    const semestres = semestresRepository.getAll();
    const semestreAtivo = semestresRepository.getAtivo();
    set({ semestres, semestreAtivo });
  },

  setAtivo: (id) => {
    semestresRepository.setAtivo(id);
    const semestres = semestresRepository.getAll();
    const semestreAtivo = semestresRepository.getAtivo();
    set({ semestres, semestreAtivo });
  },

  deletar: (id) => {
    semestresRepository.delete(id);
    const semestres = semestresRepository.getAll();
    const semestreAtivo = semestresRepository.getAtivo();
    set({ semestres, semestreAtivo });
  },
}));