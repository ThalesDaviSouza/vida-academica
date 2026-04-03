import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { Prova } from '../models';
import { provasRepository } from '../storage/provasRepository';
import {
  cancelNotificationsByRef,
  scheduleProvaNotifications,
} from '../services/notificationsService';

interface ProvasState {
  provas: Prova[];
  load: (semestreId: string) => void;
  criar: (dados: Omit<Prova, 'id'>, semestreId: string) => void;
  editar: (prova: Prova, semestreId: string) => void;
  deletar: (id: string, semestreId: string) => void;
}

export const useProvasStore = create<ProvasState>((set) => ({
  provas: [],

  load: (semestreId) => {
    set({ provas: provasRepository.getBySemestre(semestreId) });
  },

  criar: (dados, semestreId) => {
    const nova: Prova = { id: Crypto.randomUUID(), ...dados };
    provasRepository.insert(nova);
    void scheduleProvaNotifications(nova);
    set({ provas: provasRepository.getBySemestre(semestreId) });
  },

  editar: (prova, semestreId) => {
    provasRepository.update(prova);
    void scheduleProvaNotifications(prova);
    set({ provas: provasRepository.getBySemestre(semestreId) });
  },

  deletar: (id, semestreId) => {
    void cancelNotificationsByRef('prova_data', id);
    provasRepository.delete(id);
    set({ provas: provasRepository.getBySemestre(semestreId) });
  },
}));
