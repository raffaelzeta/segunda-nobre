import { useState, useEffect } from 'react';
import jogadores from './jogadores';
import { db } from './firebase';
import { doc, setDoc, onSnapshot, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

function App() {
  const [confirmados, setConfirmados] = useState([]);
  const [duplas, setDuplas] = useState([]);
  const [ladosEscolhidos, setLadosEscolhidos] = useState({});
  const [historicoDeDuplas, setHistoricoDeDuplas] = useState([]);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('presenca');
  const [modoAdmin, setModoAdmin] = useState(false);

  const partidaId = 'partida-do-dia';

  const salvarConfirmados = async (confirmados) => {
    await setDoc(doc(db, 'presencas', partidaId), { confirmados });
  };

  const salvarLadosEscolhidos = async (lados) => {
    await setDoc(doc(db, 'lados', partidaId), lados);
  };

  const salvarDuplasSorteadas = async (duplas) => {
    await setDoc(doc(db, 'sorteioAtual', partidaId), { duplas });
  };

  const salvarHistoricoDeDuplas = async (data, duplas) => {
    await addDoc(collection(db, 'historicoDuplas'), { data, duplas });
  };

  const carregarHistoricoDeDuplas = async () => {
    const querySnapshot = await getDocs(collection(db, 'historicoDuplas'));
    const dados = [];
    querySnapshot.forEach((doc) => {
      dados.push({ id: doc.id, ...doc.data() });
    });
    setHistoricoDeDuplas(dados);
  };

  const limparHistorico = async () => {
    const querySnapshot = await getDocs(collection(db, 'historicoDuplas'));
    querySnapshot.forEach(async (docu) => {
      await deleteDoc(doc(db, 'historicoDuplas', docu.id));
    });
    setHistoricoDeDuplas([]);
  };
  const resetarDia = async () => {
    const ok = window.confirm('Tem certeza que deseja resetar o dia? Isso vai apagar presenças, lados e duplas sorteadas.');
    if (!ok) return;
  
    await Promise.all([
      setDoc(doc(db, 'presencas', partidaId), { confirmados: [] }),
      setDoc(doc(db, 'lados', partidaId), {}),
      setDoc(doc(db, 'sorteioAtual', partidaId), { duplas: [] })
    ]);
  
    setConfirmados([]);
    setLadosEscolhidos({});
    setDuplas([]);
  };
  
  useEffect(() => {
    const unsubPresencas = onSnapshot(doc(db, 'presencas', partidaId), (docSnap) => {
      if (docSnap.exists()) {
        setConfirmados(docSnap.data().confirmados || []);
      }
    });

    const unsubLados = onSnapshot(doc(db, 'lados', partidaId), (docSnap) => {
      if (docSnap.exists()) {
        setLadosEscolhidos(docSnap.data() || {});
      }
    });


    const unsubDuplas = onSnapshot(doc(db, 'sorteioAtual', partidaId), async (docSnap) => {
      if (docSnap.exists()) {
        const duplasSalvas = docSnap.data().duplas || [];
        setDuplas(duplasSalvas);

        const dataHoje = new Date().toLocaleDateString('pt-BR');
        const novasDuplas = duplasSalvas.filter((d) => d.length === 2);

        // Verifica se já existe essa data no histórico
        const querySnapshot = await getDocs(collection(db, 'historicoDuplas'));
        const jaExiste = querySnapshot.docs.some((doc) => doc.data().data === dataHoje);

        if (!jaExiste && novasDuplas.length > 0) {
          await salvarHistoricoDeDuplas(dataHoje, novasDuplas);
          carregarHistoricoDeDuplas();
        }
      }
    });
    

    carregarHistoricoDeDuplas();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTemaEscuro(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => setTemaEscuro(e.matches));

    return () => {
      unsubPresencas();
      unsubLados();
      unsubDuplas();
      mediaQuery.removeEventListener('change', (e) => setTemaEscuro(e.matches));
    };
  }, []);

  const togglePresenca = async (apelido) => {
    const atualizados = confirmados.includes(apelido)
      ? confirmados.filter((nome) => nome !== apelido)
      : [...confirmados, apelido];

    const novoLados = { ...ladosEscolhidos };
    delete novoLados[apelido];

    setConfirmados(atualizados);
    setLadosEscolhidos(novoLados);
    setDuplas([]);

    await salvarConfirmados(atualizados);
    await salvarLadosEscolhidos(novoLados);
  };

  const escolherLado = (apelido, lado) => {
    const atualizados = {
      ...ladosEscolhidos,
      [apelido]: lado,
    };
    setLadosEscolhidos(atualizados);
    salvarLadosEscolhidos(atualizados);
  };

  const duplaJaExiste = (j1, j2) => {
    return historicoDeDuplas.some((entrada) =>
      entrada.duplas.some((dupla) => {
        const [a, b] = dupla;
        return (a === j1 && b === j2) || (a === j2 && b === j1);
      })
    );
  };

  const sortearDuplas = async () => {
    const jogadoresValidos = confirmados.filter((apelido) => ladosEscolhidos[apelido]);
    const esquerda = jogadoresValidos.filter((apelido) => ladosEscolhidos[apelido] === 'esquerda');
    const direita = jogadoresValidos.filter((apelido) => ladosEscolhidos[apelido] === 'direita');

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    let ladoE = shuffle([...esquerda]);
    let ladoD = shuffle([...direita]);

    let tentativas = 0;
    const maxTentativas = 100;

    while (tentativas < maxTentativas) {
      const ladoEtemp = shuffle([...ladoE]);
      const ladoDtemp = shuffle([...ladoD]);
      const tentativaDuplas = [];
      let repetida = false;

      while (ladoEtemp.length > 0 && ladoDtemp.length > 0) {
        const j1 = ladoEtemp.pop();
        const j2 = ladoDtemp.pop();
        if (duplaJaExiste(j1, j2)) {
          repetida = true;
          break;
        }
        tentativaDuplas.push([j1, j2]);
      }

      if (!repetida) {
        const sobras = [...ladoEtemp, ...ladoDtemp];
        sobras.forEach((apelido) => tentativaDuplas.push([apelido]));

        setDuplas(tentativaDuplas);
        setAbaAtiva('resultados');

        const dataHoje = new Date().toLocaleDateString('pt-BR');
        const novasDuplas = tentativaDuplas.filter((d) => d.length === 2);
        await salvarDuplasSorteadas(tentativaDuplas);
        await salvarHistoricoDeDuplas(dataHoje, novasDuplas);

        carregarHistoricoDeDuplas();
        return;
      }

      tentativas++;
    }

    alert('Não foi possível gerar duplas sem repetir. Tente reorganizar os lados.');
  };

  const corFundo = temaEscuro ? '#121212' : '#fff';
  const corTexto = temaEscuro ? '#f1f1f1' : '#000';
  const corCardFundo = temaEscuro ? '#1e1e1e' : '#f9f9f9';
  const corCardBorda = temaEscuro ? '#444' : '#ccc';

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: corFundo, color: corTexto, minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Segunda Nobre</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setAbaAtiva('presenca')} style={{ padding: '0.5rem 1rem', backgroundColor: abaAtiva === 'presenca' ? '#3498db' : '#ccc', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Presença</button>
        <button onClick={() => setAbaAtiva('resultados')} style={{ padding: '0.5rem 1rem', backgroundColor: abaAtiva === 'resultados' ? '#3498db' : '#ccc', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Sorteio</button>
      </div>

      {abaAtiva === 'presenca' && (
        <>
          <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
            👈 Esquerda: {Object.values(ladosEscolhidos).filter((l) => l === 'esquerda').length} |
            👉 Direita: {Object.values(ladosEscolhidos).filter((l) => l === 'direita').length}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {jogadores.map((jogador, index) => {
              const estaConfirmado = confirmados.includes(jogador.apelido);
              const lado = ladosEscolhidos[jogador.apelido];

              return (
                <div
                  key={index}
                  onClick={() => togglePresenca(jogador.apelido)}
                  style={{
                    backgroundColor: estaConfirmado ? '#2c6' : corCardFundo,
                    border: '2px solid',
                    borderColor: estaConfirmado ? '#2ecc71' : corCardBorda,
                    borderRadius: '1rem',
                    padding: '0.6rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: corTexto
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
                    }}
                  />
                  <div><strong>{jogador.apelido}</strong></div>
                  {estaConfirmado && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); escolherLado(jogador.apelido, 'esquerda'); }}
                        style={{ backgroundColor: lado === 'esquerda' ? '#3498db' : '#888', border: '1px solid #ccc', padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '0.4rem', color: '#fff' }}>
                        Esq.</button>
                      <button onClick={(e) => { e.stopPropagation(); escolherLado(jogador.apelido, 'direita'); }}
                        style={{ backgroundColor: lado === 'direita' ? '#3498db' : '#888', border: '1px solid #ccc', padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '0.4rem', color: '#fff' }}>
                        Dir.</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem' }}>
            
          <button
  onClick={() => {
    const senha = prompt("Digite a senha para sortear as duplas:");
    if (senha === "inss") {
      sortearDuplas();
    } else if (senha !== null) {
      alert("Senha incorreta.");
    }
  }}
  disabled={confirmados.length < 4 || confirmados.some((apelido) => !ladosEscolhidos[apelido])}
  style={{ backgroundColor: '#3498db', color: '#fff', padding: '0.75rem 1.5rem', fontSize: '1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
  Sortear Duplas
</button>


          </div>
          <div style={{ marginTop: '1rem' }}>
          <button
          onClick={() => {
            const senha = prompt("Digite a senha para resetar o dia:");
            if (senha === "inss") {
              limparHistorico();
            } else if (senha !== null) {
              alert("Senha incorreta.");
            }
          }}
          style={{
            marginTop: '1rem',
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          🔄Resetar
        </button>

</div>

        </>
      )}

    {abaAtiva === 'resultados' && (
      <div style={{ marginTop: '2rem' }}>

{/* Duplas sorteadas atualmente */}
<h2>Duplas Sorteadas:</h2>
{duplas.length === 0 && <p>Nenhuma dupla sorteada.</p>}
{duplas.map((dupla, index) => (
  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '2rem' }}>
    <strong>Dupla {index + 1}:</strong>
    {dupla.map((apelido) => {
      const jogador = jogadores.find((j) => j.apelido === apelido);
      return (
        <div key={apelido} style={{ textAlign: 'center' }}>
          <img
            src={jogador?.foto}
            alt={apelido}
            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>{apelido}</div>
        </div>
      );
    })}
  </div>
))}

          {/* Histórico de duplas anteriores */}
          <h2 style={{ marginTop: '2rem' }}>📅 Histórico de Duplas:</h2>
          {historicoDeDuplas.length === 0 && <p>Nenhum histórico salvo.</p>}
          {historicoDeDuplas.map((entrada, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <h4>📅 {entrada.data}</h4>
              <ul>
                {entrada.duplas.map((dupla, i) => (
                  <li key={i}>{dupla.join(' & ')}</li>
                ))}
              </ul>
            </div>
          ))}


          <button
            onClick={() => {
              const senha = prompt("Digite a senha para limpar o histórico:");
              if (senha === "inss") {
                limparHistorico();
              } else if (senha !== null) {
                alert("Senha incorreta.");
              }
            }}
            style={{ marginTop: '1rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            🧹 Limpar Histórico
          </button>


        </div>
      )}
    </div>
  );
}

export default App;

// git add . && git commit -m "ajuste firebase full2" && git push origin main

