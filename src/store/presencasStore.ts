import { create } from 'zustand';
import { Presenca, Materia, Semestre } from '../models';
import { presencasRepository } from '../storage/presencasRepository';
import * as Crypto from 'expo-crypto';
import {
  gerarAulasPassadas,
  calcularFrequencia,
  FrequenciaStats,
} from '../services/presencaService';
import { notifyFrequenciaRiscoOnce } from '../services/notificationsService';

interface PresencasState {
  presencas: Presenca[];
  stats: FrequenciaStats | null;
  load: (materiaId: string, materia: Materia, semestreDataInicio: string) => void;
  toggleStatus: (presenca: Presenca, materia: Materia, semestreDataInicio: string) => void;
  toggleCancelada: (materiaId: string, data: string, materia: Materia, semestreDataInicio: string) => void;
  autoPresencaTodas: (materias: Materia[], semestre: Semestre) => void;
}

export const usePresencasStore = create<PresencasState>((set) => ({
  presencas: [],
  stats: null,

  load: (materiaId, materia, semestreDataInicio) => {
    const presencas = presencasRepository.getByMateria(materiaId);
    const stats = calcularFrequencia(presencas, materia, semestreDataInicio);
    if (stats.emRisco) {
      void notifyFrequenciaRiscoOnce(
        `${materia.id}:${semestreDataInicio}`,
        materia.nome,
        stats.percentualFaltas
      );
    }
    set({ presencas, stats });
  },

  toggleStatus: (presenca, materia, semestreDataInicio) => {
    if (presenca.status === 'cancelada') return;

    const novoStatus: Presenca['status'] =
      presenca.status === 'falta' ? 'presente' : 'falta';

    presencasRepository.updateStatus(presenca.id, novoStatus);
    const presencas = presencasRepository.getByMateria(presenca.materiaId);
    const stats = calcularFrequencia(presencas, materia, semestreDataInicio);
    if (stats.emRisco) {
      void notifyFrequenciaRiscoOnce(
        `${materia.id}:${semestreDataInicio}`,
        materia.nome,
        stats.percentualFaltas
      );
    }
    set({ presencas, stats });
  },

  toggleCancelada: (materiaId, data, materia, semestreDataInicio) => {
    const existente = presencasRepository.getByMateriaEData(materiaId, data);

    if (existente) {
      const novoStatus: Presenca['status'] =
        existente.status === 'cancelada' ? 'auto_presente' : 'cancelada';
      presencasRepository.updateStatus(existente.id, novoStatus);
    } else {
      presencasRepository.insert({
        id: Crypto.randomUUID(),
        materiaId,
        data,
        status: 'cancelada',
      });
    }

    const presencas = presencasRepository.getByMateria(materiaId);
    const stats = calcularFrequencia(presencas, materia, semestreDataInicio);
    if (stats.emRisco) {
      void notifyFrequenciaRiscoOnce(
        `${materia.id}:${semestreDataInicio}`,
        materia.nome,
        stats.percentualFaltas
      );
    }
    set({ presencas, stats });
  },

  autoPresencaTodas: (materias, semestre) => {
    for (const materia of materias) {
      const aulasPassadas = gerarAulasPassadas(materia, semestre.dataInicio);
      for (const data of aulasPassadas) {
        const existente = presencasRepository.getByMateriaEData(materia.id, data);
        if (!existente) {
          presencasRepository.insert({
            id: Crypto.randomUUID(),
            materiaId: materia.id,
            data,
            status: 'auto_presente',
          });
        }
      }

      const presencas = presencasRepository.getByMateria(materia.id);
      const stats = calcularFrequencia(presencas, materia, semestre.dataInicio);
      if (stats.emRisco) {
        void notifyFrequenciaRiscoOnce(
          `${materia.id}:${semestre.dataInicio}`,
          materia.nome,
          stats.percentualFaltas
        );
      }
    }
  },
}));
