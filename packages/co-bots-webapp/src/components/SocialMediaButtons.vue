<template>
  <div class="text-white flex space-x-2 md:space-x-4 pr-2 md:pr-8">
    <a class="py-1" href="https://twitter.com/thecobots" target="_blank">
      <img alt="twitter-logo" src="../images/twitter-logo.svg" />
    </a>
    <a :href="openSeaLink" target="_blank">
      <img alt="opensea-logo" src="../images/opensea-logo.svg" />
    </a>
    <a :href="etherScanLink" target="_blank">
      <img alt="etherscan-lgo" src="../images/etherscan-logo-.svg" />
    </a>
  </div>
</template>

<script>
const {
  VITE_OPENSEA_PROJECT_LINK,
  VITE_ETHERSCAN_BASE_URL,
  VITE_CONTRACT_ADDRESS,
} = import.meta.env;
export default {
  name: "SocialMedaiButtons",
  data: () => ({
    openSeaLink: VITE_OPENSEA_PROJECT_LINK,
    etherScanLink: `${VITE_ETHERSCAN_BASE_URL}${VITE_CONTRACT_ADDRESS}`,
  }),
};
</script>
