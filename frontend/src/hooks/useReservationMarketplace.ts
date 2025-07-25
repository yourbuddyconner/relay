import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { getContractAddresses } from '@/config/chains'
import marketplaceAbi from '@/contracts/abis/ReservationMarketplace.json'

export function useReservationMarketplace() {
  const addresses = getContractAddresses()
  const abi = marketplaceAbi.abi

  // Write functions
  const { writeContract: listReservation, data: listTxHash } = useWriteContract()
  const { writeContract: createOrder, data: createOrderTxHash } = useWriteContract()
  const { writeContract: executeCancellation, data: cancelTxHash } = useWriteContract()
  const { writeContract: claimReservation, data: claimTxHash } = useWriteContract()

  // Transaction receipts
  const { isLoading: isListLoading, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listTxHash,
  })
  
  const { isLoading: isOrderLoading, isSuccess: isOrderSuccess } = useWaitForTransactionReceipt({
    hash: createOrderTxHash,
  })

  // Read functions - only execute if addresses are available
  const { data: listingFee } = useReadContract({
    address: addresses?.reservationMarketplace,
    abi,
    functionName: 'LISTING_FEE_BPS',
    query: {
      enabled: !!addresses,
    }
  }) as { data: bigint | undefined }

  const { data: successFee } = useReadContract({
    address: addresses?.reservationMarketplace,
    abi,
    functionName: 'SUCCESS_FEE_BPS',
    query: {
      enabled: !!addresses,
    }
  }) as { data: bigint | undefined }

  const { data: buyerDepositMultiplier } = useReadContract({
    address: addresses?.reservationMarketplace,
    abi,
    functionName: 'BUYER_DEPOSIT_MULTIPLIER',
    query: {
      enabled: !!addresses,
    }
  }) as { data: bigint | undefined }

  // Helper functions
  const calculateListingFee = (price: bigint) => {
    if (!listingFee) return BigInt(0)
    return (price * listingFee) / BigInt(10000)
  }

  const calculateBuyerDeposit = (price: bigint) => {
    if (!buyerDepositMultiplier) return BigInt(0)
    return (price * buyerDepositMultiplier) / BigInt(100)
  }

  // Contract interaction functions
  const list = async (proof: any, price: string, expiry: number) => {
    if (!addresses) {
      throw new Error('Contract addresses not configured. Please check your environment variables.')
    }
    
    const priceWei = parseEther(price)
    const fee = calculateListingFee(priceWei)
    
    return listReservation({
      address: addresses.reservationMarketplace,
      abi,
      functionName: 'listReservation',
      args: [proof, priceWei, BigInt(expiry)],
      value: fee,
    })
  }

  const buy = async (listingId: string, coordinationTime: number, price: string) => {
    if (!addresses) {
      throw new Error('Contract addresses not configured. Please check your environment variables.')
    }
    
    const priceWei = parseEther(price)
    const deposit = calculateBuyerDeposit(priceWei)
    
    return createOrder({
      address: addresses.reservationMarketplace,
      abi,
      functionName: 'createOrder',
      args: [listingId as `0x${string}`, BigInt(coordinationTime)],
      value: deposit,
    })
  }

  const cancel = async (orderId: string, proof: any) => {
    if (!addresses) {
      throw new Error('Contract addresses not configured. Please check your environment variables.')
    }
    
    return executeCancellation({
      address: addresses.reservationMarketplace,
      abi,
      functionName: 'executeCancellation',
      args: [orderId as `0x${string}`, proof],
    })
  }

  const claim = async (orderId: string, proof: any) => {
    if (!addresses) {
      throw new Error('Contract addresses not configured. Please check your environment variables.')
    }
    
    return claimReservation({
      address: addresses.reservationMarketplace,
      abi,
      functionName: 'claimReservation',
      args: [orderId as `0x${string}`, proof],
    })
  }

  return {
    // Write functions
    list,
    buy,
    cancel,
    claim,
    
    // Transaction states
    isListLoading,
    isListSuccess,
    isOrderLoading,
    isOrderSuccess,
    
    // Read data
    listingFee,
    successFee,
    buyerDepositMultiplier,
    
    // Helper functions
    calculateListingFee,
    calculateBuyerDeposit,
  }
} 