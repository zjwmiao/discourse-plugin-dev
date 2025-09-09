import { reportNavigationClick } from "../lib/navigation.js";
import reportSearch from "../lib/search.js";
import { reportSidebarClick } from "../lib/sidebar.js";
import { reportTagsClick } from "../lib/tags.js";
import { reportTopicClick, reportTopicLeave } from "../lib/topic.js";

function isCookieAgreed() {
  const regexp = /\b_cookies_accepted=([^;]+)/;
  const res = document.cookie.match(regexp)?.[1];
  return res === "all" || res === "performance";
}

export default {
  name: "alert",
  initialize() {
    import(
      "https://unpkg.com/@opensig/open-analytics@0.0.9/dist/open-analytics.mjs"
    ).then(({ OpenAnalytics, getClientInfo, OpenEventKeys }) => {
      const oa = new OpenAnalytics({
        appKey: "openEuler",
        request: (data) => {
          if (!isCookieAgreed()) {
            disableOA();
            return;
          }
          fetch("/api-dsapi/query/track/openeuler", {
            body: JSON.stringify(data),
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        },
      });

      /**
       * 开启埋点上报功能
       *
       * 设置上报内容的header信息为浏览器相关信息
       */
      const enableOA = () => {
        oa.setHeader(getClientInfo());
        oa.enableReporting(true);
      };

      /**
       * 关闭埋点上报功能，清除localStorage中关于埋点的条目
       */
      const disableOA = () => {
        oa.enableReporting(false);
        [
          "oa-openEuler-client",
          "oa-openEuler-events",
          "oa-openEuler-session",
        ].forEach((key) => {
          localStorage.removeItem(key);
        });
      };

      function oaReport(event, eventData, $service = "forum", options) {
        return oa.report(
          event,
          async (...opt) => {
            return {
              $service,
              ...(typeof eventData === "function"
                ? await eventData(...opt)
                : eventData),
            };
          },
          options
        );
      }

      /**
       * 上报PageView事件
       * @param $referrer 从哪一个页面跳转过来
       */
      const reportPV = ($referrer) => {
        oaReport(OpenEventKeys.PV, ($referrer && { $referrer }) || null);
      };

      /**
       * 上报性能指标
       */
      const reportPerformance = () => {
        oaReport(OpenEventKeys.LCP);
        oaReport(OpenEventKeys.INP);
        oaReport(OpenEventKeys.PageBasePerformance);
      };

      function listenCookieSet() {
        if (isCookieAgreed()) {
          enableOA();
        }
        const desc = Object.getOwnPropertyDescriptor(
          Document.prototype,
          "cookie"
        );
        Object.defineProperty(Document.prototype, "cookie", {
          ...desc,
          set(val) {
            desc.set.call(this, val);
            if (isCookieAgreed()) {
              enableOA();
            } else {
              disableOA();
            }
          },
        });
      }

      function listenHistoryChange() {
        let referrer;

        ["replaceState", "pushState"].forEach((method) => {
          const native = History.prototype[method];
          History.prototype[method] = function (...args) {
            try {
              if (oa.enabled) {
                const beforePath = location.pathname;
                native.call(this, ...args);
                const afterPath = location.pathname;
                if (
                  beforePath.startsWith("/t/topic/") &&
                  afterPath.startsWith("/t/topic/") &&
                  beforePath.split("/")[3] === afterPath.split("/")[3]
                ) {
                  return;
                }
                if (beforePath !== afterPath) {
                  reportPV(referrer);
                  window.dispatchEvent(
                    new CustomEvent("afterRouteChange", {
                      detail: { from: beforePath, to: afterPath },
                    })
                  );
                }
              } else {
                native.call(this, ...args);
              }
            } catch {
              native.call(this, ...args);
            } finally {
              referrer = location.href;
            }
          };
        });

        window.addEventListener("popstate", () => {
          try {
            const beforePath = new URL(referrer).pathname;
            if (beforePath !== location.pathname) {
              setTimeout(() => reportPV(referrer));
              window.dispatchEvent(
                new CustomEvent("afterRouteChange", {
                  detail: { from: beforePath, to: location.pathname },
                })
              );
            }
          } finally {
            referrer = location.href;
          }
        });
      }

      let enterTime = Date.now();
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          enterTime = Date.now();
        } else {
          oaReport("leaveForum", {
            time: Date.now() - enterTime,
            $url: location.href,
          });
        }
      });

      listenCookieSet();
      listenHistoryChange();
      reportPV();
      reportPerformance();

      window._oaReport = oaReport;
      window._enableOA = enableOA;
      window._disableOA = disableOA;

      reportSidebarClick();
      reportNavigationClick();
      reportTopicClick();
      reportTopicLeave();
      reportTagsClick();

      reportSearch();
    });
  },
};
