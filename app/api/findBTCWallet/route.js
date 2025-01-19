import { checkBitcoinBalance, createBitcoinWallet, generateSeedPhrase } from "@/lib/utils";

export async function GET(req) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Set headers for SSE (Server-Sent Events)
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };

  const response = new Response(readable, { headers });

  let searchedWallets = 0;
  let foundWallets = 0;
  let foundWallet = null;

  try {
    // Function to send data to the client
    const sendData = (seedPhrase) => {
      writer.write(`data: {"searchedWallets": ${searchedWallets}, "seedPhrase": "${seedPhrase}"}\n\n`);
    };

    // Interval to check wallets every 120ms
    const interval = setInterval(async () => {
      const seedPhrase = generateSeedPhrase();
      searchedWallets++;

      sendData(seedPhrase);

      // Generate the Bitcoin wallet
      const btcWallet = createBitcoinWallet(seedPhrase);
      if (!btcWallet || !btcWallet.address) {
        return; // Skip if wallet generation fails or address is missing
      }

      // Check the Bitcoin wallet balance
      const walletBalance = await checkBitcoinBalance(btcWallet.address);

      console.log(`Checked wallet: ${btcWallet.address} - Balance: ${walletBalance}`);

      if (walletBalance >= 0) {  // Can be positive or zero balance
        foundWallet = { seedPhrase, walletAddress: btcWallet.address, walletBalance };
        foundWallets++;

        // Send the found wallet data to the client
        writer.write(`data: ${JSON.stringify({ searchedWallets, foundWallet, foundWallets })}\n\n`);

        // Clear the interval and close the stream once the wallet is found
        clearInterval(interval);
        writer.close(); // Stop streaming after a wallet is found
      }

    }, 120);  // Continue searching every 120ms

  } catch (error) {
    console.error("Error in wallet search:", error);
    writer.write(`data: {"error": "An error occurred during the wallet search."}\n\n`);
    writer.close();
  }

  return response;
}
