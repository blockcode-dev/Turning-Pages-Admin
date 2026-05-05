export function paginateHtml(html, pageHeight = 1050) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.visibility = "hidden";
  container.style.width = "720px";
  container.style.padding = "40px 50px";
  container.style.boxSizing = "border-box";
  container.innerHTML = html;

  document.body.appendChild(container);

  const pages = [];
  let currentPage = document.createElement("div");
  currentPage.style.height = `${pageHeight}px`;
  currentPage.style.overflow = "hidden";

  container.childNodes.forEach((node) => {
    currentPage.appendChild(node.cloneNode(true));

    if (currentPage.scrollHeight > pageHeight) {
      currentPage.removeChild(currentPage.lastChild);
      pages.push(currentPage.innerHTML);

      currentPage = document.createElement("div");
      currentPage.style.height = `${pageHeight}px`;
      currentPage.appendChild(node.cloneNode(true));
    }
  });

  pages.push(currentPage.innerHTML);
  document.body.removeChild(container);

  return pages;
}
