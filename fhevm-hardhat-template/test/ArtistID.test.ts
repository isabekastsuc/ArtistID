import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArtistID", function () {
  it("mints one identity per wallet and stores the profile", async function () {
    const [artist] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ArtistID");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    await expect(contract.registerArtist("Ada", "generative", "ipfs://bafy", "Painter"))
      .to.emit(contract, "ArtistRegistered")
      .withArgs(artist.address, 1n);

    const profile = await contract.getArtistProfile(artist.address);
    expect(profile.name).to.equal("Ada");
    expect(profile.category).to.equal("Painter");
    await expect(contract.registerArtist("Ada", "again", "ipfs://bafy", "Painter"))
      .to.be.revertedWith("Already registered");
  });
});
