// src/context/ConfirmadosContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const ConfirmadosContext = createContext();
export function ConfirmadosProvider({ children }) {
  const [confirmados, setConfirmados] = useState([]);
  const [lados, setLados] = useState({});

  useEffect(() => {
    const unsub1 = onSnapshot(doc(db, 'presencas', 'mesa1'), snap => {
      setConfirmados(snap.exists() ? snap.data().confirmados || [] : []);
    });
    const unsub2 = onSnapshot(doc(db, 'lados', 'mesa1'), snap => {
      setLados(snap.exists() ? snap.data() : {});
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const salvarConfirmados = async lista => {
    await setDoc(doc(db, 'presencas', 'mesa1'), { confirmados: lista });
    setConfirmados(lista);
  };
  const salvarLados = async obj => {
    await setDoc(doc(db, 'lados', 'mesa1'), obj);
    setLados(obj);
  };

  return (
    <ConfirmadosContext.Provider value={{ confirmados, lados, salvarConfirmados, salvarLados }}>
      {children}
    </ConfirmadosContext.Provider>
  );
}
export function useConfirmados() {
  return useContext(ConfirmadosContext);
}