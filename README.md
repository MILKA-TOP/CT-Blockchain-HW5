# ДЗ №5 К занятию “Solidity, typical patterns”

## Выполнил работу Миленин Иван (M33351)


**Задание:**

- Write simple voting contract and cover with tests
- Description
    - A pack of contracts that allows users to vote for proposals, using token balances. Users own an ERC20 token, representing “voting power” or DAO ownership shares. Proposals are simply the keccak256 hashes and can be “accepted”, “rejected” or “discarded” (if TTL of proposal is expired). The fact of acceptance of a proposal is fixed in the event, nothing else is stored in contracts.
- User story
    - A,B,C have 25, 40 and 35 voting tokens of total 100. “A “creates a proposal (text document, having hash) and publishes this hash in contract, voting with her 25 tokens “for” it. Then B also votes “yes” with his 40 tokens. So, 25+40 > 50% of total votes (100), proposal is accepted: event is fired, proposal is removed from queue. Same situation with proposals when > 50% of “no” votes is gathered. If a proposal stays in an indefinite state (no threshold votes gathered) until TTL expires, it cannot be “accepted” or “declined” and will be thrown away with “discarded” status next time when a new proposal is created.
    - [NOTE] business logic can slightly differ in your implementation if needed
- Requirements
    - Business logic requirements:
        - During creation totalSupply = 100.000000 (decimals = 6) tokens are minted to contract owner
        - Any owner of voting tokens can create a proposal, time-to-live(TTL) of proposal is 3 days, after that time proposal becomes “discarded” if not enough votes are gathered
        - Votes can be “for” or ”against” the proposal. Proposal becomes “accepted” or “declined” completed if > 50% of votes for the same decision (“for” or “against”) is gathered
        - When votes threshold is reached, event is emitted and proposal is removed from queue
        - There are no more than N=3 current proposals, new proposals cannot be added until old ones will be “accepted”, “declined” or “discarded” by TTL
        - If > 1 old proposals are obsolete, then addition of a new proposal automatically “kicks out” the most obsolete proposal, making it “discarded”.
        - voting should not “freeze” tokens
        - but, voting should handle a situation, when voter transfers his tokens to another address and votes another time

___________________

## Запуск

Для запуска необходимо прописать следующую команду

```
$  npx hardhat test test/Token.js
```
___________________

## О коде:
Я решил сделать отдельную монету, которая будет характеризовать количество голосов того или иного человека. Также сделан контракт, позволяющий произвоить 
голосования. Основными его функциями являются `function createNewProposal(uint256 hashId)`,`function makeAgreeVotes(uint256 hashId)`,`function makeRejectVotes(uint256 hashId)`.

## Пример вывода:

```
$  npx hardhat test test/Token.js


  Token contract
    Voting
      √ One Propose | Accept | By votes (154ms)
      √ One Propose | Reject | By votes (111ms)
      √ Two Propose | (Accept | Disabled) | (By votes | By time) (195ms)
      √ Three Propose | (Disabled | Disabled | Disabled) | By time | By time | By time) (282ms)
      √ Foure Propose | Correct | After delay (247ms)
      √ Foure Propose | Incorrect | Without delay (173ms)


  6 passing (4s)
```

