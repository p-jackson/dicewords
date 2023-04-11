for (const range of document.querySelectorAll('input[type="range"]')) {
  range.addEventListener("input", ({ target }) => {
    target.nextElementSibling.textContent = target.value;
  });
}
