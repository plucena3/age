import express from 'express'
import cors from 'cors'
import { ethers } from 'ethers'
import { Contract, CotiNetwork, getDefaultProvider, Wallet } from '@coti-io/coti-ethers'

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Contract configuration
const CONTRACT_ADDRESS = '0x9a6dab6FaA963D177C52D2f3bdB60E89Fef2F3c2'
const PRIVATE_KEY = 'ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306'
const AES_KEY = 'ae7f54c98460fed4c2ecb2e143f0e8110db534d390940f9f7b7048b94d614306' // Using same key for simplicity

const DateGameABI = [
  {
    "inputs": [{ "components": [{ "internalType": "ctUint64", "name": "ciphertext", "type": "uint256" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct itUint64", "name": "value", "type": "tuple" }],
    "name": "setDate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "components": [{ "internalType": "ctUint64", "name": "ciphertext", "type": "uint256" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct itUint64", "name": "value", "type": "tuple" }],
    "name": "greaterThan",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "components": [{ "internalType": "ctUint64", "name": "ciphertext", "type": "uint256" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct itUint64", "name": "value", "type": "tuple" }],
    "name": "lessThan",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isDateSet",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStoredDateClear",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "operation", "type": "string" },
      { "indexed": false, "internalType": "bool", "name": "result", "type": "bool" }
    ],
    "name": "ComparisonResult",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint64", "name": "value", "type": "uint64" }
    ],
    "name": "DateStored",
    "type": "event"
  }
]

// Initialize Coti provider and wallet
let cotiProvider, cotiWallet, contract

async function initializeCoti() {
  try {
    console.log('Initializing Coti provider...')
    cotiProvider = getDefaultProvider(CotiNetwork.Testnet)

    console.log('Creating Coti wallet...')
    cotiWallet = new Wallet(PRIVATE_KEY, cotiProvider)
    cotiWallet.setAesKey(AES_KEY)
    console.log('Wallet address:', cotiWallet.address)

    console.log('Creating contract instance...')
    contract = new Contract(CONTRACT_ADDRESS, DateGameABI, cotiWallet)

    console.log('✅ Coti service initialized successfully!')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize Coti:', error)
    return false
  }
}

// Helper function to convert date to epoch days
function dateToEpochDays(dateString) {
  const selectedDate = new Date(dateString)
  const epochDate = new Date('1970-01-01')
  return Math.floor((selectedDate - epochDate) / (1000 * 60 * 60 * 24))
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Coti Date Game Server is running' })
})

// Removed sum endpoint - not needed for DateGame functionality

// Store encrypted date
app.post('/api/store-date', async (req, res) => {
  try {
    const { date } = req.body

    if (!date) {
      return res.status(400).json({ error: 'Date is required' })
    }

    if (!contract) {
      const initialized = await initializeCoti()
      if (!initialized) {
        return res.status(500).json({ error: 'Failed to initialize Coti service' })
      }
    }

    console.log('Storing date:', date)

    // Convert date to days since epoch
    const daysSinceEpoch = dateToEpochDays(date)
    const bigIntValue = BigInt(daysSinceEpoch)

    console.log('Days since epoch:', daysSinceEpoch)
    console.log('BigInt value for storage:', bigIntValue.toString())

    // Encrypt using Coti wallet
    console.log('Encrypting value...')
    const encryptedValue = await cotiWallet.encryptValue(
      bigIntValue,
      CONTRACT_ADDRESS,
      contract.setDate.fragment.selector
    )

    console.log('Sending transaction...')
    const tx = await contract.setDate(encryptedValue, {
      gasLimit: 500000
    })

    console.log('Transaction sent:', tx.hash)
    const receipt = await tx.wait()

    res.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      date: date,
      daysSinceEpoch: daysSinceEpoch
    })

  } catch (error) {
    console.error('Error storing date:', error)
    res.status(500).json({ error: 'Failed to store date: ' + error.message })
  }
})

// Check if date is set
app.get('/api/is-date-set', async (req, res) => {
  try {
    if (!contract) {
      const initialized = await initializeCoti()
      if (!initialized) {
        return res.status(500).json({ error: 'Failed to initialize Coti service' })
      }
    }

    const isSet = await contract.isDateSet()
    res.json({ isDateSet: isSet })
  } catch (error) {
    console.error('Error checking if date is set:', error)
    res.status(500).json({ error: 'Failed to check date status' })
  }
})

