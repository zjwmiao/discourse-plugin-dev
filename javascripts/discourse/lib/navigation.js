import { onNodeInserted } from "./utils.js";

export function reportNavigationClick() {
  // 类别下拉点击
  onNodeInserted(
    ".navigation-container .category-drop.is-expanded .select-kit-collection",
    (node) => {
      window
        .$(node)
        .children()
        .on("click", (ev) =>
          window._oaReport("click", {
            target: ev.currentTarget.textContent.trim(),
            type: "类别",
            module: "nav-dropdown",
            $url: location.href,
          })
        );
    }
  );
  // 标签下拉点击
  onNodeInserted(
    ".navigation-container .tag-drop.is-expanded .select-kit-collection",
    (node) => {
      window
        .$(node)
        .children()
        .on("click", (ev) =>
          window._oaReport("click", {
            target: ev.currentTarget.textContent.trim(),
            type: "标签",
            module: "nav-dropdown",
            $url: location.href,
          })
        );
    }
  );
  // 所有下拉点击
  onNodeInserted(
    ".navigation-container .has-selection.is-expanded .select-kit-collection",
    (node) => {
      window
        .$(node)
        .children()
        .on("click", (ev) =>
          window._oaReport("click", {
            target: ev.currentTarget.textContent.trim(),
            type: "所有",
            module: "nav-dropdown",
            $url: location.href,
          })
        );
    }
  );
}
