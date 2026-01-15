# secure-voting-system
## Blockchain-Based E-Voting System

This project represents my Bachelor’s thesis and proposes an electronic voting system built on a private Ethereum blockchain, aiming to improve transparency, security, and auditability in the vote counting process.

## Core Idea

Instead of focusing on online citizen voting, the system targets the secure transmission and aggregation of election results. Vote counts generated at polling stations are recorded immutably on a permissioned blockchain, creating a tamper-resistant audit trail from the local to the national level.

## Architecture & Implementation

- Private Ethereum network configured using **Geth**
- **Clique – Proof of Authority (PoA)** consensus for low latency and predictable block times
- Multi-node setup with validator and non-validator nodes
- **Smart contract** responsible for:
  - registering polling station results
  - preventing result modification
  - aggregating and auditing votes
- Gas-optimized transactions for high throughput
- Hierarchical data flow: **polling station → regional server → national server**

## Tech Stack

- **Blockchain:** Ethereum (private network)
- **Client:** Geth
- **Consensus:** Clique (PoA)
- **Smart Contracts:** Solidity
- **Development Framework:** Hardhat
- **Backend / Scripts:** Typescript
- **Communication:** JSON-RPC, Web3

## Outcome

The project demonstrates how blockchain can be used as a secure and verifiable audit layer for elections, providing:

- data integrity  
- full traceability  
- fast vote aggregation  
- reduced human intervention in result centralization  
