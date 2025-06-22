export function renderPagination({ containerId, currentPage, next, previous, onPageChange }) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (previous) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Previous";
        prevBtn.classList.add("page-btn", "mx-1");
        prevBtn.onclick = () => onPageChange(currentPage - 1);
        container.appendChild(prevBtn);
    }

    const pageText = document.createElement("span");
    pageText.textContent = `Page ${currentPage}`;
    pageText.classList.add("mx-2");
    container.appendChild(pageText);

    if (next) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.classList.add("page-btn", "mx-1");
        nextBtn.onclick = () => onPageChange(currentPage + 1);
        container.appendChild(nextBtn);
    }
}
