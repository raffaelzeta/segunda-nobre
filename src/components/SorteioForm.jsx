// src/components/SorteioForm.jsx
import React from 'react';
import jogadores from '../jogadores';

export default function SorteioForm({ duplas }) {
  return (
    <div>
      <h2>Duplas Sorteadas</h2>
      {duplas.length === 0 ? (
        <p>Nenhuma dupla gerada.</p>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {duplas.map((par, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
              <strong>Dupla {i+1}:</strong>
              {par.map(apelido => {
                const j = jogadores.find(x=>x.apelido===apelido);
                return (
                  <div key={apelido} style={{textAlign:'center'}}>
                    <img src={j.foto} alt={apelido} style={{width:50,height:50,borderRadius:'50%',objectFit:'cover'}} />
                    <div>{apelido}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}