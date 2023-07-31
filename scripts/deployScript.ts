import { Deployer } from './deploy';

async function main() {
    const deployer = new Deployer();
    await deployer.deployContracts();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
