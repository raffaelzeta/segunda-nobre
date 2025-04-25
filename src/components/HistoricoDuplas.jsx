import React from 'react';
import { useHistorico } from '../context/HistoricoContext';

// Defina aqui a mesma senha que colocou no App.jsx
const ADMIN_PASSWORD = 'velhos123';

// Função para pedir e validar a senha
function verifyPassword() {
  const entrada = window.prompt('🔒 Digite a senha de administrador:');
  if (entrada !== ADMIN_PASSWORD) {
    alert('🔑 Senha incorreta!');
    return false;
  }
  return true;
}

export default function HistoricoDuplas() {
  const { historico, limparHistorico } = useHistorico();

  // Handler que valida senha antes de confirmar limpeza
  const handleLimparProtegido = () => {
    if (!verifyPassword()) return;
    if (window.confirm('Limpar todo o histórico?')) {
      limparHistorico();
    }
  };

  if (!historico.length) {
    return <p>Nenhum histórico registrado ainda.</p>;
  }

  return (
    <div>
      <h2>Histórico de Duplas</h2>

      {/* Aqui está o botão com style como prop */}
      <button
        onClick={handleLimparProtegido}
        style={{
          backgroundColor: '#e74c3c',
          color: '#fff',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.3rem',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        🧹 Limpar Histórico
      </button>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {historico.map(({ id, data, duplas }) => {
          const ts = typeof data === 'number'
            ? new Date(data)
            : data.seconds
              ? new Date(data.seconds * 1000)
              : new Date(data);
          const dataFmt = ts.toLocaleDateString('pt-BR');

          return (
            <li key={id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 'bold' }}>{dataFmt}</div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {duplas.map((parTxt, idx) => (
                  <li key={idx}>{parTxt}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}



// NÃO APAGAR - CÓDIGO PARA PUBLICAR AS ALTERAÇÕES
// git add . && git commit -m "reconstrução" && git push