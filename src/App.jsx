import { useState, useEffect } from 'react';
import jogadores from './jogadores';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

function App() {
  const [confirmados, setConfirmados] = useState([]);
  const [duplas, setDuplas] = useState([]);
  const [ladosEscolhidos, setLadosEscolhidos] = useState({});
  const [historicoDeDuplas, setHistoricoDeDuplas] = useState([]);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('presenca');

  const partidaId = 'partida-do-dia';

  const salvarConfirmados = async (confirmados) => {
    await setDoc(doc(db, 'presencas', partidaId), { confirmados });
  };

  const salvarHistoricoDeDuplas = async (data, duplas) => {
    await addDoc(collection(db, 'historicoDuplas'), { data, duplas });
  };

  const carregarHistoricoDeDuplas = async () => {
    const querySnapshot = await getDocs(collection(db, 'historicoDuplas'));
    const dados = [];
    querySnapshot.forEach((doc) => {
      dados.push(doc.data());
    });
    setHistoricoDeDuplas(dados);
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'presencas', partidaId), (docSnap) => {
      if (docSnap.exists()) {
        setConfirmados(docSnap.data().confirmados || []);
      }
    });

    carregarHistoricoDeDuplas();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTemaEscuro(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => setTemaEscuro(e.matches));

    return () => {
      unsub();
      mediaQuery.removeEventListener('change', (e) => setTemaEscuro(e.matches));
    };
  }, []);

  const togglePresenca = async (apelido) => {
    const atualizados = confirmados.includes(apelido)
      ? confirmados.filter((nome) => nome !== apelido)
      : [...confirmados, apelido];

    setConfirmados(atualizados);
    setDuplas([]);
    setLadosEscolhidos((prev) => {
      const novo = { ...prev };
      delete novo[apelido];
      return novo;
    });

    await salvarConfirmados(atualizados);
  };

  const escolherLado = (apelido, lado) => {
    setLadosEscolhidos((prev) => ({
      ...prev,
      [apelido]: lado,
    }));
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
        setHistoricoDeDuplas((prev) => [...prev, { data: dataHoje, duplas: novasDuplas }]);
        await salvarHistoricoDeDuplas(dataHoje, novasDuplas);

        return;
      }

      tentativas++;
    }

    alert('Não foi possível gerar duplas sem repetir. Tente reorganizar os lados.');
  };

  const limparHistorico = () => {
    if (window.confirm('Tem certeza que deseja limpar o histórico de duplas?')) {
      setHistoricoDeDuplas([]);
    }
  };

  const agruparPorData = () => {
    const agrupado = {};
    historicoDeDuplas.forEach((entrada) => {
      const data = entrada.data;
      if (!agrupado[data]) agrupado[data] = [];
      agrupado[data].push(...entrada.duplas);
    });
    return agrupado;
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
                    backgroundColor: estaConfirmado ? '#2ecc71' : corCardFundo,
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
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }}
                  />
                  <div><strong>{jogador.apelido}</strong></div>
                  {estaConfirmado && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); escolherLado(jogador.apelido, 'esquerda'); }}
                        style={{ backgroundColor: lado === 'esquerda' ? '#3498db' : '#888', color: '#fff', fontSize: '0.75rem', borderRadius: '0.4rem', border: 'none', padding: '0.2rem 0.4rem' }}>Esq.</button>
                      <button onClick={(e) => { e.stopPropagation(); escolherLado(jogador.apelido, 'direita'); }}
                        style={{ backgroundColor: lado === 'direita' ? '#3498db' : '#888', color: '#fff', fontSize: '0.75rem', borderRadius: '0.4rem', border: 'none', padding: '0.2rem 0.4rem' }}>Dir.</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={sortearDuplas}
              disabled={confirmados.length < 4 || confirmados.some((apelido) => !ladosEscolhidos[apelido])}
              style={{ backgroundColor: '#3498db', color: '#fff', padding: '0.75rem 1.5rem', fontSize: '1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Sortear Duplas
            </button>
          </div>
        </>
      )}

      {abaAtiva === 'resultados' && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Duplas Sorteadas:</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {duplas.map((dupla, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <strong>Dupla {index + 1}:</strong>
                {dupla.map((apelido) => {
                  const jogador = jogadores.find(j => j.apelido === apelido);
                  return (
                    <div key={apelido} style={{ textAlign: 'center' }}>
                      <img src={jogador?.foto} alt={apelido} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.85rem' }}>{apelido}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Histórico de Duplas por Data:</h3>
            {Object.entries(agruparPorData()).map(([data, duplas], idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>📅 {data}</h4>
                <ul>
                  {duplas.map((dupla, i) => (
                    <li key={i}>{dupla.join(' & ')}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={limparHistorico}
              style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '0.5rem 1rem', fontSize: '1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              🧹 Limpar Histórico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


// git add . && git commit -m "ajuste tema claro/escuro2" && git push origin main

