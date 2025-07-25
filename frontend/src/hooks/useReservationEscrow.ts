import { useReadContract } from 'wagmi'
import { getContractAddresses } from '@/config/chains'
import escrowAbi from '@/contracts/abis/ReservationEscrow.json'

export interface Listing {
  seller: string
  reservationHash: string
  price: bigint
  escrowAmount: bigint
  expiry: bigint
  status: number
  platform: string
}

export interface Order {
  buyer: string
  listingId: string
  depositAmount: bigint
  coordinationTime: bigint
  claimDeadline: bigint
  status: number
}

export enum ListingStatus {
  Active = 0,
  Matched = 1,
  Completed = 2,
  Cancelled = 3
}

export enum OrderStatus {
  Pending = 0,
  Coordinating = 1,
  Claiming = 2,
  Settled = 3,
  Failed = 4
}

export function useReservationEscrow() {
  const addresses = getContractAddresses()
  
  if (!addresses) {
    throw new Error('Contract addresses not found. Please deploy contracts first.')
  }

  const abi = escrowAbi.abi

  // Read listing details
  const useListing = (listingId: string) => {
    const { data, isLoading, error } = useReadContract({
      address: addresses.reservationEscrow,
      abi,
      functionName: 'listings',
      args: [listingId as `0x${string}`],
    })

    if (!data) return { listing: null, isLoading, error }

    const [seller, reservationHash, price, escrowAmount, expiry, status, platform] = data as any[]

    const listing: Listing = {
      seller,
      reservationHash,
      price,
      escrowAmount,
      expiry,
      status,
      platform,
    }

    return { listing, isLoading, error }
  }

  // Read order details
  const useOrder = (orderId: string) => {
    const { data, isLoading, error } = useReadContract({
      address: addresses.reservationEscrow,
      abi,
      functionName: 'orders',
      args: [orderId as `0x${string}`],
    })

    if (!data) return { order: null, isLoading, error }

    const [buyer, listingId, depositAmount, coordinationTime, claimDeadline, status] = data as any[]

    const order: Order = {
      buyer,
      listingId,
      depositAmount,
      coordinationTime,
      claimDeadline,
      status,
    }

    return { order, isLoading, error }
  }

  return {
    useListing,
    useOrder,
    ListingStatus,
    OrderStatus,
  }
} 