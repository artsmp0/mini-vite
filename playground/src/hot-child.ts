// support hot module reload
// @ts-expect-error missing types
if (import.meta.hot) {
  // @ts-expect-error missing types
  import.meta.hot.accept((newModule) => {
    console.log(`Handling hot reload accept for ${import.meta.url}`);
    document.querySelector("#hot-child")?.replaceWith(newModule.mountChild());
  });
}

export function mountChild() {
  const $el = document.createElement("div");
  $el.id = "hot-child";
  $el.setAttribute("style", "color:#f0f;margin-top:16px;");
  $el.textContent = `${new Date().toLocaleTimeString()}`;
  return $el;
}
