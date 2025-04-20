import { useState } from 'react';
import jogadores from './jogadores';

function App() {
  const [confirmados, setConfirmados] = useState([]);
  const [duplas, setDuplas] = useState([]);
  const [ladosEscolhidos, setLadosEscolhidos] = useState({});

  const togglePresenca = (apelido) => {
    setConfirmados((prev) =>
      prev.includes(apelido)
        ? prev.filter((nome) => nome !== apelido)
        : [...prev, apelido]
    );
    setDuplas([]);
    setLadosEscolhidos((prev) => {
      const novo = { ...prev };
      delete novo[apelido]; // zera o lado ao desconfirmar
      return novo;
    });
  };

  const escolherLado = (apelido, lado) => {
    setLadosEscolhidos((prev) => ({
      ...prev,
      [apelido]: lado,
    }));
  };

  const sortearDuplas = () => {
    const jogadoresValidos = confirmados.filter((apelido) => ladosEscolhidos[apelido]);
    const esquerda = jogadoresValidos.filter((apelido) => ladosEscolhidos[apelido] === 'esquerda');
    const direita = jogadoresValidos.filter((apelido) => ladosEscolhidos[apelido] === 'direita');

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    let ladoE = shuffle([...esquerda]);
    let ladoD = shuffle([...direita]);

    const novasDuplas = [];

    while (ladoE.length > 0 && ladoD.length > 0) {
      const jogadorE = ladoE.pop();
      const jogadorD = ladoD.pop();
      novasDuplas.push([jogadorE, jogadorD]);
    }

    // Sobras
    const sobras = [...ladoE, ...ladoD];
    sobras.forEach((apelido) => {
      novasDuplas.push([apelido]); // jogador sem dupla
    });

    setDuplas(novasDuplas);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
      ⚽ Segunda Nobre ⚽
      </h1>

    <div style={{ 
      fontSize: '1rem', 
      fontWeight: 'bold', 
      marginBottom: '1.2rem', 
      color: '#333' 
    }}>
      👈 Esquerda: {Object.values(ladosEscolhidos).filter(l => l === 'esquerda').length} jogadores | 👉 Direita: {Object.values(ladosEscolhidos).filter(l => l === 'direita').length} jogadores
    </div>
      {/* <p style={{ marginBottom: '1.5rem' }}>Toque para confirmar presença:</p> */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {jogadores.map((jogador, index) => {
          const estaConfirmado = confirmados.includes(jogador.apelido);
          const lado = ladosEscolhidos[jogador.apelido];

          return (
            <div
              key={index}
              onClick={() => togglePresenca(jogador.apelido)}
              style={{
                backgroundColor: estaConfirmado ? '#d1f7d6' : '#f9f9f9',
                border: '2px solid',
                borderColor: estaConfirmado ? '#2ecc71' : '#ccc',
                borderRadius: '1rem',
                padding: '1rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              <img
                src={jogador.foto}
                alt={jogador.apelido}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '0.5rem',
                  border: estaConfirmado ? '2px solid #2ecc71' : 'none',
                }}
              />
              <div style={{ fontWeight: 'bold' }}>{jogador.apelido}</div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: estaConfirmado ? '#27ae60' : '#999',
                  marginBottom: '0.5rem',
                }}
              >
                {estaConfirmado ? 'Confirmado' : 'Toque para confirmar'}
              </div>

              {estaConfirmado && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      escolherLado(jogador.apelido, 'esquerda');
                    }}
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.75rem',
                      backgroundColor: lado === 'esquerda' ? '#2ecc71' : '#ecf0f1',
                      border: '1px solid #ccc',
                      borderRadius: '0.3rem',
                      cursor: 'pointer',
                    }}
                  >
                    Esquerda
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      escolherLado(jogador.apelido, 'direita');
                    }}
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.75rem',
                      backgroundColor: lado === 'direita' ? '#3498db' : '#ecf0f1',
                      border: '1px solid #ccc',
                      borderRadius: '0.3rem',
                      cursor: 'pointer',
                    }}
                  >
                    Direita
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={sortearDuplas}
          disabled={
            confirmados.length < 4 ||
            confirmados.some((apelido) => !ladosEscolhidos[apelido])
          }
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            opacity:
              confirmados.length < 4 ||
              confirmados.some((apelido) => !ladosEscolhidos[apelido])
                ? 0.6
                : 1,
          }}
          >
          Sortear Duplas
        </button>
      </div>

      {duplas.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Duplas Sorteadas:</h2>
          <ul>
            {duplas.map((dupla, index) => (
              <li key={index}>
                <strong>Dupla {index + 1}:</strong>{' '}
                {dupla.length === 2 ? `${dupla[0]} & ${dupla[1]}` : `${dupla[0]} (sem dupla)`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
