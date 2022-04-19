 export const contestTypes = {
  RANDOM_DRAW: 'RANDOM DRAW',
  TWITTER_RAID: 'TWITTER RAID',
  MEME_CONTEST_1: 'MEME CONTEST 1',
  MISTERY_CHALLENGE: 'MISTERY CHALLENGE',
  MEME_CONTEST_2: 'MEME CONTEST 2',
}

export const contestHighlights = {
  GREEN: 'GREEN',
  RED: 'RED',
}

export const prizeConfiguration = {
  100: {
    contests: [
      {
        price: 1,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  200: {
    contests: [
      {
        price: 2,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  300: {
    contests: [
      {
        price: 3,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  400: {
    contests: [
      {
        price: 4,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  500: {
    contests: [
      {
        price: 5,
        contest: contestTypes.TWITTER_RAID,
        highlight: contestHighlights.GREEN,
      },
    ]    
  },
  750: {
    contests: [
      {
        price: 6,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  1000: {
    contests: [
      {
        price: 7,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  1500: {
    contests: [
      {
        price: 8,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  2000: {
    contests: [
      {
        price: 9,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  3000: {
    contests: [
      {
        price: 10,
        contest: contestTypes.MEME_CONTEST_1,
        highlight: contestHighlights.GREEN,
      },
    ]    
  },
  4000: {
    contests: [
      {
        price: 12,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  5000: {
    contests: [
      {
        price: 14,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
      {
        price: 50,
        contest: contestTypes.MISTERY_CHALLENGE,
        highlight: contestHighlights.RED,
      },
    ]    
  },
  6000: {
    contests: [
      {
        price: 16,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  7000: {
    contests: [
      {
        price: 18,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  8000: {
    contests: [
      {
        price: 20,
        contest: contestTypes.MEME_CONTEST_2,
        highlight: contestHighlights.GREEN,
      },
    ]    
  },
  9000: {
    contests: [
      {
        price: 22,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
  "10k": {
    contests: [
      {
        price: 24,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
      },
    ]    
  },
};
