import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { Atividade } from '../models';
import { atividadesRepository } from '../storage/atividadesRepository';
import {
  cancelNotificationsByRef,
  scheduleAtividadeNotifications,
} from '../services/notificationsService';

interface AtividadesState {
  atividades: Atividade[];
  load: (semestreId: string) => void;
  criar: (dados: Omit<Atividade, 'id'>, semestreId: string) => void;
  editar: (atividade: Atividade, semestreId: string) => void;
  toggleStatus: (atividade: Atividade, semestreId: string) => void;
  deletar: (id: string, semestreId: string) => void;
}

export const useAtividadesStore = create<AtividadesState>((set) => ({
  atividades: [],

  load: (semestreId) => {
    const atividades = atividadesRepository.getBySemestre(semestreId);
    set({ atividades });
  },

  criar: (dados, semestreId) => {
    const nova: Atividade = {
      id: Crypto.randomUUID(),
      ...dados,
    };

    atividadesRepository.insert(nova);
    void scheduleAtividadeNotifications(nova);
    set({ atividades: atividadesRepository.getBySemestre(semestreId) });
  },

  editar: (atividade, semestreId) => {
    atividadesRepository.update(atividade);
    void scheduleAtividadeNotifications(atividade);
    set({ atividades: atividadesRepository.getBySemestre(semestreId) });
  },

  toggleStatus: (atividade, semestreId) => {
    const status = atividade.status === 'pendente' ? 'concluido' : 'pendente';
    atividadesRepository.updateStatus(atividade.id, status);
    if (status === 'concluido') {
      void cancelNotificationsByRef('atividade_prazo', atividade.id);
    } else {
      void scheduleAtividadeNotifications({ ...atividade, status });
    }
    set({ atividades: atividadesRepository.getBySemestre(semestreId) });
  },

  deletar: (id, semestreId) => {
    void cancelNotificationsByRef('atividade_prazo', id);
    atividadesRepository.delete(id);
    set({ atividades: atividadesRepository.getBySemestre(semestreId) });
  },
}));
