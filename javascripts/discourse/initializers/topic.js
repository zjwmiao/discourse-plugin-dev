import useMutationObserver from "./useMutationObserver";
import { debounce } from "./utils";

function onTopicListClick(ev) {
  if (ev.target === this) {
    return;
  }
  let target = ev.target;
  while (!(target instanceof HTMLAnchorElement && target.classList.contains("title"))) {
    target = target.parentElement;
    if (target === this || !target) {
      return;
    }
  }

  const mainLink = target.closest("main-link");
  const categories = [...mainLink.querySelectorAll('.badge-category__wrapper')].map(el => el.textContent.trim()).join();
  const tags = mainLink.querySelector('.topic-header-extra .list-tags')?.textContent?.trim();
  sessionStorage.setItem('topicRead', JSON.stringify({
    title: target.textContent.trim(),
    path: target.getAttribute('href'),
    readTime: Date.now(),
    categories,
    ...(tags && { tags }),
  }));
  window._oaReport("click", {
    target: target.textContent.trim(),
    type: 'topic-click',
    $url: location.href,
    detail: {
      categories,
      ...(tags && { tags }),
    }
  });
}

/**
 * 点击某个帖子
 */
export function reportTopicClick() {
  useMutationObserver(
    document.getElementById('main-outlet'),
    debounce(() => {
      const topicList = document.querySelector('#main-outlet table.topic-list .topic-list-body');
      if (topicList) {
        topicList.addEventListener("click", onTopicListClick);
      }
    }, 300),
    { childList: true }
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
      if (readInfo.path !== detail.from) {
        return;
      }
      window._oaReport(
        'pageLeave',
        {
          target: readInfo.title,
          detail: {
            readTime: Date.now() - Number(readInfo),
            categories: readInfo.categories,
            ...(readInfo.tags ? { tags: readInfo.tags } : null),
          }
        }
      );
    }
  });
}
