import { randomBytes } from 'crypto';
import * as bip39  from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { ethers, Mnemonic } from 'ethers';
import axios from 'axios';
import * as bip32 from "bip32";
import { Networks, Address, PublicKey } from "litecore-lib";

// Generate a random 12-word mnemonic phrase (BIP39)
export function generateSeedPhrase() {
  const entropy = randomBytes(16); // Generates 128 bits of entropy (12 words)
  return bip39.entropyToMnemonic(entropy.toString('hex'));
}

// Create a Bitcoin wallet from the seed phrase
export function createBitcoinWallet(seedPhrase) {
    while(!bip39.validateMnemonic(seedPhrase)){
      
        if(bip39.validateMnemonic(seedPhrase)){
            const mnemonic = bip39.mnemonicToSeedSync(seedPhrase); // Convert seed phrase to seed
            const root = bitcoin.bip32.fromseed(mnemonic); // Generate HD wallet from seed
          
            const path = "m/44'/0'/0'/0/0"; // Bitcoin's standard BIP44 path
            const child = root.derivePath(path); // Derive the child key for the wallet address
          
            const { address } = bitcoin.payments.p2pkh({
              pubkey: child.publicKey, // Generate a public address
            });
          
            return { address, privateKey: child.toWIF() }; // Return Bitcoin address
        }
        return
    }
}




export function createEthereumWallet(seedPhrase) {
    while(!Mnemonic.isValidMnemonic(seedPhrase)){

        if (Mnemonic.isValidMnemonic(seedPhrase)) {
            console.log('found one')
            const wallet = ethers.Wallet.fromMnemonic(seedPhrase); // Generate Ethereum wallet from mnemonic
            return { address: wallet.address, privateKey: wallet.privateKey }; // Return Ethereum address
            
        }
      return
    }
  }




// Function to check the Bitcoin balance using a public API
export async function checkBitcoinBalance(address) {
  try {
    const response = await axios.get(`https://blockchain.info/q/addressbalance/${address}`);
    return response.data / 100000000; // Convert satoshis to BTC
  } catch (error) {
    console.error("Error checking Bitcoin balance:", error);
    return null;
  }
}




// Function to check the Ethereum balance
export async function checkEthereumBalance(address) {
  try {
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance); // Convert from wei to ether
  } catch (error) {
    console.error("Error checking Ethereum balance:", error);
    return null;
  }
}

const network = Networks.livenet;

export function createLitecoinWallet(seedPhrase) {
    // Step 1: Validate the seed phrase
   while(!bip39.validateMnemonic(seedPhrase)) {
     if(bip39.validateMnemonic(seedPhrase)){
        try {
       // Step 2: Generate a seed from the mnemonic
       const seed = bip39.mnemonicToSeedSync(seedPhrase);
   
       // Step 3: Create an HD wallet from the seed using bip32
        
       const root = bip32.fromSeed(seed, network);
   
       // Step 4: Derive the first account's external chain (m/44'/2'/0'/0/0 for Litecoin)
       const path = "m/44'/2'/0'/0/0"; // Litecoin BIP44 derivation path
       const childNode = root.derivePath(path);
   
       // Step 5: Generate Litecoin address
       const privateKey = childNode.privateKey.toString("hex");
       const publicKey = childNode.publicKey.toString("hex");
   
       // Set Litecoin network for the address
       const litecoinNetwork = Networks.livenet;
   
       // Generate Litecoin address
       const address = Address.fromPublicKey(
         PublicKey.fromBuffer(childNode.publicKey),
         litecoinNetwork
       ).toString();
   
       // Return the wallet details
       return {
         seedPhrase,
         address,
         privateKey,
         publicKey,
       };
      } catch (error) {
        console.error("Error creating Litecoin wallet:", error);
        return null;
      }
     }
  }
}

export async function checkLitecoinBalance(address) {
  try {
    const network = "LTC"; // Network for Litecoin
    const url = `https://sochain.com/api/v2/get_address_balance/${network}/${address}`;

    const response = await axios.get(url);

    if (response.data && response.data.status === "success") {
      const balance = response.data.data.confirmed_balance;
      return parseFloat(balance); // Return balance as a float
    } else {
      console.error("Failed to fetch balance:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error checking Litecoin balance:", error);
    return null;
  }
}