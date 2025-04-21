// Provide TS support for Svelte imports
declare module "*.svelte" {
  import { SvelteComponentTyped } from "svelte";
  export default SvelteComponentTyped<any, any, any>;
}
