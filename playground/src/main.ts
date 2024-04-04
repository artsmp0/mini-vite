import content from "./content.ts";
import { mountChild } from "./hot-child.ts";

function mount() {
  const app = document.querySelector("#app")!;
  app.innerHTML = content;
  app.append(mountChild());
}

mount();
