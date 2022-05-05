
export function getCompletionState(start, end, totalMinted) {
  if (start === 0 && totalMinted <= 25) {
    return 50;
  }

  if (totalMinted === 10000) {
    return 100;
  }
  
  let completion = null;
  if (totalMinted >= end) {
    completion = 100;
  } else if (totalMinted <= start) {
    completion = 0;
  } else {
    completion = ((totalMinted - start) / (end - start) * 100);
  }

  return completion;
}
