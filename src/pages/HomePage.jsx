import React from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <h1 className="title">Age Guessing Game</h1>
      
      <div className="wallet-info" style={{
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        maxWidth: '800px',
        margin: '0 auto 2rem auto'
      }}>
        <div style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>🔐 Privacy-Preserving Age Verification</div>
        <div style={{fontSize: '0.9rem', color: '#6c757d'}}>Powered by Coti's MPC Technology</div>
      </div>

      <div className="cards-container" style={{justifyContent: 'center'}}>
        <div className="card" style={{maxWidth: '600px'}}>
          <h2 className="card-title">How to Play</h2>
          
          <div style={{textAlign: 'left', lineHeight: '1.8'}}>
            <p><strong>🎯 Player 1:</strong></p>
            <ul style={{marginLeft: '1.5rem'}}>
              <li>Store your birth date (encrypted on-chain)</li>
              <li>Your age is calculated and stored privately</li>
            </ul>
            
            <p style={{marginTop: '1.5rem'}}><strong>🎮 Player 2:</strong></p>
            <ul style={{marginLeft: '1.5rem'}}>
              <li>Try to guess Player 1's age</li>
              <li>Ask if they are OLDER or YOUNGER than your guess</li>
              <li>The answer is computed using encrypted comparison</li>
              <li>Keep guessing until you find the correct age!</li>
            </ul>

            <p style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '8px', fontSize: '0.9rem'}}>
              <strong>🔐 Privacy Guarantee:</strong> Player 2 never sees the actual age - all comparisons happen on encrypted data using Coti's Multi-Party Computation (MPC).
            </p>
          </div>

          <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/player1')}
              style={{minWidth: '150px'}}
            >
              Start as Player 1 →
            </button>
            <button
              className="btn btn-success"
              onClick={() => navigate('/player2')}
              style={{minWidth: '150px'}}
            >
              Start as Player 2 →
            </button>
          </div>
        </div>
      </div>

      <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: '#6c757d'}}>
        <p>Contract: 0xf4C65aeA6B25621c6F065c17816D90Db3230BC75</p>
        <p>Network: Coti Testnet</p>
      </div>
    </div>
  )
}

export default HomePage
