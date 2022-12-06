
const { expect } = require("chai");
const { time }   = require("@nomicfoundation/hardhat-network-helpers");

describe("Token contract", function () {

  let Token;
  let milkaCoin;
  let milkaVote;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let dec = 1000000;
  let DELAY = 4 * 24 * 60 * 60;


  beforeEach(async function () {
    Token = await ethers.getContractFactory("MilkaCoin");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();


    milkaCoin = await Token.deploy();

    await milkaCoin.transfer(addr1.address, 25 * dec);
    await milkaCoin.transfer(addr2.address, 40 * dec);
    await milkaCoin.transfer(addr3.address, 35 * dec);


    expect(await milkaCoin.balanceOf(addr1.address)).to.equal(25 * dec);
    expect(await milkaCoin.balanceOf(addr2.address)).to.equal(40 * dec);
    expect(await milkaCoin.balanceOf(addr3.address)).to.equal(35 * dec);
    await milkaCoin.deployed();

    const Voting = await ethers.getContractFactory("MilkaVote");
    milkaVote = await Voting.deploy(milkaCoin.address);
  });

  describe("Voting", function () {
    it("One Propose | Accept | By votes", async function () {
      
      let propId = 100;

      await expect(milkaVote.connect(addr1).createNewProposal(propId)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId);
      
        await expect(milkaVote.connect(addr1).makeAgreeVotes(propId)).not.to
        .emit(milkaVote, 'AcceptedProposal')
        .withArgs(propId);

      await expect(milkaVote.connect(addr3).makeAgreeVotes(propId)).to
        .emit(milkaVote, 'AcceptedProposal')
        .withArgs(propId);
    });

    it("One Propose | Reject | By votes", async function () {
      
      let propId = 101;

      await expect(milkaVote.connect(addr1).createNewProposal(propId)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId);
      
        await expect(milkaVote.connect(addr1).makeRejectVotes(propId)).not.to
        .emit(milkaVote, 'RejectedProposal')
        .withArgs(propId);

      await expect(milkaVote.connect(addr3).makeRejectVotes(propId)).to
        .emit(milkaVote, 'RejectedProposal')
        .withArgs(propId);
    });



    it("Two Propose | (Accept | Disabled) | (By votes | By time)", async function () {
      
      let propId1 = 102;
      let propId2 = 103;

      await expect(milkaVote.connect(addr1).createNewProposal(propId1)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId1);

      await expect(milkaVote.connect(addr1).createNewProposal(propId2)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId2);
      
      await expect(milkaVote.connect(addr1).makeAgreeVotes(propId1)).not.to
        .emit(milkaVote, 'AcceptedProposal')
        .withArgs(propId1);

      await expect(milkaVote.connect(addr2).makeRejectVotes(propId2)).not.to
        .emit(milkaVote, 'RejectedProposal')
        .withArgs(propId2);

      await expect(milkaVote.connect(addr3).makeAgreeVotes(propId1)).to
        .emit(milkaVote, 'AcceptedProposal')
        .withArgs(propId1);

      await time.increase(DELAY);

      await expect(milkaVote.connect(addr2).makeRejectVotes(propId2)).to
        .emit(milkaVote, 'DisableProposal')
        .withArgs(propId2);
    });


    it("Three Propose | (Disabled | Disabled | Disabled) | By time | By time | By time)", async function () {
      
      let propId1 = 104;
      let propId2 = 105;
      let propId3 = 106;

      await expect(milkaVote.connect(addr1).createNewProposal(propId1)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId1);

      await expect(milkaVote.connect(addr1).createNewProposal(propId2)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId2);

      await expect(milkaVote.connect(addr1).createNewProposal(propId3)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId3);
      
      await expect(milkaVote.connect(addr1).makeAgreeVotes(propId1)).not.to
        .emit(milkaVote, 'AcceptedProposal')
        .withArgs(propId1);

      await expect(milkaVote.connect(addr2).makeRejectVotes(propId2)).not.to
        .emit(milkaVote, 'RejectedProposal')
        .withArgs(propId2);

      await expect(milkaVote.connect(addr3).makeAgreeVotes(propId3)).not.to
        .emit(milkaVote, 'AcceptedProposal')
        .withArgs(propId1);

      await time.increase(DELAY);

      await expect(milkaVote.connect(addr2).makeRejectVotes(propId2)).to
        .emit(milkaVote, 'DisableProposal')
        .withArgs(propId2);

      expect(await milkaVote.containsFreeProps()).to.equal(true);
    });


    it("Foure Propose | Correct | After delay", async function () {
      
      let propId1 = 107;
      let propId2 = 108;
      let propId3 = 109;
      let propId4 = 110;

      await expect(milkaVote.connect(addr1).createNewProposal(propId1)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId1);

      await expect(milkaVote.connect(addr1).createNewProposal(propId2)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId2);

      await expect(milkaVote.connect(addr1).createNewProposal(propId3)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId3);

      await time.increase(DELAY);

      await expect(milkaVote.connect(addr1).createNewProposal(propId4)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId4);
    
    });

    it("Foure Propose | Incorrect | Without delay", async function () {
      
      let propId1 = 107;
      let propId2 = 108;
      let propId3 = 109;
      let propId4 = 110;

      await expect(milkaVote.connect(addr1).createNewProposal(propId1)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId1);

      await expect(milkaVote.connect(addr1).createNewProposal(propId2)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId2);

      await expect(milkaVote.connect(addr1).createNewProposal(propId3)).to
        .emit(milkaVote, 'CreatedProposal')
        .withArgs(propId3);

      await expect(milkaVote.connect(addr1).createNewProposal(propId4)).to
        .emit(milkaVote, 'DisableProposal')
        .withArgs(propId4);
    
    });


  
  });


});
