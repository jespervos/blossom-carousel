import "@blossom-carousel/core/style.css";
import "./style.css";
import App from "./App.svelte";
import { mount } from "svelte";

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
