import { showErrorMessage } from "./showErrorMessage";

describe('showErrorMessage', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="error-message"></div>';
    jest.useFakeTimers();
  });

  test('show and hide', () => {
    const errorDiv = document.querySelector('.error-message');
    
    showErrorMessage('Ошибка');
    expect(errorDiv.style.display).toBe('block');
    expect(errorDiv.textContent).toBe('Ошибка');
    
    jest.advanceTimersByTime(3000);
    expect(errorDiv.style.display).toBe('none');
  });
});