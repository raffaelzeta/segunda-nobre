// src/App.jsx
import React, { useState } from 'react';
import { ConfirmadosProvider, useConfirmados } from './context/ConfirmadosContext';
import { HistoricoProvider, useHistorico } from './context/HistoricoContext';
import ConfirmadosList from './components/ConfirmadosList';
import SorteioForm from './components/SorteioForm';
import HistoricoDuplas from './components/HistoricoDuplas';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Defina aqui sua senha de administrador
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
  // 1. Função de verificação de senha
  const verifyPassword = () => {
    const entrada = window.prompt('🔒 Digite a senha de administrador:');
    if (entrada !== ADMIN_PASSWORD) {
      alert('🔑 Senha incorreta!');
      return false;
    }
    return true;
  };

  // 2. Estados e hooks
  const [aba, setAba] = useState('presenca');
  const [duplas, setDuplas] = useState([]);
  const { confirmados, lados } = useConfirmados();
  const { historico, limparHistorico } = useHistorico();

  // 3. Labels para as abas
  const labels = {
    presenca: 'Presença',
    sorteio: 'Sorteio',
    historico: 'Histórico'
  };

  // 4. Contadores
  const totalEsq = confirmados.filter(a => lados[a] === 'esquerda').length;
  const totalDir = confirmados.filter(a => lados[a] === 'direita').length;

  // 5. Funções originais (sortear, salvar histórico)
  const duplaJaExiste = (j1, j2) =>
    historico.some(h =>
      h.duplas.some(dstr => {
        const [a, b] = dstr.split(' + ');
        return (a === j1 && b === j2) || (a === j2 && b === j1);
      })
    );

  const sortearDuplas = () => {
    // ... (sua lógica inalterada)
  };

  const salvarHistoricoManual = async () => {
    // ... (sua lógica inalterada)
  };

  // 6. Handlers protegidos
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
      {/* ==================== PASSO 4: HEADER REFACTORED ==================== */}
      <div className="header">
        <h1 className="header-title">Segunda Nobre</h1>

        <nav className="header-nav">
          {['presenca', 'sorteio', 'historico'].map(tab => {
            const isActive = aba === tab;
            return (
              <button
                key={tab}
                className={`nav-button${isActive ? ' active' : ''}`}
                onClick={() => setAba(tab)}
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

      {/* Conteúdo das abas */}
      <div style={{ padding: '1rem 2rem' }}>
        {aba === 'presenca' && <ConfirmadosList onSort={handleSortear} />}

        {aba === 'sorteio' && (
          <>
            <SorteioForm duplas={duplas} />
            <button
              onClick={handleSalvarHistorico}
              disabled={!duplas.length}
              className="cta-button"
            >
              💾 Salvar Histórico
            </button>
          </>
        )}

        {aba === 'historico' && <HistoricoDuplas onClear={handleLimparHistorico} />}
      </div>
    </div>
  );
}

export default App;



// NÃO APAGAR - CÓDIGO PARA PUBLICAR AS ALTERAÇÕES
// git add . && git commit -m "ajuste layout E D" && git push