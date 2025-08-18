import { debounce, onNodeInserted } from "./utils.js";

function onClickSearchInput() {
  window._oaReport("click", {
    type: "search-input",
    module: 'search',
    $url: location.href,
  });
}

function onInputSearchInput(ev) {
  window._oaReport("input", {
    type: "search-input",
    module: 'search',
    content: ev.currentTarget.value.trim(),
    $url: location.href,
  });
}

function onClickSearchHistory(ev) {
  window._oaReport("click", {
    type: "search-history",
    module: 'search',
    target: ev.currentTarget.textContent.trim(),
    $url: location.href,
  });
}

function onClearSearchHistoryClick() {
  window._oaReport("click", {
    type: "clear-search-history",
    module: 'search',
    $url: location.href,
  });
}

function onClickSuggestion(ev) {
  window._oaReport("click", {
    type: "search-suggestion",
    module: 'search',
    target: ev.currentTarget.textContent.trim(),
    detail: ev.currentTarget.href,
    $url: location.href,
  });
}

function onClickSearchResultTopic(ev) {
  const current$ = window.$(ev.currentTarget);
  window._oaReport("click", {
    type: "search-result",
    module: 'search',
    target: current$.find(".first-line").text().trim(),
    detail: {
      path: ev.currentTarget.href,
      categories: current$.find(".badge-category__name").text().trim(),
      tags: current$.find(".discourse-tags").text().trim(),
    },
    $url: location.href,
  });
}

export default function reportSearch() {
  onNodeInserted(
    ".search-input-wrapper input",
    (node) => {
      window.$(node).on("click", onClickSearchInput);
      window.$(node).on("input", debounce(onInputSearchInput, 300));
      window.$(node).on("keydown", (ev) => {
        if (ev.key === "Enter") {
          window._oaReport("input", {
            type: "search",
            module: 'search',
            content: ev.currentTarget.value.trim(),
            $url: location.href,
          });
        }
      });
    }
  );

  // 历史记录点击
  onNodeInserted(
    ".search-menu-panel .search-menu-recent",
    (node) => {
      window
        .$(node)
        .children(".search-menu-assistant-item")
        .on("click", onClickSearchHistory);
      // 清除历史记录
      window
        .$(node)
        .find(".clear-recent-searches")
        .on("click", onClearSearchHistoryClick);
    }
  );

  // 联想/帖子结果点击
  onNodeInserted(
    ".search-menu-panel .results div[class^=search-result]",
    (node) => {
      if (node.classList.contains("search-result-topic")) {
        // 话题结果点击
        window.$(node).find(".list .item a").on("click", onClickSearchResultTopic);
      } else {
        // 联想结果点击
        window.$(node).find(".list .item a").on("click", onClickSuggestion);
      }
    }
  );
}
