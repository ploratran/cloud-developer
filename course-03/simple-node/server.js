function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  while(true) {
    console.log(`The value of my TEST_VARIABLE is${process.env.TEST_VARIABLE}`);
    await sleep(5000);
  }
}

main();
