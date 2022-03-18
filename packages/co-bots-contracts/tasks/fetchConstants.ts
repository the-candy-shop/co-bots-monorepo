import { task } from "hardhat/config";

task("fetch-constants", "Fetch contract's constants").setAction(
  async ({}, { deployments }) => {
    const { read } = deployments;

    const constants = {
      MAX_MINT_PER_ADDRESS: await read("CoBots", "MAX_MINT_PER_ADDRESS"),
      MINT_GIVEAWAYS: await read("CoBots", "MINT_GIVEAWAYS"),
      MINT_FOUNDERS_AND_GIVEAWAYS: await read(
        "CoBots",
        "MINT_FOUNDERS_AND_GIVEAWAYS"
      ),
      RAFFLE_DRAW_DELAY: (await read("CoBots", "RAFFLE_DRAW_DELAY")).toString(),
      COORDINATION_RAFFLE_THRESHOLD: await read(
        "CoBots",
        "COORDINATION_RAFFLE_THRESHOLD"
      ),
      MINT_PUBLIC_PRICE: (await read("CoBots", "MINT_PUBLIC_PRICE")).toString(),
      MAX_COBOTS: await read("CoBots", "MAX_COBOTS"),
      MAIN_RAFFLE_WINNERS_COUNT: await read(
        "CoBots",
        "MAIN_RAFFLE_WINNERS_COUNT"
      ),
      MAIN_RAFFLE_PRIZE: (await read("CoBots", "MAIN_RAFFLE_PRIZE")).toString(),
      COORDINATION_RAFFLE_WINNERS_COUNT: await read(
        "CoBots",
        "COORDINATION_RAFFLE_WINNERS_COUNT"
      ),
      COORDINATION_RAFFLE_PRIZE: (
        await read("CoBots", "COORDINATION_RAFFLE_PRIZE")
      ).toString(),
      COBOTS_MINT_DURATION: (
        await read("CoBots", "COBOTS_MINT_DURATION")
      ).toString(),
      COBOTS_MINT_RAFFLE_DELAY: (
        await read("CoBots", "COBOTS_MINT_RAFFLE_DELAY")
      ).toString(),
      COBOTS_REFUND_DURATION: (
        await read("CoBots", "COBOTS_REFUND_DURATION")
      ).toString(),
    };

    console.log(constants);
  }
);
