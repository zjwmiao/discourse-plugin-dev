import { onNodeInserted } from "./utils.js";

function onTopicListClick(ev) {
  if (ev.target === ev.currentTarget) {
    return;
  }
  let target = ev.target;
  while (!(target instanceof HTMLAnchorElement && target.classList.contains("title"))) {
    target = target.parentElement;
    if (target === ev.currentTarget || !target) {
      return;
    }
  }

  const mainLink = target.closest(".main-link");
  const categories = [...mainLink.querySelectorAll('.badge-category__wrapper')].map(el => el.textContent.trim()).join();
  const tags = mainLink.querySelector('.discourse-tags')?.textContent?.trim();
  const path = target.getAttribute('href').match(/^\/t\/topic\/[^/]+/)?.[0];
  sessionStorage.setItem('topicRead', JSON.stringify({
    title: target.textContent.trim(),
    path,
    readTime: Date.now(),
    categories,
    ...(tags && { tags }),
  }));
  window._oaReport("click", {
    target: target.textContent.trim(),
    type: 'topic-click',
    $url: location.href,
    detail: {
      path,
      categories,
      ...(tags && { tags }),
    }
  });
}

/**
 * 点击某个帖子
 */
export function reportTopicClick() {
  onNodeInserted(
    '#main-outlet .topic-list .topic-list-body',
    node => window.$(node).on('click', onTopicListClick)
  );
}

export function reportTopicLeave() {
  window.addEventListener('afterRouteChange', ({ detail }) => {
    if (detail.from.startsWith('/t/topic/')) {
      const topicRead = sessionStorage.getItem('topicRead');
      if (!topicRead) {
        return;
      }
      const readInfo = JSON.parse(topicRead);
      if (readInfo.path !== detail.from.match(/^\/t\/topic\/[^/]+/)?.[0]) {
        return;
      }
      sessionStorage.removeItem('topicRead');
      window._oaReport(
        'pageLeave',
        {
          target: readInfo.title,
          detail: {
            path: readInfo.path,
            readTime: Date.now() - Number(readInfo.readTime),
            categories: readInfo.categories,
            ...(readInfo.tags ? { tags: readInfo.tags } : null),
          }
        }
      );
    }
  });
}
