// src/App.jsx
import React, { useState } from 'react';
import { ConfirmadosProvider, useConfirmados } from './context/ConfirmadosContext';
import { HistoricoProvider, useHistorico } from './context/HistoricoContext';
import ConfirmadosList from './components/ConfirmadosList';
import SorteioForm from './components/SorteioForm';
import HistoricoDuplas from './components/HistoricoDuplas';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
// Defina aqui sua senha de administrador (altere para o valor que quiser):
const ADMIN_PASSWORD = 'velhos123';

function App() {
  return (
    <ConfirmadosProvider>
      <HistoricoProvider>
        <AppContent />
      </HistoricoProvider>
    </ConfirmadosProvider>
  );
}

function AppContent() {
    // Função que pede a senha via prompt e retorna true se estiver correta
    const verifyPassword = () => {
      const entrada = window.prompt('🔒 Digite a senha de administrador:');
      if (entrada !== ADMIN_PASSWORD) {
        alert('🔑 Senha incorreta!');
        return false;
      }
      return true;
    };
  
  const [aba, setAba] = useState('presenca');
  const [duplas, setDuplas] = useState([]);
  const { confirmados, lados } = useConfirmados();
  const { historico } = useHistorico();

  // Contadores
  const totalEsq = confirmados.filter(a => lados[a] === 'esquerda').length;
  const totalDir = confirmados.filter(a => lados[a] === 'direita').length;

  // Verifica repetição
  const duplaJaExiste = (j1, j2) =>
    historico.some(h =>
      h.duplas.some(dstr => {
        const [a, b] = dstr.split(' + ');
        return (a === j1 && b === j2) || (a === j2 && b === j1);
      })
    );

  // Sorteia sem salvar no histórico
  const sortearDuplas = () => {
    const validos = confirmados.filter(a => lados[a]);
    const esqu = validos.filter(a => lados[a] === 'esquerda');
    const dir  = validos.filter(a => lados[a] === 'direita');
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

    let attempt = 0, maxAttempts = 100, resultado = [];
    while (attempt < maxAttempts) {
      const eTemp = shuffle(esqu);
      const dTemp = shuffle(dir);
      const tent = [];
      let repetida = false;
      while (eTemp.length && dTemp.length) {
        const a = eTemp.pop(), b = dTemp.pop();
        if (duplaJaExiste(a, b)) { repetida = true; break; }
        tent.push([a, b]);
      }
      [...eTemp, ...dTemp].forEach(x => tent.push([x]));
      if (!repetida) { resultado = tent; break; }
      attempt++;
    }

    if (resultado.length === 0) {
      alert('Não há mais combinações únicas disponíveis!');
      return;
    }

    setDuplas(resultado);
    setAba('sorteio');
  };

  // Salva histórico manualmente
  const salvarHistoricoManual = async () => {
    try {
      const docRef = await addDoc(collection(db, 'historico'), {
        data: Date.now(),
        duplas: duplas.map(par => par.join(' + '))
      });
      alert('Histórico salvo! ID: ' + docRef.id);
    } catch (err) {
      console.error('Erro ao salvar histórico:', err);
      alert('Erro ao salvar histórico. Veja o console.');
    }
  };
// Handlers que pedem senha antes de executar
const handleSortear = () => {
  if (!verifyPassword()) return;
  sortearDuplas();
};

const handleSalvarHistorico = () => {
  if (!verifyPassword()) return;
  salvarHistoricoManual();
};

const handleLimparHistorico = () => {
  if (!verifyPassword()) return;
  limparHistorico();
};
  return (
    <div style={{ minHeight: '100vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 100,
          padding: '2rem 2rem 1rem'
        }}
      >
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Segunda Nobre</h1>
        <nav style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          {['presenca', 'sorteio', 'historico'].map(tab => {
            const labels = { presenca: 'Presença', sorteio: 'Sorteio', historico: 'Histórico' };
            const isActive = aba === tab;
            return (
              <button
                key={tab}
                onClick={() => setAba(tab)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #3498db' : '3px solid transparent',
                  color: isActive ? '#3498db' : '#555',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-bottom-color 0.2s'
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </nav>
        {aba === 'presenca' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <div><strong>Esquerda:</strong> {totalEsq}</div>
            <div><strong>Direita:</strong> {totalDir}</div>
          </div>
        )}
      </div>
      <div style={{ padding: '1rem 2rem' }}>
        {aba === 'presenca' && <ConfirmadosList onSort={handleSortear} />}
        {aba === 'sorteio' && (
          <>
            <SorteioForm duplas={duplas} />
            <button onClick={handleSalvarHistorico}
              disabled={!duplas.length}
              style={{
                marginTop: '1rem',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: duplas.length ? 'pointer' : 'not-allowed'
              }}
            >
              Salvar Histórico
            </button>
          </>
        )}
        {aba === 'historico' && <HistoricoDuplas />}
      </div>
    </div>
  );
}

export default App;
