// @vitest-environment happy-dom
import { createApp, h, type App } from "vue";
import { createI18n } from "vue-i18n";
import { afterEach, describe, expect, it } from "vitest";
import DataGridPagination from "../DataGridPagination.vue";
import { TooltipProvider } from "@/components/ui/tooltip";

let app: App | undefined;
afterEach(() => {
  app?.unmount();
  document.body.replaceChildren();
});

function mountPagination(props: Record<string, unknown>) {
  const container = document.createElement("div");
  document.body.append(container);
  const paginationProps = {
    selectionSummary: null,
    selectionSummarySumText: "",
    selectionSummaryAverageText: "",
    selectionSummaryMinText: "",
    selectionSummaryMaxText: "",
    loading: false,
    infiniteScrollEnabled: false,
    infiniteScrollAllLoaded: false,
    loadAllRowsActive: false,
    loadAllRowsEnabled: true,
    pageSize: 100,
    defaultPageSize: 100,
    pageSizeMenuItems: [],
    exportMenuItems: [],
    currentPage: 3,
    canGoNextPage: true,
    canJumpLastPage: true,
    ...props,
  };
  app = createApp({
    render: () => h(TooltipProvider, () => h(DataGridPagination, paginationProps as never)),
  });
  app.use(
    createI18n({
      legacy: false,
      locale: "en",
      messages: {
        en: {
          grid: {
            totalPages: "Total {count} pages",
            rowsPerPageShort: " rows",
            customRowsPerPage: "Custom",
            currentAndDefaultPageSize: "current {current}, default {default}",
            applyForThisQuery: "Apply",
            applyAndSetDefault: "Apply and set default",
            applyPageSize: "Apply page size",
            jumpToPage: "Jump to page",
            allLoaded: "All loaded",
            loadAllAndGoToLastRow: "Load all",
          },
        },
      },
    }),
  );
  app.mount(container);
  return container;
}

describe("result grid total-pages indicator", () => {
  it("shows the total page count before the page-size selector when the server-confirmed total is known", () => {
    const container = mountPagination({ maxPage: 7 });
    const indicator = container.querySelector<HTMLElement>("[data-grid-total-pages]");
    expect(indicator?.textContent?.trim()).toBe("Total 7 pages");
    const dropdown = container.querySelector<HTMLElement>("[data-grid-total-pages] + *");
    expect(dropdown?.textContent ?? "").toContain("100 rows");
  });

  it("hides the indicator while the total page count is still unknown", () => {
    const container = mountPagination({ maxPage: undefined });
    expect(container.querySelector("[data-grid-total-pages]")).toBeNull();
    // The page-size selector stays usable without a known total.
    expect(container.textContent ?? "").toContain("100 rows");
  });

  it("does not show the indicator in infinite-scroll or load-all modes", () => {
    expect(mountPagination({ maxPage: 7, infiniteScrollEnabled: true }).querySelector("[data-grid-total-pages]")).toBeNull();
    expect(mountPagination({ maxPage: 7, loadAllRowsActive: true }).querySelector("[data-grid-total-pages]")).toBeNull();
  });
});
