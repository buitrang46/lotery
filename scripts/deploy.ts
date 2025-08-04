import { 
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as fs from 'fs';

// Configuration
const NETWORK = new StacksTestnet();
const PRIVATE_KEY = 'your-private-key-here'; // Replace with actual private key
const CONTRACT_NAME = 'simple-lottery';

async function deployContract() {
  try {
    console.log('🚀 Starting deployment of Simple Lottery contract...');

    // Read contract source
    const contractSource = fs.readFileSync('./contracts/simple-lottery.clar', 'utf8');
    
    // Create private key and get address
    const privateKey = createStacksPrivateKey(PRIVATE_KEY);
    const senderAddress = getAddressFromPrivateKey(privateKey.data, TransactionVersion.Testnet);
    
    console.log(`📍 Deploying from address: ${senderAddress}`);

    // Create contract deploy transaction
    const txOptions = {
      contractName: CONTRACT_NAME,
      codeBody: contractSource,
      senderKey: privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractDeploy(txOptions);
    
    console.log('📝 Transaction created, broadcasting...');

    // Broadcast transaction
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
    if (broadcastResponse.error) {
      console.error('❌ Deployment failed:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      return;
    }

    console.log('✅ Contract deployed successfully!');
    console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
    console.log(`🔗 Contract Address: ${senderAddress}.${CONTRACT_NAME}`);
    console.log(`🌐 View on explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);

    // Save contract address to file
    const contractAddress = `${senderAddress}.${CONTRACT_NAME}`;
    fs.writeFileSync('./contract-address.txt', contractAddress);
    console.log('💾 Contract address saved to contract-address.txt');

  } catch (error) {
    console.error('❌ Deployment error:', error);
  }
}

// Run deployment
deployContract();
