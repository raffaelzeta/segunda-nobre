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
  const { historico } = useHistorico();
  // 3. Labels para as abas
  const labels = {
    presenca: 'Presença',
    sorteio: 'Sorteio',
    historico: 'Histórico'
  };

  // 4. Contadores
  const totalEsq = confirmados.filter(a => lados[a] === 'esquerda').length;
  const totalDir = confirmados.filter(a => lados[a] === 'direita').length;

  //5.Verifica repetição
  const duplaJaExiste = (j1, j2) =>
    historico.some(h =>
      h.duplas.some(dstr => {
        const [a, b] = dstr.split(' + ');
        return (a === j1 && b === j2) || (a === j2 && b === j1);
      })
    );

  //6.Sorteia sem salvar no histórico
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

  //7.Salva histórico manualmente
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
//8.Handlers que pedem senha antes de executar
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
        <div style={{marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
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
// git add . && git commit -m "inclui Dan" && git push