'use client'

// React Imports
import { useEffect, useState } from 'react'

// Component Imports
import Pricing from '@views/pages/pricing'

// Data Imports
import { getPricingData } from '@/app/server/actions'

const PricePage = () => {
  // Vars
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pricingData = await getPricingData()
        setData(pricingData)
      } catch (error) {
        console.error('Error fetching pricing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return null // Or a loading spinner
  }

  return <Pricing data={data} />
}

export default PricePage
