/** Browser stub for Node builtins unused by the demo host. */
export default {};
export const readFileSync = () => {
  throw new Error('node:fs is not available in the browser demo host.');
};
export const readFile = async () => {
  throw new Error('node:fs is not available in the browser demo host.');
};
