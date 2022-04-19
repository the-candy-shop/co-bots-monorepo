import { getCompletionState } from "./mintCompletion.service";

const data = [
  //start,end,minted,result
  [0, 50, 10, 50],
  [0, 50, 30, 60],
  [0, 50, 50, 111],
  //
  [50, 150, 50, 0],
  [50, 150, 150, 111],
  [50, 150, 100, 50],
  //
  [150, 250, 150, 0],
  [150, 250, 250, 111],
  [150, 250, 200, 50],
  //
  [500, 750, 500, 0],
  [500, 750, 750, 134],
]

describe.each(data)(`A triangle`, (start, end, totalMinted, result) => {
  it(`${totalMinted} from ${start} to ${end} should be ${result}%`, () => {
    expect(getCompletionState(start, end, totalMinted)).toBe(result);
  });
});
