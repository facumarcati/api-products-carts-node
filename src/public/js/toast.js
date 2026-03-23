const toastContainer = document.createElement("div");
toastContainer.classList.add("toast-container");
document.body.appendChild(toastContainer);

function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");

  toast.classList.add("toast", type);
  toast.innerHTML = `<span class="toast-dot"></span>${message}`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.replace("show", "hide");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
}
