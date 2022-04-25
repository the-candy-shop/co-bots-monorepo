<template>
  <div class="bg-black flex justify-center">
    <div
      class="text-white mt-[80px] bg-black flex flex-col justify-center items-center pt-16 pb-10 px-4 lg:w-[720px]"
    >
      <div class="uppercase text-[80px] text-white font-black font-['CheeseButterCream']">RULES</div>
      <div class="divide-y-2 divide-cobots-silver-3 text-xl">

        <info-sub-section question="Eligibility">
          <p>To be eligible for Co-Bots’ Extravagainza giveaways, you must own a Co-Bot (not a Co-Bot 1.0). Your Co-Bots are eligible for all giveaways at mint checkpoints reached after they are minted.</p>
          <p>To be eligible for the giveaways chosen by random draw, you must also answer a skill-testing question (this is the question you’ll answer before minting).</p>
        </info-sub-section>

        <info-sub-section question="Giveaway Schedule">
          <p>The Co-Bots’ Extravagainza giveaways are triggered by checkpoints throughout the Co-Bots mint. Each giveaway will only happen if its corresponding mint checkpoint is reached.</p>
          <p>The schedule for the giveaways is as follows:</p>
          <ol class="list-disc list-inside space-y-1 pl-2">
            <li>100 mints: 1 ETH given to one winner chosen by random draw</li>
            <li>200 mints: 2 ETH given to one winner chosen by random draw</li>
            <li>300 mints: 3 ETH given to one winner chosen by random draw</li>
            <li>400 mints: 4 ETH given to one winner chosen by random draw</li>
            <li>500 mints: 1 ETH each given to five winners chosen by random draw from those who entered the Twitter Raid</li>
            <li>750 mints: 6 ETH given to one winner chosen by random draw</li>
            <li>1000 mints: 7 ETH given to one winner chosen by random draw</li>
            <li>1500 mints: 8 ETH given to one winner chosen by random draw</li>
            <li>2000 mints: 9 ETH given to one winner chosen by random draw</li>
            <li>3000 mints: 2 ETH each given to five winners chosen by smlg* from those who entered Meme Contest 1</li>
            <li>4000 mints: 12 ETH given to one winner chosen by random draw</li>
            <li>5000 mints: 14 ETH given to one winner chosen by random draw</li>
            <li>5000 mints: 50 ETH given to one winner who solves the Mystery Challenge first</li>
            <li>6000 mints: 16 ETH given to one winner chosen by random draw</li>
            <li>7000 mints: 18 ETH given to one winner chosen by random draw</li>
            <li>8000 mints: 4 ETH each given to five winners chosen by smlg* from those who entered Meme Contest 2</li>
            <li>9000 mints: 22 ETH given to one winner chosen by random draw</li>
            <li>10000 mints: 24 ETH given to one winner chosen by random draw</li>
            <li>1 hour after 10000 mints: 69 ETH given to one winner chosen by random draw</li>
          </ol>
          <p class="italic">*Judges of the Meme Contests are subject to change</p>
        </info-sub-section>

        <info-sub-section question="How it works: Random Draws ">
          <p>At each mint checkpoint, the Co-Bots’ Extravagainza smart contract will automatically and randomly choose a winning Co-Bot and immediately send the prize ETH to it’s holder’s wallet.</p>
        </info-sub-section>

        <info-sub-section question="How it works: Twitter Raid ">
          <p>Co-Bots 0-499 are eligible to enter the Twitter Raid. To enter, their holders must share an image of the Co-Bot on Twitter, accompanied by the text, “Here’s my ticket to @thecobots 300 ETH on-chain giveaway event!”.*</p>
          <p>Holders can enter once for every Co-Bot they have with a token ID of less than 500. If preferred, they can share all their Co-Bots in one tweet (i.e. no need to tweet once for each Co-Bot).</p>
          <p>Once the 500 mint checkpoint is reached, 5 winners will be chosen randomly. We will then verify the wallet addresses that hold the winning Co-Bots and enter the addresses in our smart contract. The smart contract will then immediately send the prize ETH to the wallet addresses.</p>
          <p class="italic">*Requirements for the entry tweet are subject to change</p>
        </info-sub-section>

        <info-sub-section question="How it works: Meme Contest 1">
          <p>Co-Bots 0-2999 are eligible to enter Meme Contest 1. To enter, their holders create a meme about Co-Bots and share the meme on Twitter.*</p>
          <p>Holders can enter once for every Co-Bot they have with a token ID of less than 3000.</p>
          <p>24 hours after the 3000 mints checkpoint is reached, 5 winners will be chosen by smlg.** We will then verify the wallet addresses of the winners and enter the addresses in our smart contract. The smart contract will then immediately send the prize ETH to the wallet addresses.</p>
          <p class="italic">*Requirements for the entry tweet are subject to change<br/>
          **Judges are subject to change</p>
        </info-sub-section>        
        
        <info-sub-section question="How it works: Meme Contest 2">
          <p>Co-Bots 0-7999 are eligible to enter Meme Contest 1. To enter, their holders create a meme about Co-Bots and share the meme on Twitter.*</p>
          <p>Holders can enter once for every Co-Bot they have with a token ID of less than 8000.</p>
          <p>24 hours after the 8000 mints checkpoint is reached, 5 winners will be chosen by smlg.** We will then verify the wallet addresses of the winners and enter the addresses in our smart contract. The smart contract will then immediately send the prize ETH to the wallet addresses.</p>
          <p class="italic">*Requirements for the entry tweet are subject to change<br/>
          **Judges are subject to change</p>
        </info-sub-section>
        
        <info-sub-section question="How it works: Mystery Challenge">
          <p>Any Co-Bot holder can participate in the Mystery Challenge. The details of the challenge will be revealed on Twitter.</p>
          <p>The winner will be the first holder to call the Co-Bots’ Extravagainza smart contract with the correct input. The smart contract will immediately send the prize ETH to the wallet that made the contract call.</p>
        </info-sub-section>

        <p class="pt-10 text-cobots-silver-3 text-[12px] leading-[12px]">No purchase necessary. Direct message Co-Bots on Twitter to request an entry form.</p>
      </div>
    </div>
  </div>
</template>

<script>
import InfoSubSection from "./InfoSubSection.vue";
import Logo from "@/components/logo.vue";

const {
  VITE_ETHERSCAN_BASE_URL,
  VITE_CONTRACT_ADDRESS,
} = import.meta.env;

export default {
  name: "RulesSection",
  components: {
    InfoSubSection,
    Logo,
  },
  methods: {
    scrollToTrustSection() {
      const el = this.$refs["trust"].$el;
      this.$scrollTo(el, 600, { offset: -50 });
    },
  },
  data: () => ({
    etherScanLink: `${VITE_ETHERSCAN_BASE_URL}${VITE_CONTRACT_ADDRESS}`,
  }),
};
</script>
