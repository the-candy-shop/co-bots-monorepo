
export function getCompletionState(start, end, totalMinted) {
  if (start === 0 && totalMinted <= 25) {
    return 50;
  }
  
  let completion = null;
  let loop = 0;

  // 15 is the first value where the round doesn't look like shit
  if (totalMinted >= end) {
    completion = 100;
    if (end < 500) {
      completion += 11;
    } else if (end < 1000) {
      completion += 34;
    }

    loop = 2;
  } else if (totalMinted <= start) {
    completion = 0;
    loop = 3;
  } else {
    completion = ((totalMinted - start) / (end - start) * 100);
    loop = 4;
  }

  //console.log('Loop', loop, 'Start', start, 'End', end, 'totalMinted', totalMinted, 'percentage', completion);

  return completion;
}
