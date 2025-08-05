# Simple Lottery
# Contract Addresses: ST3M4NS2XCB6B10EQF6DX7THB238V4HJ7WTQRA25N.simple-lottery

## Description
Simple Lottery is a simple and transparent lottery smart contract on the Stacks blockchain. Users can buy lottery tickets, the system automatically selects winning numbers and distributes prizes fairly.

## Main Features
- **Buy Tickets**: Users buy lottery tickets with STX
- **Random Winner**: The system automatically selects winners
- **Prize Distribution**: Automatic prize distribution
- **Multiple Rounds**: Supports multiple consecutive spins
- **Transparent**: All transactions are transparent on the blockchain

## Project Structure
```
simple_lottery/
├── contracts/
│ └── simple-lottery.clar # Main lottery contract
├── tests/
│ └── simple-lottery_test.ts # Unit tests
├── scripts/
│ └── deploy.ts # Deployment script
├── Clarinet.toml # Clarinet configuration
├── package.json # Dependencies
└── README.md # Documentation
```

## How to use

### 1. Buy lottery tickets
```clarity
(contract-call? .simple-lottery buy-ticket)
```

### 2. Check current round information
```clarity
(contract-call? .simple-lottery get-current-round)
```

### 3. View winner history
```clarity
(contract-call? .simple-lottery get-winner u1) ;; round 1
```

### 4. Admin Functions
```clarity
;; End round and choose winner
(contract-call? .simple-lottery end-round)

;; Start New Round
(contract-call? .simple-lottery start-new-round)
```

## Specifications
- **Ticket Price**: 1 STX per ticket
- **Prize Pool**: 80% of total ticket sales
- **House Fee**: 20% for contract owner
- **Min Participants**: Minimum 2 people per round
- **Random Selection**: Use block hash to generate random numbers

## Game Flow
1. **Start Round**: Admin starts new round
2. **Buy Tickets**: Users buy tickets within the allowed time
3. **End Round**: Admin ends round and selects winner
4. **Prize Distribution**: Automatically transfer prize money to winner
5. **New Round**: Start new round

## Benefits
1. **Simple**: Clear logic, easy to understand
2. **Transparent**: All on blockchain, no cheating
3. **Automatic**: Distribute prizes automatically
4. **Fair**: Use block hash to randomize
5. **Efficient**: Optimized code, save gas

## Security Features
- Only admin can start/end rounds
- Cannot buy tickets after round ends
- Automatically validate minimum number of participants
- Safe math to avoid overflow

## Deployment
1. Clone repository
2. Run `npm install`
3. Configure Clarinet settings
4. Deploy with `clarinet deploy`

## Testing
```bash
npm test
```
