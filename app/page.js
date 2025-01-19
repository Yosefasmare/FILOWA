'use client'

import { useEffect, useState } from "react";
import CryptoChooser from "@/components/CryptoChooser";
import Timer from "@/components/Timer";

export default function Home() {
  const [searchedWallets, setSearchedWallets] = useState(0);
  const [foundWallets, setFoundWallets] = useState([]);
  const [foundWalletNumber, setFoundWalletNumber] = useState(0)
  const [choosedCurrency, setChoosedCurrency] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [phrases, setPhrases] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [running, setRunning] = useState(false);
  
  // Reference to the EventSource instance
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const storedCurrency = localStorage.getItem('ChoosedCurrency');
      setChoosedCurrency(storedCurrency);  // Update the state with the value from localStorage
    }
  }, [choosedCurrency]);

  const startSearch = () => {
    if (!choosedCurrency) {
      alert('Please choose a currency first');
      return;
    } else {
      setIsSearching(true);
      let newEventSource;

      if (choosedCurrency === 'BTC') {
        newEventSource = new EventSource('/api/findBTCWallet');
      } else if (choosedCurrency === 'ETH') {
        newEventSource = new EventSource('/api/findEth');
      }  else if (choosedCurrency === 'LTC') {
        newEventSource = new EventSource('/api/findLtc');
      }else {
        alert('Error: Unsupported currency');
        return;
      }
          try {
             // Set the EventSource to the state
      setEventSource(newEventSource);

      // Event listener for when data is received
      newEventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        // Process searchedWallets and foundWallet data
        if (data.searchedWallets) {
          setSearchedWallets(data.searchedWallets);
        }
        if (data.seedPhrase) {
          setPhrases((prevPh) => [data.seedPhrase, ...prevPh]);
        }

        if (data.foundWallet || data.foundWallets > 0) {
          setFoundWallets(data.foundWallet);  // Store foundWallets directly (not stringified)
          setFoundWalletNumber(data.foundWallets)
          setIsSearching(false);

          newEventSource.close(); // Close the SSE connection once found
        }
      };


      setRunning(true)
          } catch (error) {
            newEventSource.onerror = function (error) {
              console.error("Error with SSE:", error);
              newEventSource.close(); // Close the connection if there's an error
              setIsSearching(false);
              setTimeout(() => {
                startSearch(); // Retry logic
              }, 5000);
            };
            alert(error)
           
          }
      

      // Error handling for the EventSource
    }
  };

  // Stop the search by closing the EventSource
  const stopSearch = () => {
    if (isSearching && eventSource && eventSource.readyState !== EventSource.CLOSED) {
      try {
        eventSource.close(); // Close the EventSource connection
        console.log("EventSource connection closed.");
        setIsSearching(false); // Update the search state
        setSeconds(0);
        setMinutes(0);
        setHours(0);
        setRunning(false);
      } catch (error) {
        console.error("Error while stopping search:", error);
      }
    } else if (!isSearching) {
      alert("Search is already stopped.");
    } else {
      alert("First start the search.");
    }
  };
    
 
  return (
    <div className="w-full p-3 py-5 flex">
      <div className="w-full p-3 py-5 flex flex-col items-center  lg:w-2/5">
      <h1 className="font-extrabold text-4xl font-serif lg:text-5xl md:text-4xl text-orange-500">FILOWA Search</h1>
         <CryptoChooser setChoosedCurrency={setChoosedCurrency} choosedCurrency={choosedCurrency} />
        <div className="w-full flex flex-col px-7 py-4 gap-3 lg:hidden" >
            <h2 className="text-white font-semibold text-xl md:text-2xl lg:text-3xl ">Checked Wallets: <span className="text-orange-400">{searchedWallets}</span> </h2>
            <div className="w-full  h-[350px] border rounded-lg overflow-x-hidden overflow-y-scroll  flex flex-col gap-2  " style={{scrollbarWidth: 'none'}}>
            {phrases.map((phrase)=>(
                 <div key={phrase}  className="flex text-white p-2 items-center">
                     <h3 className="px-3 flex">Balance: <span className="text-orange-300 text-xl">0</span></h3>
                     <span>{phrase}</span>
                 </div>

            ))}
            </div>
        </div>
        <div className="flex justify-around items-center px-2 py-3 gap-9 lg:hidden">
            <button
             onClick={()=>stopSearch()}
               className="px-14 py-3 border-2 border-orange-700 rounded-2xl text-white bg-red-700 text-lg font-bold transition ease-in-out hover:bg-red-400"
               >stop</button>
            <button
             onClick={()=>startSearch()}
              className="px-14 py-3 border-2 border-teal-700 rounded-2xl text-white bg-teal-700 text-lg font-bold transition ease-in-out hover:bg-teal-400" 
              disabled={isSearching}
              >{!isSearching ? 'search' : <Timer
                seconds={seconds}
                setSeconds={setSeconds}
                minutes={minutes}
                setMinutes={setMinutes}
                hours={hours}
                setHours={setHours}
                running={running}
               />}</button>
        </div>

        <div className="w-full flex flex-col px-2 py-4 gap-3 overflow-x-hidden overflow-y-scroll" style={{scrollbarWidth: 'none'}}>
            <h2 className="text-white font-semibold text-xl md:text-2xl lg:text-3xl ">Found Wallets: <span className="text-orange-400">{foundWalletNumber}</span> </h2>
            <div className="w-full h-[250px] border rounded-lg overflow-x-hidden overflow-y-scroll  flex flex-col gap-2  " style={{scrollbarWidth: 'none'}}>
                {foundWallets && foundWallets.map((foundWallet,idx)=>(
                 <div key={idx} className="flex text-white p-2 items-center">
                     <h3 className="px-3 flex">Balance: <span className="text-orange-300 text-xl">{foundWallet.walletBalance}</span></h3>
                     <span> {foundWallet.seedPhrase}  </span>
                     <span>{foundWallet.walletAddress}</span>
                 </div>

                ))}

            </div>
        </div>
      </div>
      <div className="w-3/5 lg:flex flex-col  hidden ">
      <div className="w-full flex flex-col px-7 py-4 gap-3 " >
            <h2 className="text-white font-semibold text-xl md:text-2xl lg:text-3xl ">Checked Wallets: <span className="text-orange-400">{searchedWallets}</span> </h2>
            <div className="w-full h-[350px] border rounded-lg overflow-x-hidden overflow-y-scroll  flex flex-col gap-2  " style={{scrollbarWidth: 'none'}}>
            {phrases.map((phrase)=>(
                 <div key={phrase}  className="flex text-white p-2 items-center">
                     <h3 className="px-3 flex">Balance: <span className="text-orange-300 text-xl">0</span></h3>
                     <span>{phrase}</span>
                 </div>

            ))}

            </div>
        </div>
        <div className="flex justify-around items-center px-2 py-3 gap-5">
            <button
             onClick={()=>stopSearch()}
             className="px-14 py-3 border-2 border-orange-700 rounded-2xl text-white bg-red-700 text-lg font-bold transition ease-in-out hover:bg-red-400"
             >stop</button>
            <button
             onClick={()=>startSearch()}
             className={`px-14 py-3 border-2 border-teal-700 rounded-2xl text-white bg-teal-700 text-lg font-bold transition ease-in-out hover:bg-teal-400 ${isSearching & ''}`} 
             disabled={isSearching}
             >{!isSearching ? 'search' : <Timer
              seconds={seconds}
              setSeconds={setSeconds}
              minutes={minutes}
              setMinutes={setMinutes}
              hours={hours}
              setHours={setHours}
              running={running}
             />}</button>
        </div>

      </div>

          
    </div>
  );
}
