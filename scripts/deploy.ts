import { ethers, upgrades } from 'hardhat';

async function main() {
    // Get the Contract Factory
    const EarthquakeInsurance = await ethers.getContractFactory("EarthquakeInsurance");

    // Deploy the contract with the UUPS proxy
    const earthquakeInsurance = await upgrades.deployProxy(EarthquakeInsurance, [], { initializer: 'initialize' });

    // Log the address of the proxy contract
    console.log("EarthquakeInsurance deployed to:", earthquakeInsurance.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
