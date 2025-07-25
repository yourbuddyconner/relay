'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useBlockNumber } from 'wagmi'
import { formatEther } from 'viem'
import { getContractAddresses } from '@/config/chains'

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString())
  const addresses = getContractAddresses()

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Test accounts (Anvil default accounts)
  const testAccounts = [
    { name: 'Account 0', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' },
    { name: 'Account 1', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' },
    { name: 'Account 2', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' },
  ]

  const generateTestReservation = () => {
    const platforms = ['opentable', 'resy']
    const restaurants = ['The French Laundry', 'Eleven Madison Park', 'Noma', 'Osteria Francescana']
    const times = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
    
    return {
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      restaurant: restaurants[Math.floor(Math.random() * restaurants.length)],
      date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: times[Math.floor(Math.random() * times.length)],
      partySize: Math.floor(Math.random() * 6) + 2,
      price: (Math.random() * 500 + 50).toFixed(2),
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 z-50"
      >
        {isOpen ? 'Close' : 'Dev Tools'}
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-40 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Development Tools</h3>
          
          {/* Chain Info */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Chain Info</h4>
            <div className="text-sm space-y-1">
              <p>Block: {blockNumber?.toString() || 'Loading...'}</p>
              <p>Time: {timestamp}</p>
              <p>Chain ID: 31337 (Anvil)</p>
            </div>
          </div>

          {/* Account Info */}
          {address && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Current Account</h4>
              <div className="text-sm space-y-1">
                <p className="truncate">Address: {address}</p>
                <p>Balance: {balance ? formatEther(balance.value) : '0'} ETH</p>
              </div>
            </div>
          )}

          {/* Contract Addresses */}
          {addresses && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Contract Addresses</h4>
              <div className="text-xs space-y-1 font-mono">
                <p className="truncate">Marketplace: {addresses.reservationMarketplace}</p>
                <p className="truncate">Escrow: {addresses.reservationEscrow}</p>
                <p className="truncate">Verifier: {addresses.reservationVerifier}</p>
              </div>
            </div>
          )}

          {/* Test Accounts */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Test Accounts</h4>
            <div className="space-y-2">
              {testAccounts.map((account, i) => (
                <div key={i} className="text-xs">
                  <p className="font-semibold">{account.name}</p>
                  <p className="truncate">Address: {account.address}</p>
                  <details className="cursor-pointer">
                    <summary>Show private key</summary>
                    <p className="truncate text-red-600">{account.privateKey}</p>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* Test Data Generator */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Test Data Generator</h4>
            <button
              onClick={() => {
                const data = generateTestReservation()
                console.log('Generated test reservation:', data)
                alert(`Generated test reservation:\n${JSON.stringify(data, null, 2)}`)
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Generate Test Reservation
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  // This would need to be implemented with a backend service
                  console.log('Mine block requested')
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 w-full"
              >
                Mine Block
              </button>
              <button
                onClick={() => {
                  // This would need to be implemented with a backend service
                  console.log('Advance time requested')
                }}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 w-full"
              >
                Advance Time +1 Hour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 