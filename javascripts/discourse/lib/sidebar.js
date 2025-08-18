import { onNodeInserted } from "./utils.js";

export function reportSidebarClick() {
  onNodeInserted("#sidebar-section-content-categories", (node) => {
    window
      .$(node)
      .children()
      .on("click", (ev) => {
        window._oaReport("click", {
          target: ev.currentTarget.textContent.trim(),
          level1: "类别",
          module: "sidebar",
          $url: location.href,
        });
      });
  });
  onNodeInserted("#sidebar-section-content-tags", (node) => {
    window
      .$(node)
      .children()
      .on("click", (ev) => {
        window._oaReport("click", {
          target: ev.currentTarget.textContent.trim(),
          level1: "标签",
          module: "sidebar",
          $url: location.href,
        });
      });
  });
}
