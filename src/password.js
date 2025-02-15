/**
 * Sets up event handling for a password input element
 * @param {HTMLElement} element - The password input DOM element
 * @param {Function} onPasswordSubmit - Callback function that receives the password value
 */
export function setupPasswordInput(element, onPasswordSubmit) {
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      // get current value from input field
      const password = element.value;
      // call the callback function with the password value
      onPasswordSubmit(password);
    }
  });
}
