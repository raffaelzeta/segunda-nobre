import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

const HistoricoContext = createContext();

export function HistoricoProvider({ children }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'historico'), orderBy('data', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('>> HISTORICO RECEBIDO:', docs);
      setHistorico(docs);
    }, err => console.error('Erro ao ler histórico:', err));
    return unsub;
  }, []);

  // limpa toda a coleção 'historico'
  async function limparHistorico() {
    const snap = await getDocs(collection(db, 'historico'));
    await Promise.all(
      snap.docs.map(d => deleteDoc(doc(db, 'historico', d.id)))
    );
    setHistorico([]);
  }

  return (
    <HistoricoContext.Provider value={{ historico, limparHistorico }}>
      {children}
    </HistoricoContext.Provider>
  );
}

export function useHistorico() {
  return useContext(HistoricoContext);
}
