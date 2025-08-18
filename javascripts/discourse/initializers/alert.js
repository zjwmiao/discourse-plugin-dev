import useMutationObserver from "./useMutationObserver.js";
import { debounce } from "./utils.js";
import reportSidebarClick from "./sidebar.js";
import reportNavigationClick from "./navigation.js";
import reportTopicClick, { reportTopicLeave } from "./topic.js";
import { reportTagsClick } from "./tags.js";

function isCookieAgreed() {
  const regexp = /\bagreed-cookiepolicy=([^;])+/;
  const res = document.cookie.match(regexp)?.[1];
  return res === "1";
}

export default {
  name: "alert",
  initialize() {
    import(
      "https://unpkg.com/@opensig/open-analytics@0.0.9/dist/open-analytics.mjs"
    ).then(({ OpenAnalytics, getClientInfo, OpenEventKeys }) => {
      const oa = new OpenAnalytics({
        appKey: "openUBMC",
        request: (data) => {
          if (!isCookieAgreed()) {
            disableOA();
            return;
          }
          fetch("/api-dsapi/query/track/openubmc", {
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
          "oa-openUBMC-client",
          "oa-openUBMC-events",
          "oa-openUBMC-session",
        ].forEach((key) => {
          localStorage.removeItem(key);
        });
      };

      /**
       * 上报埋点数据
       *
       * @param event 事件名
       * @param eventData 上报数据
       * @param $service service字段取值
       * @param options options
       *
       * @example
       * // 最终上报数据格式：
       * {
       *   event: string; // 事件名
       *   properties: {
       *     $service: string; // service字段
       *     ...eventData // 上报数据
       *   }
       * }
       */
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

      function startListenHistoryChange() {
        let referrer;

        ["replaceState", "pushState"].forEach((method) => {
          const native = History.prototype[method];
          History.prototype[method] = function (...args) {
            let fnCalled = false;
            try {
              if (oa.enabled) {
                const beforePath = location.pathname;
                native.call(this, ...args);
                fnCalled = true;
                const afterPath = location.pathname;
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
                fnCalled = true;
              }
            } catch {
              if (!fnCalled) {
                native.call(this, ...args);
              }
            } finally {
              referrer = location.href;
            }
          };
        });

        window.addEventListener("popstate", () => {
          try {
            const beforePath = new URL(referrer).pathname;
            if (beforePath !== location.pathname) {
              reportPV(referrer);
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

      listenCookieSet();
      startListenHistoryChange();
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
    });
  },
};
