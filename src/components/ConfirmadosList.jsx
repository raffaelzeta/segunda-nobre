// src/components/ConfirmadosList.jsx
import React from 'react';
import { useConfirmados } from '../context/ConfirmadosContext';
import jogadores from '../jogadores';

export default function ConfirmadosList({ onSort }) {
  const { confirmados, lados, salvarConfirmados, salvarLados } = useConfirmados();

  function togglePresenca(apelido) {
    const nova = confirmados.includes(apelido)
      ? confirmados.filter(a => a !== apelido)
      : [...confirmados, apelido];
    salvarConfirmados(nova);
  }
  function escolherLado(apelido, lado) {
    salvarLados({ ...lados, [apelido]: lado });
  }

  return (
    <div>
      <h2>Presença</h2>
      <ul style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        padding: 0, listStyle: 'none'
      }}>
        {jogadores.map(j => {
          const marcado = confirmados.includes(j.apelido);
          const ladoSel = lados[j.apelido];
          return (
            <li key={j.apelido} onClick={() => togglePresenca(j.apelido)} style={{cursor:'pointer',textAlign:'center',opacity: marcado?1:0.6,transition:'opacity 0.2s'}}>
              <img src={j.foto} alt={j.apelido} style={{width:60,height:60,objectFit:'cover',borderRadius:'50%'}} />
              <div style={{marginTop:4,fontWeight:'bold'}}>{j.apelido}</div>
              {marcado && (
                <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:8}}>
                  <button onClick={e=>{e.stopPropagation(); escolherLado(j.apelido,'esquerda');}}
                    style={{padding:'0.25rem 0.5rem',border:'none',borderRadius:'0.3rem',backgroundColor: ladoSel==='esquerda'?'#2ecc71':'#ccc',color:'#fff',cursor:'pointer'}}
                  >E</button>
                  <button onClick={e=>{e.stopPropagation(); escolherLado(j.apelido,'direita');}}
                    style={{padding:'0.25rem 0.5rem',border:'none',borderRadius:'0.3rem',backgroundColor: ladoSel==='direita'?'#2ecc71':'#ccc',color:'#fff',cursor:'pointer',marginLeft:4}}
                  >D</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div style={{marginTop:24}}>
        <button onClick={onSort}
          disabled={confirmados.length<2||confirmados.some(a=>!lados[a])}
          style={{padding:'0.75rem 1.5rem',backgroundColor:'#3498db',color:'#fff',border:'none',borderRadius:'0.5rem',cursor:'pointer'}}
        >Sortear Duplas</button>
      </div>
    </div>
  );
}