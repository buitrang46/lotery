import { StacksTestnet } from '@stacks/network';
import {
    AnchorMode,
    PostConditionMode,
    TransactionVersion,
    broadcastTransaction,
    callReadOnlyFunction,
    createStacksPrivateKey,
    cvToJSON,
    getAddressFromPrivateKey,
    makeContractCall,
    standardPrincipalCV,
    uintCV
} from '@stacks/transactions';

// Configuration
const NETWORK = new StacksTestnet();
// Derive private key from mnemonic: "sure sphere cancel link soldier lesson dirt grape off adjust endless whip canvas table whisper muffin opera gaze height filter nice antenna stadium soldier"
const PRIVATE_KEY = 'b8d99fd45da58038d630d9855d3ca2466e8e0f89d3894c4724f0efc9ff4b51f001'; // Your wallet private key
const CONTRACT_ADDRESS = 'ST3M4NS2XCB6B10EQF6DX7THB238V4HJ7WTQRA25N'; // Contract deployer address
const CONTRACT_NAME = 'simple-lottery';

// Helper function to create and broadcast transaction
async function callContract(functionName: string, functionArgs: any[] = []) {
  try {
    const privateKey = createStacksPrivateKey(PRIVATE_KEY);
    
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: functionName,
      functionArgs: functionArgs,
      senderKey: privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
    if (broadcastResponse.error) {
      console.error(`❌ ${functionName} failed:`, broadcastResponse.error);
      return null;
    }

    console.log(`✅ ${functionName} successful!`);
    console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
    console.log(`🔗 View on explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);
    
    return broadcastResponse.txid;
  } catch (error) {
    console.error(`❌ Error calling ${functionName}:`, error);
    return null;
  }
}

// Helper function for read-only calls
async function readContract(functionName: string, functionArgs: any[] = []) {
  try {
    const senderAddress = getAddressFromPrivateKey(
      createStacksPrivateKey(PRIVATE_KEY).data,
      TransactionVersion.Testnet
    );

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: functionName,
      functionArgs: functionArgs,
      senderAddress: senderAddress,
      network: NETWORK,
    });

    return cvToJSON(result);
  } catch (error) {
    console.error(`❌ Error reading ${functionName}:`, error);
    return null;
  }
}

// Contract interaction functions

async function startNewRound() {
  console.log('🎯 Starting new lottery round...');
  return await callContract('start-new-round');
}

async function buyTicket() {
  console.log('🎫 Buying lottery ticket...');
  return await callContract('buy-ticket');
}

async function endRound() {
  console.log('🏁 Ending current round...');
  return await callContract('end-round');
}

async function cancelRound() {
  console.log('❌ Cancelling current round...');
  return await callContract('cancel-round');
}

async function getCurrentRound() {
  console.log('📊 Getting current round info...');
  const result = await readContract('get-current-round');
  console.log('Current Round:', JSON.stringify(result, null, 2));
  return result;
}

async function getWinner(round: number) {
  console.log(`🏆 Getting winner for round ${round}...`);
  const result = await readContract('get-winner', [uintCV(round)]);
  console.log(`Round ${round} Winner:`, result);
  return result;
}

async function getPrize(round: number) {
  console.log(`💰 Getting prize for round ${round}...`);
  const result = await readContract('get-prize', [uintCV(round)]);
  console.log(`Round ${round} Prize:`, result);
  return result;
}

async function hasParticipated(userAddress: string) {
  console.log(`🔍 Checking if ${userAddress} participated...`);
  const result = await readContract('has-participated', [standardPrincipalCV(userAddress)]);
  console.log(`Participated:`, result);
  return result;
}

async function getParticipantsCount() {
  console.log('👥 Getting participants count...');
  const result = await readContract('get-participants-count');
  console.log('Participants Count:', result);
  return result;
}

async function getContractBalance() {
  console.log('💳 Getting contract balance...');
  const result = await readContract('get-contract-balance');
  console.log('Contract Balance:', result);
  return result;
}

// Demo flow
async function demoFlow() {
  console.log('🎮 Starting Simple Lottery Demo...\n');

  // 1. Get initial state
  await getCurrentRound();
  await getContractBalance();

  // 2. Start new round (only owner can do this)
  await startNewRound();
  
  // Wait a bit for transaction to process
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Check round status
  await getCurrentRound();

  // 4. Buy ticket
  await buyTicket();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 5. Check participation
  const userAddress = getAddressFromPrivateKey(
    createStacksPrivateKey(PRIVATE_KEY).data,
    TransactionVersion.Testnet
  );
  await hasParticipated(userAddress);
  await getParticipantsCount();

  console.log('\n🎉 Demo completed! Check the explorer links above for transaction details.');
  console.log('💡 Note: You need at least 2 participants to end a round.');
}

// Export functions for manual use
export {
    buyTicket, cancelRound, demoFlow, endRound, getContractBalance, getCurrentRound, getParticipantsCount, getPrize, getWinner, hasParticipated, startNewRound
};

// Run demo if this file is executed directly
if (require.main === module) {
  demoFlow();
}
