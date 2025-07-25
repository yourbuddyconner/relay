import { useState } from 'react'

const RELAYER_URL = process.env.NEXT_PUBLIC_MOCK_RELAYER_URL || 'http://localhost:3001'

export interface EmailSubmission {
  from: string
  to: string
  subject: string
  body: string
  headers?: any
}

export interface TestProofRequest {
  platform: string
  restaurant_name: string
  party_size?: number
  reservation_type: 'confirmation' | 'cancellation' | 'newbooking'
}

export function useMockRelayer() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitEmail = async (email: EmailSubmission) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${RELAYER_URL}/api/v1/email/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to submit email: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async (id: string) => {
    try {
      const response = await fetch(`${RELAYER_URL}/api/v1/email/status/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const getProof = async (emailHash: string) => {
    try {
      const response = await fetch(`${RELAYER_URL}/api/v1/proof/${emailHash}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get proof: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const generateTestProof = async (request: TestProofRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${RELAYER_URL}/api/v1/test/generate-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate test proof: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const response = await fetch(`${RELAYER_URL}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  return {
    submitEmail,
    checkStatus,
    getProof,
    generateTestProof,
    checkHealth,
    isLoading,
    error,
  }
} 