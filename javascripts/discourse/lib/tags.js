function allTagsClick() {
  window._oaReport("click", {
    target: this.textContent.trim(),
    level1: "所有标签",
    $url: location.href,
  });
}

export function reportTagsClick() {
  window.addEventListener("afterRouteChange", ({ detail }) => {
    if (detail.to === "/tags") {
      document
        .querySelector("#main-outlet .all-tag-lists .tags-list")
        ?.querySelectorAll("tag-box")
        .forEach((el) => {
          el.querySelector("a").addEventListener("click", allTagsClick);
        });
    }
  });
}