// Get stored date (for debugging)
app.get('/api/get-stored-date', async (req, res) => {
  try {
    if (!contract) {
      const initialized = await initializeCoti()
      if (!initialized) {
        return res.status(500).json({ error: 'Failed to initialize Coti service' })
      }
    }

    // Call as transaction since it uses MpcCore.decrypt
    const tx = await contract.getStoredDateClear({
      gasLimit: 300000
    })

    console.log('Transaction sent:', tx.hash)
    const receipt = await tx.wait()

    // Parse events to get the stored date
    let storedValue = null

    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log)
          console.log('Parsed log:', parsedLog)

          if (parsedLog.name === 'DateStored') {
            storedValue = parsedLog.args.value.toString()
            console.log('Found DateStored event with value:', storedValue)
            break
          }
        } catch (parseError) {
          console.log('Could not parse log:', parseError.message)
        }
      }
    }

    if (storedValue === null) {
      return res.status(500).json({ error: 'Could not retrieve stored date from transaction events' })
    }

    res.json({ storedDate: storedValue })
  } catch (error) {
    console.error('Error getting stored date:', error)
    res.status(500).json({ error: 'Failed to get stored date: ' + error.message })
  }
})

// Debug date conversion
app.post('/api/debug-date', async (req, res) => {
  try {
    const { date } = req.body

    if (!date) {
      return res.status(400).json({ error: 'Date is required' })
    }

    const daysSinceEpoch = dateToEpochDays(date)

    // Let's also test some known dates
    const testDates = [
      '2024-01-01',
      '2025-01-01',
      '2025-10-23',
      '2025-10-30'
    ]

    const testResults = testDates.map(testDate => ({
      date: testDate,
      daysSinceEpoch: dateToEpochDays(testDate)
    }))

    res.json({
      inputDate: date,
      daysSinceEpoch: daysSinceEpoch,
      testDates: testResults
    })

  } catch (error) {
    console.error('Error debugging date:', error)
    res.status(500).json({ error: 'Failed to debug date: ' + error.message })
  }
})

// Compare date
app.post('/api/compare-date', async (req, res) => {
  try {
    const { date, operation } = req.body

    if (!date || !operation) {
      return res.status(400).json({ error: 'Date and operation are required' })
    }

    if (!['greater', 'less'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be "greater" or "less"' })
    }

    if (!contract) {
      const initialized = await initializeCoti()
      if (!initialized) {
        return res.status(500).json({ error: 'Failed to initialize Coti service' })
      }
    }

    console.log('Comparing date:', date, 'operation:', operation)

    // Convert date to days since epoch
    const daysSinceEpoch = dateToEpochDays(date)
    const bigIntValue = BigInt(daysSinceEpoch)

    console.log('Days since epoch:', daysSinceEpoch)
    console.log('BigInt value for comparison:', bigIntValue.toString())

    // Encrypt using Coti wallet
    console.log('Encrypting comparison value...')
    const functionSelector = operation === 'greater' ?
      contract.greaterThan.fragment.selector :
      contract.lessThan.fragment.selector

    const encryptedValue = await cotiWallet.encryptValue(
      bigIntValue,
      CONTRACT_ADDRESS,
      functionSelector
    )

    console.log('Calling comparison function as transaction...')

    // First check if date is set
    const isDateSet = await contract.isDateSet()
    console.log('Is date set before comparison:', isDateSet)

    if (!isDateSet) {
      return res.status(400).json({ error: 'No date has been stored yet. Please store a date first.' })
    }

    let tx
    try {
      if (operation === 'greater') {
        tx = await contract.greaterThan(encryptedValue, {
          gasLimit: 500000
        })
      } else {
        tx = await contract.lessThan(encryptedValue, {
          gasLimit: 500000
        })
      }
    } catch (txError) {
      console.error('Transaction failed:', txError)
      return res.status(500).json({ error: 'Transaction failed: ' + txError.message })
    }

    console.log('Transaction sent:', tx.hash)
    const receipt = await tx.wait()
    console.log('Transaction receipt:', receipt)

    // Parse events from the receipt to get the comparison result
    let result = false
    let storedValue = null
    let comparedValue = null

    console.log('Receipt logs:', receipt.logs)

    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        console.log('Raw log:', log)
        try {
          const parsedLog = contract.interface.parseLog(log)
          console.log('Parsed log:', parsedLog)

          if (parsedLog && parsedLog.name === 'ComparisonResult') {
            result = parsedLog.args.result
            console.log('Found ComparisonResult event:', {
              operation: parsedLog.args.operation,
              result: result
            })
            break
          }
        } catch (parseError) {
          console.log('Could not parse log:', parseError.message)
          console.log('Log data:', log.data)
          console.log('Log topics:', log.topics)
        }
      }
    }

    if (result === null) {
      console.log('No ComparisonResult event found, result may be in transaction logs')
      result = 'Transaction completed - check blockchain explorer for events'
    }

    res.json({
      success: true,
      result: result,
      operation: operation,
      date: date,
      daysSinceEpoch: daysSinceEpoch,
      transactionHash: tx.hash
    })

  } catch (error) {
    console.error('Error comparing date:', error)
    res.status(500).json({ error: 'Failed to compare date: ' + error.message })
  }
})

// Initialize and start server
async function startServer() {
  const initialized = await initializeCoti()
  if (!initialized) {
    console.error('Failed to initialize Coti service. Server will start but API calls may fail.')
  }

  app.listen(PORT, () => {
    console.log(`🚀 Coti Date Game Server running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/health`)
  })
}

startServer()