<template>
  <div class="bg-black flex justify-center">
    <div
      class="text-white mt-[80px] bg-black flex flex-col justify-center items-center pt-16 pb-10 px-4 lg:w-[720px]"
    >
      <div class="uppercase text-[80px] text-white font-black mb-6 font-['CheeseButterCream']">FAQ</div>
      <div class="divide-y-2 divide-cobots-silver-3 text-xl">
        <div class="text-center pb-10 leading-8 font-extrabold">
          <p>Co-Bots' Extravagainza is not a normal NFT project. It's more like a</p>
          <p>giant on-chain giveaway event where Co-Bots are the tickets!</p>
        </div>

        <info-sub-section question="What is Extravagainza?">
          <p class="font-extrabold">Co-Bots’ Extravagainza is a series of ETH giveaways for Co-Bots holders. The giveaways start at 1 ETH and build up to the grand prize of 69 ETH!</p>
          <p>The giveaways are triggered at checkpoints throughout the Co-Bots mint. When a giveaway is triggered, a winning Co-Bot is chosen and the prize is sent to its holder! All except 3 of the giveaways are executed 100% autonomously by our smart contract (<a @click="scrollToTrustSection()" class="text-cobots-green cursor-pointer">read more</a>).</p>
          <p>Your Co-Bot is eligible for all the giveaways that happen after it was minted. Mint early to maximize your chances of winning!</p>
          <p>Most of the giveaways will be random draws, but 3 will be more skill-based contests.</p>
          <p>Check out the <router-link class="text-cobots-green" to="/rules">Rules</router-link> page for more details.</p>
        </info-sub-section>

        <info-sub-section question="Who created Co-Bots?">
          Co-Bots was created by
          <a
            class="underline underline-offset-4 text-cobots-green"
            href="https://twitter.com/s_m_l_g"
            >smlg</a
          >
          with smart contract help from
          <a
            class="underline underline-offset-4 text-cobots-green"
            href="https://twitter.com/ClementWalter"
            >clemlaflemme.eth.</a
          > and frontend from <a
            class="underline underline-offset-4 text-cobots-green"
            href="https://twitter.com/matthieuauger"
            >matog.eth.</a
          >
          We met as early collectors of Chain Runners. smlg is also a proud member of the Noadz and FRWC communities.
        </info-sub-section>

        <info-sub-section question="Why should I trust you?" ref="trust">
          <p>We totally understand the paranoia people feel about getting rugged (we feel it too!). That’s why we’ve written our smart contract to execute the Extravagainza as trustlessly as possible.</p>
          <p>Here's how:</p>

          <ol class="list-decimal list-inside space-y-3 pl-2 font-extrabold">
            <li>
              It's <span class="italic">impossible</span> for us (the creators) to withdraw any of the prize ETH from the contract
            </li>
            <li>
              The random draws and prize dispersals are executed 100% autonomously by the contract (even if we turned evil overnight, we couldn’t stop it)
            </li>
          </ol>
          <p>Sadly, the Twitter Raid and Meme Contests can't be done trustlessly, since they require human input. Smart contracts can't tell what memes are funny (yet). You'll have to trust us there!</p>
          <p>
            You can verify all this for yourself by checking out our <a
            class="underline underline-offset-4 text-cobots-green"
            :href="etherScanLink" target="_blank"
            >contract</a> ⛓
          </p>
        </info-sub-section>

        <info-sub-section question="What are the more skill-based contests?">
          <p>We’ll announce the details of each contest on our <a class="text-cobots-green" target="_blank" href="https://twitter.com/thecobots">Twitter</a>, but here are the basics:</p>

          <p class="font-extrabold">Twitter Raid: 5 Prizes of 1 ETH Each</p> 
          Share your Co-Bot on Twitter! Holders of Co-Bots 0-499 are eligible for this contest. 5 winners will be randomly chosen when/if 500 Co-Bots are minted.

          <p class="font-extrabold">Meme Contest 1: 5 Prizes of 2 ETH Each</p> 
          Create a funny Co-Bot related meme!  Holders of Co-Bots 0-2999 are eligible for this contest. 5 winners will be chosen when/if 3000 Co-Bots are minted.

          <p class="font-extrabold">Meme Contest 2: 5 Prizes of 4 ETH Each</p> 
          Create a funny Co-Bot related meme, again! Holders of Co-Bots 0-7999 are eligible for this contest. The winner will be chosen when/if 8000 Co-Bots are minted.

          <p class="font-extrabold">Mystery Challenge: 1 Prize of 50 ETH</p> 
          It’s a secret. The challenge will open when/if 5000 Co-Bots are minted. Whoever completes it first will be sent the prize automatically by the smart contract.

        </info-sub-section>

        <info-sub-section question="If my Co-Bot wins, how do I claim my prize?">
          <p>When a Co-Bot is picked in a random draw, our smart contract will immediately send the prize to the wallet holding the Co-Bot.</p>
          <p>If you win the Twitter Raid or Meme Contests, we’ll ask for your wallet address and input it into our smart contract, which will then send you the prize.</p>
          <p>If you win the Mystery Challenge, our smart contract will immediately send the prize to your wallet.</p>
        </info-sub-section>

        <info-sub-section question="How many Co-Bots can I mint?">
          <p>As many as you want (20 per transaction).</p>
        </info-sub-section>

        <info-sub-section question="What about holders of Co-Bot 1.0s?">
          <p>As a thank you for being an early supporter, you’ll be able to mint one half-price Co-Bot for every Co-Bot 1.0 in your wallet. So, if you have three Co-Bot 1.0s, you’ll be able to mint three new bots for 0.025 each!</p>
        </info-sub-section>

        <info-sub-section question="Can the same Co-Bot win multiple prizes?">
          <p>Yep! Each Co-Bot is eligible for all the giveaways that happen after it’s minted.</p>
        </info-sub-section>

        <info-sub-section question="Can the creators win prizes?">
          <p>No. </p>
        </info-sub-section>

        <info-sub-section question="How long will the Extravagainza go for?">
          <p>The Extravagainza will go until the Co-Bots are minted out, even if that takes 500 years! This is possible because our smart contract executes the giveaways autonomously.</p>
          <p>If the Co-Bots don’t mint out within 1 month, the contract will convert the unreached skill-based contests into random draws. That means those prizes won’t rely on us (the creators) to choose the winners, so the contract will be executing the event 100% autonomously. It will do it’s job for as long as Ethereum exists!</p>
        </info-sub-section>

        <info-sub-section question="What happens after the Extravagainza?">
          <p>Probably nothing! (seriously)</p>
          <p>We may do more Co-Bot events in the future, but we don’t have any solid plans right now. Please only buy a Co-Bot for the cool pixel art and fun community event!</p>
        </info-sub-section>

        <info-sub-section question="What are the royalties on secondary sales?">
          <p>There are none! We want you to trade Co-Bots as freely as possible.</p>
        </info-sub-section>

        <info-sub-section question="Is the art on-chain?">
          Why yes, it is! The art for Co-Bots is generated by code in our smart
          contract. That means it doesn't depend on third party servers to host
          it. As long as Ethereum exists, so will your Co-Bot art!
        </info-sub-section>

        <info-sub-section question="Is Co-Bots CC0?">
          Yep! To the extent possible under law, we have waived all copyright and
          related or neighboring rights to Co-Bots.
        </info-sub-section>
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
  name: "InfoSection",
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
