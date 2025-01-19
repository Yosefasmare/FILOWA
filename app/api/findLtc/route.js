import { checkLitecoinBalance, createLitecoinWallet, generateSeedPhrase } from "@/lib/utils";

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

  // Keep track of the number of wallets searched
  let searchedWallets = 0;
  let foundWallets = 0;
  let foundWallet = null;

  try {
    // Create a function to send data to the client
    const sendData = (seedPhrase) => {
      writer.write(`data: {"searchedWallets": ${searchedWallets}, "seedPhrase": "${seedPhrase}"}\n\n`);
    };

    // Interval that sends data every 100ms
    const interval = setInterval(async () => {
      const seedPhrase = generateSeedPhrase();
      searchedWallets++;

      sendData(seedPhrase);

        const ltcWallet = createLitecoinWallet(seedPhrase);
        if (!ltcWallet || !ltcWallet.address) return; // Skip if wallet generation failed or address is missing

        const walletBalance = await checkLitecoinBalance(ltcWallet.address);

        if (walletBalance > 0 || walletBalance === 0) {
          foundWallet = {
            seedPhrase,
            walletAddress: ltcWallet.address,
            walletBalance,
          };
          foundWallets++;

          writer.write(`data: ${JSON.stringify({ searchedWallets, foundWallet, foundWallets })}\n\n`);
          clearInterval(interval); // Stop the interval once the wallet is found
          writer.close(); // Close the writer and stop streaming
        }
    
    }, 50);  // Adjusted interval to 100ms

  } catch (error) {
    console.error("Error in wallet search:", error);
    writer.write(`data: {"error": "An error occurred during the wallet search."}\n\n`);
    writer.close();
  }

  return response;
}
