export function showErrorMessage(message) {
    const errorDiv = document.querySelector(".error-message");
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}