const nameToBitMap: { [x: string]: number } = {};
let bitCounter = 0;
export function getObservedBitsFromName(name: string) {
  if (!nameToBitMap[name]) {
    nameToBitMap[name] = 1 << bitCounter++;
  }
  if (bitCounter === 31) {
    bitCounter = 0;
  }
  return nameToBitMap[name];
}
export function getObservedBitsFromNames(names: string[]) {
  return names.reduce(
    (bits, name) => (bits ^= getObservedBitsFromName(name)),
    0,
  );
}
