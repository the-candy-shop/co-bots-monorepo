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
        winners: 1,
      },
    ]    
  },
  200: {
    contests: [
      {
        price: 2,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  300: {
    contests: [
      {
        price: 3,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  400: {
    contests: [
      {
        price: 4,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  500: {
    contests: [
      {
        price: 5,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  500: {
    contests: [
      {
        price: 5,
        subPrice: 1,
        contest: contestTypes.TWITTER_RAID,
        highlight: contestHighlights.GREEN,
        winners: 5,
      },
    ]    
  },
  750: {
    contests: [
      {
        price: 6,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  1000: {
    contests: [
      {
        price: 7,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  1500: {
    contests: [
      {
        price: 8,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  2000: {
    contests: [
      {
        price: 9,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  3000: {
    contests: [
      {
        price: 10,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  3000: {
    contests: [
      {
        price: 10,
        subPrice: 2,
        contest: contestTypes.MEME_CONTEST_1,
        highlight: contestHighlights.GREEN,
        winners: 5,
      },
    ]    
  },
  4000: {
    contests: [
      {
        price: 12,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  5000: {
    contests: [
      {
        price: 14,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
      {
        price: 50,
        contest: contestTypes.MISTERY_CHALLENGE,
        highlight: contestHighlights.RED,
        winners: 1,
      },
    ]    
  },
  6000: {
    contests: [
      {
        price: 16,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  7000: {
    contests: [
      {
        price: 18,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  8000: {
    contests: [
      {
        price: 20,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  8000: {
    contests: [
      {
        price: 20,
        subPrice: 4,
        contest: contestTypes.MEME_CONTEST_2,
        highlight: contestHighlights.GREEN,
        winners: 5,
      },
    ]    
  },
  9000: {
    contests: [
      {
        price: 22,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
  10000: {
    contests: [
      {
        price: 24,
        contest: contestTypes.RANDOM_DRAW,
        highlight: false,
        winners: 1,
      },
    ]    
  },
};
