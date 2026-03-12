/**
 * @jest-environment jsdom
 */
import { runApp } from "./runApp.js";

describe('test run app', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should have all form fields', () => {
    runApp(element);

    const nameInput = element.querySelector('.callback__name');
    const emailInput = element.querySelector('.callback__email');
    const textarea = element.querySelector('.callback__text');

    expect(nameInput).toBeTruthy();
    expect(nameInput.type).toBe('text');
    expect(nameInput.required).toBe(true);

    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
    expect(emailInput.required).toBe(true);

    expect(textarea).toBeTruthy();
    expect(textarea.placeholder).toBe('Some text...');
  });

});
