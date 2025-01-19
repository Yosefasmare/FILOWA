'use client'

import { useEffect, useState } from 'react'
import CryptoButton from './CryptoButton'
import { FaEthereum } from "react-icons/fa";
import { FaBitcoin } from "react-icons/fa";
import { SiLitecoin } from "react-icons/si";


const CryptoChooser = ({setChoosedCurrency,choosedCurrency}) => {

 


  useEffect(() => {
    // Check if there's a currency stored in localStorage when the component mounts
    const storedCurrency = localStorage.getItem('ChoosedCurrency')
    if (storedCurrency) {
      setChoosedCurrency(storedCurrency)
    }
  }, []) 

  useEffect(() => {
    // Whenever currency changes, update localStorage
    if (choosedCurrency) {
      localStorage.setItem('ChoosedCurrency', choosedCurrency)
    }
  }, [choosedCurrency])

    const cryptoCurrencies =[ 
        {name: 'BTC', icon: <FaBitcoin color='gold' size={30} />, bg:'bg-orange-500', active: choosedCurrency === 'BTC' ? 'bg-orange-200 text-gray-900  scale-110 border-4 border-white' : 'text-white'},
        {name: 'ETH', icon: <FaEthereum color='#3C3C3D' size={30} />,bg:'bg-teal-500', active: choosedCurrency === 'ETH' ? 'bg-teal-200 text-gray-900  scale-110 border-4 border-white' : 'text-white'},
        {name: 'LTC', icon: <SiLitecoin color='#BFBBBB.' size={30} />,bg:'bg-blue-500', active: choosedCurrency === 'LTC' ? 'bg-teal-200 text-gray-900  scale-110 border-4 border-white' : 'text-white'},
       ]


  return (
 <div className="w-full flex gap-4   p-2 justify-center ">
    {cryptoCurrencies.map((crypto)=>(
     <CryptoButton  setCurrency={setChoosedCurrency}  key={crypto.name} name={crypto.name} icon={crypto.icon}  bg={crypto.bg} active={crypto.active}/>
    ))}
</div>
  )
}

export default CryptoChooser
