import useMutationObserver from "./useMutationObserver";
import { debounce } from "./utils";

// ============顶部下拉类别/标签点击============
function navDropdownClick() {
  const level1 = this.closest(".select-kit.single-select").querySelector(
    ".select-kit-header"
  ).dataset.name;
  window._oaReport("click", {
    target: this.textContent.trim(),
    level1,
    module: "nav-dropdown",
    $url: location.href,
  });
}

function navbarItemClick() {
  window._oaReport("click", {
    target: this.textContent.trim(),
    module: "nav-bar",
    $url: location.href,
  });
}

export default function reportNavigationClick() {
  useMutationObserver(
    document.getElementById("main-outlet"),
    debounce(() => {
      // 顶部下拉类别点击
      const navDrop = document.querySelector(
        "#main-outlet .list-controls .container .navigation-container .select-kit.is-expanded"
      );
      if (navDrop) {
        navDrop
          .querySelectorAll(".select-kit-row")
          .forEach((el) => el.addEventListener("click", navDropdownClick));
      }

      const navbar = document.getElementById("navigation-bar");
      if (navbar) {
        for (let index = 0; index < navbar.children.length; index++) {
          const element = navbar.children.item(index);
          element.addEventListener("click", navbarItemClick);
        }
      }
    }, 300),
    { childList: true }
  );
}
