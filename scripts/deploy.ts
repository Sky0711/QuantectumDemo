// scripts/deploy.ts
import { ethers, upgrades } from 'hardhat';

async function deployContracts() {
    // Get the Contract Factories
    const EarthquakeInsuranceFactory = await ethers.getContractFactory("EarthquakeInsurance");
    const ProtectionNFTFactory = await ethers.getContractFactory("ProtectionNFT");
    
    // Deploy the ProtectionNFT contract with the UUPS proxy
    const protectionNFT = await upgrades.deployProxy(ProtectionNFTFactory, [], { initializer: 'initialize' });
    console.log("ProtectionNFT deployed to:", protectionNFT.address);
    
    // Deploy the EarthquakeInsurance contract with the UUPS proxy, passing the address of the ProtectionNFT contract to it
    const earthquakeInsurance = await upgrades.deployProxy(EarthquakeInsuranceFactory, [protectionNFT.address], { initializer: 'initialize' });
    console.log("EarthquakeInsurance deployed to:", earthquakeInsurance.address);

    // Set the EarthquakeInsurance address in the ProtectionNFT contract
    await protectionNFT.setEarthquakeInsurance(earthquakeInsurance.address);
    console.log("EarthquakeInsurance address set in ProtectionNFT contract");

    return { protectionNFT, earthquakeInsurance };
}

async function main() {
    await deployContracts();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

export { deployContracts };
