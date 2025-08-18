import useMutationObserver from "./useMutationObserver";
import { debounce } from "./utils";

function sidebarCategoriesClick() {
  window._oaReport("click", {
    target: this.textContent.trim(),
    level1: "类别",
    module: "sidebar",
    $url: location.href,
  });
}

function sidebarTagsClick() {
  window._oaReport("click", {
    target: this.textContent.trim(),
    level1: "标签",
    module: "sidebar",
    $url: location.href,
  });
}

export default function reportSidebarClick() {
  return useMutationObserver(
    document.querySelector("#main-outlet-wrapper .sidebar-wrapper"),
    debounce(([mut]) => {
      if (mut.target?.classList.contains("has-sidebar-page")) {
        // 类别
        document
          .querySelectorAll(
            'div.sidebar-section-wrapper[data-section-name="categories"] li'
          )
          .forEach((el) => {
            el.addEventListener("click", sidebarCategoriesClick);
          });
        // 标签
        document
          .querySelectorAll(
            'div.sidebar-section-wrapper[data-section-name="tags"] li'
          )
          .forEach((el) => {
            el.addEventListener("click", sidebarTagsClick);
          });
      }
    }, 100),
    { childList: true }
  );
}
