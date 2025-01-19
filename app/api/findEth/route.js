import { checkEthereumBalance, createEthereumWallet, generateSeedPhrase } from "@/lib/utils";

export async function GET(req) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Set headers for SSE
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };

  const response = new Response(readable, { headers });

  let searchedWallets = 0;
  let foundWallets = 0;
  let foundWallet = null;
  let searchStopped = false;

  try {
    const sendData = (seedPhrase) => {
      writer.write(`data: {"searchedWallets": ${searchedWallets}, "seedPhrase": "${seedPhrase}"}\n\n`);
    };

    const interval = setInterval(async () => {
      if (searchStopped) return; // Prevent further searches if a wallet is found

      const seedPhrase = generateSeedPhrase();
      searchedWallets++;

      sendData(seedPhrase);
    
      const ethWallet = createEthereumWallet(seedPhrase);

      if (!ethWallet || !ethWallet.address) return;

      const walletBalance = await checkEthereumBalance(ethWallet.address);

      if (walletBalance > 0) {
        foundWallet = {
          seedPhrase,
          walletAddress: ethWallet.address,
          walletBalance,
        };
        foundWallets++;

        writer.write(`data: ${JSON.stringify({ searchedWallets, foundWallet, foundWallets })}\n\n`);
        searchStopped = true;
        clearInterval(interval);
        writer.close();
      }
    }, 80); // Interval of 80ms

  } catch (error) {
    console.error("Error in wallet search:", error);
    if (writer) {
      writer.write(`data: {"error": "An error occurred during the wallet search."}\n\n`);
      writer.close();
    }
  }

  return response;
}
