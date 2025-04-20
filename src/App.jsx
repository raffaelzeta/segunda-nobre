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
      delete novo[apelido];
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

    const sobras = [...ladoE, ...ladoD];
    sobras.forEach((apelido) => {
      novasDuplas.push([apelido]);
    });

    setDuplas(novasDuplas);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Segunda Nobre
      </h1>

      <div style={{ 
        fontSize: '1rem',
        fontWeight: 'bold',
        marginBottom: '1.2rem',
        color: '#222',
        backgroundColor: '#f1f1f1',
        padding: '0.4rem 0.8rem',
        borderRadius: '0.5rem',
        display: 'inline-block'
      }}>
        👈 Esquerda: {Object.values(ladosEscolhidos).filter(l => l === 'esquerda').length} jogadores |
        👉 Direita: {Object.values(ladosEscolhidos).filter(l => l === 'direita').length} jogadores
      </div>

      {/* Lista horizontal de jogadores confirmados */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '1rem',
          paddingBottom: '1rem',
          scrollSnapType: 'x mandatory',
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
                padding: '0.6rem',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                minWidth: '120px',
                scrollSnapAlign: 'start',
              }}
            >
              <img
                src={jogador.foto}
                alt={jogador.apelido}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '0.4rem',
                  border: estaConfirmado ? '2px solid #2ecc71' : 'none',
                }}
              />
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: estaConfirmado ? '#14532d' : '#333' }}>
                {jogador.apelido}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: estaConfirmado ? '#14532d' : '#999',
                  marginBottom: '0.3rem',
                }}
              >
                {estaConfirmado ? 'Confirmado' : 'Toque para confirmar'}
              </div>
              {estaConfirmado && (
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      escolherLado(jogador.apelido, 'esquerda');
                    }}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
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
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
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
          <h2 style={{ marginBottom: '1rem' }}>Duplas Sorteadas:</h2>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: '1rem',
            }}
          >
            {duplas.map((dupla, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '0.5rem',
                  backgroundColor: dupla.length === 2 ? '#f0f0f0' : '#ffe8e8',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  alignItems: 'center',
                  minWidth: '180px',
                  scrollSnapAlign: 'start',
                }}
              >
                {dupla.map((apelido) => {
                  const jogador = jogadores.find((j) => j.apelido === apelido);
                  if (!jogador) return null;

                  return (
                    <div
                      key={jogador.apelido}
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '0.75rem',
                        padding: '0.6rem',
                        textAlign: 'center',
                        width: '80px',
                      }}
                    >
                      <img
                        src={jogador.foto}
                        alt={jogador.apelido}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: '0.3rem',
                        }}
                      />
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {jogador.apelido}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => {
                const texto = duplas
                  .map((dupla, i) =>
                    dupla.length === 2
                      ? `Dupla ${i + 1}: ${dupla[0]} & ${dupla[1]}`
                      : `Sem Dupla: ${dupla[0]}`
                  )
                  .join('\n');
                navigator.clipboard.writeText(texto);
                alert('Duplas copiadas para a área de transferência!');
              }}
              style={{
                padding: '0.7rem 1.2rem',
                fontSize: '1rem',
                backgroundColor: '#2ecc71',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                marginTop: '1rem',
              }}
            >
              📋 Copiar Duplas pro WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// git add . && git commit -m "ajuste layout" && git push origin main

