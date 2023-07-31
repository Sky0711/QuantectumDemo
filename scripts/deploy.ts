import { ethers, upgrades } from 'hardhat';

export class Deployer {
    public protectionNFT;
    public earthquakeInsurance;
  
    async deployContracts() {
        const EarthquakeInsuranceFactory = await ethers.getContractFactory("EarthquakeInsurance");
        const ProtectionNFTFactory = await ethers.getContractFactory("ProtectionNFT");
        
        this.protectionNFT = await upgrades.deployProxy(ProtectionNFTFactory, [], { initializer: 'initialize' });
        console.log("ProtectionNFT deployed to:", this.protectionNFT.address);
        
        this.earthquakeInsurance = await upgrades.deployProxy(EarthquakeInsuranceFactory, [this.protectionNFT.address], { initializer: 'initialize' });
        console.log("EarthquakeInsurance deployed to:", this.earthquakeInsurance.address);

        await this.protectionNFT.setEarthquakeInsurance(this.earthquakeInsurance.address);
        console.log("EarthquakeInsurance address set in ProtectionNFT contract");
    }
}
