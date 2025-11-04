import React, { useState, useEffect } from 'react'
import { ApiService } from './apiService.js'

function App() {
  const [loading, setLoading] = useState(false)
  
  // First card state
  const [storeDate, setStoreDate] = useState('')
  const [storeStatus, setStoreStatus] = useState('')
  
  // Second card state
  const [compareDate, setCompareDate] = useState('')
  const [compareStatus, setCompareStatus] = useState('')

  useEffect(() => {
    initializeCotiService()
  }, [])

  const initializeCotiService = async () => {
    setStoreStatus('🔄 Checking server connection...')
    
    try {
      console.log('Checking server health...')
      await ApiService.healthCheck()
      
      console.log('Testing contract connection...')
      setStoreStatus('🔄 Connecting to Coti network...')
      
      // Test connection by checking if date is set (this doesn't require _sum)
      await ApiService.isDateSet()
      
      setStoreStatus(`✅ Connected to DateGame contract!`)
      
    } catch (error) {
      console.error('Error connecting to server:', error)
      setStoreStatus('❌ Error connecting to server: ' + error.message)
    }
  }

  const handleStoreDate = async () => {
    if (!storeDate) {
      setStoreStatus('Please select a date')
      return
    }

    setLoading(true)
    setStoreStatus('Sending date to server for encryption and storage...')

    try {
      console.log('Storing date:', storeDate)
      
      // Store date using server API
      const result = await ApiService.storeDate(storeDate)
      
      console.log('Store result:', result)
      setStoreStatus(`✅ Date stored successfully! Transaction: ${result.transactionHash.slice(0, 10)}... Block: ${result.blockNumber}`)
      
    } catch (error) {
      console.error('Error storing date:', error)
      setStoreStatus('❌ Error storing date: ' + (error.message || error.toString()))
    } finally {
      setLoading(false)
    }
  }

  const handleCompareDate = async (operation) => {
    if (!compareDate) {
      setCompareStatus('Please select a date')
      return
    }

    setLoading(true)
    setCompareStatus(`Sending date to server for encryption and comparison (${operation})...`)

    try {
      console.log('Comparing date:', compareDate, 'operation:', operation)
      
      // Compare date using server API
      const result = await ApiService.compareDate(compareDate, operation)
      
      console.log('Compare result:', result)
      
      const comparisonText = operation === 'greater' ? 'greater than' : 'less than'
      const booleanResult = result.result === 'true' || result.result === true
      
      let statusMessage = `✅ Result: Stored date is ${comparisonText} selected date: ${booleanResult ? 'YES' : 'NO'}`
      
      // Add debugging info if available
      if (result.storedValue && result.comparedValue) {
        statusMessage += `\n📊 Debug: Stored=${result.storedValue}, Compared=${result.comparedValue}`
      }
      
      setCompareStatus(statusMessage)
      
    } catch (error) {
      console.error('Error comparing date:', error)
      setCompareStatus('❌ Error comparing date: ' + (error.message || error.toString()))
    } finally {
      setLoading(false)
    }
  }

  const handleDebugInfo = async () => {
    setLoading(true)
    setCompareStatus('🔍 Getting debug information...')

    try {
      // Check if date is set
      const isSet = await ApiService.isDateSet()
      
      if (!isSet) {
        setCompareStatus('❌ No date has been stored yet. Please store a date first.')
        return
      }
      
      // Get stored date
      const storedDate = await ApiService.getStoredDate()
      
      // Debug date conversion for comparison date
      let debugInfo = `📊 Debug Info:\n✅ Date is stored: ${isSet}\n📅 Stored value: ${storedDate}`
      
      if (compareDate) {
        const dateDebug = await ApiService.debugDate(compareDate)
        debugInfo += `\n🔍 Compare date "${compareDate}" = ${dateDebug.daysSinceEpoch} days since epoch`
      }
      
      setCompareStatus(debugInfo)
      
    } catch (error) {
      console.error('Error getting debug info:', error)
      setCompareStatus('❌ Error getting debug info: ' + (error.message || error.toString()))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1 className="title">DateGame - Coti Testnet</h1>
      
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
        <div style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>🔐 Server-side encryption with Coti MPC</div>
        <div style={{fontSize: '0.9rem', color: '#6c757d', wordBreak: 'break-all'}}>📍 Contract: 0x9a6dab6FaA963D177C52D2f3bdB60E89Fef2F3c2</div>
      </div>

      <div className="cards-container">
        {/* First Card - Store Date */}
        <div className="card">
          <h2 className="card-title">Store Date</h2>
          
          <div className="form-group">
            <label className="form-label">Select Date to Store:</label>
            <input
              type="date"
              className="form-input"
              value={storeDate}
              onChange={(e) => setStoreDate(e.target.value)}
            />
          </div>
          
          <button
            className="btn btn-primary"
            onClick={handleStoreDate}
            disabled={loading}
          >
            {loading ? 'Storing...' : 'Submit'}
          </button>
          
          {storeStatus && (
            <div className={`status-message ${storeStatus.includes('Error') ? 'status-error' : storeStatus.includes('success') ? 'status-success' : 'status-info'}`}>
              {storeStatus}
            </div>
          )}
        </div>

        {/* Second Card - Compare Date */}
        <div className="card">
          <h2 className="card-title">Compare Date</h2>
          
          <div className="form-group">
            <label className="form-label">Select Date to Compare:</label>
            <input
              type="date"
              className="form-input"
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
            />
          </div>
          
          <div className="button-group">
            <button
              className="btn btn-success"
              onClick={() => handleCompareDate('greater')}
              disabled={loading}
            >
              {loading ? 'Comparing...' : 'Greater Than'}
            </button>
            
            <button
              className="btn btn-warning"
              onClick={() => handleCompareDate('less')}
              disabled={loading}
            >
              {loading ? 'Comparing...' : 'Less Than'}
            </button>
          </div>
          
          <div className="button-group" style={{marginTop: '1rem'}}>
            <button
              className="btn btn-info"
              onClick={handleDebugInfo}
              disabled={loading}
              style={{fontSize: '0.9rem'}}
            >
              Debug Info
            </button>
          </div>
          
          {compareStatus && (
            <div className={`status-message ${compareStatus.includes('Error') ? 'status-error' : compareStatus.includes('Result') ? 'status-success' : 'status-info'}`}>
              {compareStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App