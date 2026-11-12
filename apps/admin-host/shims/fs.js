/** Browser stub for Node builtins unused by the admin host. */
export default {};
export const readFileSync = () => {
  throw new Error('node:fs is not available in the browser admin host.');
};
export const readFile = async () => {
  throw new Error('node:fs is not available in the browser admin host.');
};
