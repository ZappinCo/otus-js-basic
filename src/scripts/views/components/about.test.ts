import { AboutPage } from './about';
import router from '../../utils/router';

jest.mock('../../utils/router');

describe('AboutPage', () => {
    let aboutPage: AboutPage;
    let parentElement: HTMLElement;

    beforeEach(() => {
        jest.clearAllMocks();
        aboutPage = new AboutPage();
        parentElement = document.createElement('div');
    });

    describe('render', () => {
        test('should render about page container', () => {
            aboutPage.render(parentElement);

            const aboutPageDiv = parentElement.querySelector('.about-page');
            expect(aboutPageDiv).toBeTruthy();
            expect(aboutPageDiv?.className).toBe('about-page');
        });

        test('should render content wrapper', () => {
            aboutPage.render(parentElement);

            const content = parentElement.querySelector('.about-content');
            expect(content).toBeTruthy();
        });

        test('should render top navigation', () => {
            aboutPage.render(parentElement);

            const topNav = parentElement.querySelector('.about-top-nav');
            expect(topNav).toBeTruthy();
        });

        test('should render back button', () => {
            aboutPage.render(parentElement);

            const backButton = parentElement.querySelector('.back-home-btn') as HTMLButtonElement;
            expect(backButton).toBeTruthy();
            expect(backButton.textContent).toBe('На главную');
        });

        test('should render title', () => {
            aboutPage.render(parentElement);

            const title = parentElement.querySelector('h1');
            expect(title).toBeTruthy();
            expect(title?.textContent).toBe('О приложении "Прогноз погоды"');
        });

        test('should render about section', () => {
            aboutPage.render(parentElement);

            const section = parentElement.querySelector('.about-section');
            expect(section).toBeTruthy();
        });

        test('should render project title', () => {
            aboutPage.render(parentElement);

            const projectTitle = parentElement.querySelector('.about-section h2');
            expect(projectTitle).toBeTruthy();
            expect(projectTitle?.textContent).toBe('О проекте');
        });

        test('should render version text', () => {
            aboutPage.render(parentElement);

            const paragraphs = parentElement.querySelectorAll('.about-section p');
            const versionParagraph = paragraphs[0];
            expect(versionParagraph.textContent).toBe('Версия: 1.0.0');
        });

        test('should render description text', () => {
            aboutPage.render(parentElement);

            const paragraphs = parentElement.querySelectorAll('.about-section p');
            const descriptionParagraph = paragraphs[1];
            expect(descriptionParagraph.textContent).toBe('Разработано в рамках домашнего задания по курсу JavaScript Basic');
        });

        test('should render task text', () => {
            aboutPage.render(parentElement);

            const paragraphs = parentElement.querySelectorAll('.about-section p');
            const taskParagraph = paragraphs[2];
            expect(taskParagraph.textContent).toContain('Домашнее задание:');
            expect(taskParagraph.textContent).toContain('Клиентский роутинг для сохранения состояния приложения');
        });

        test('should replace parent content', () => {
            parentElement.innerHTML = '<div>Old content</div>';

            aboutPage.render(parentElement);

            expect(parentElement.children).toHaveLength(1);
            expect(parentElement.querySelector('.about-page')).toBeTruthy();
        });

        test('should return container element', () => {
            const result = aboutPage.render(parentElement);

            expect(result).toBeTruthy();
            expect(result.className).toBe('about-page');
        });
    });

    describe('back button functionality', () => {
        test('should navigate to home on button click', () => {
            aboutPage.render(parentElement);

            const backButton = parentElement.querySelector('.back-home-btn') as HTMLButtonElement;
            backButton.click();

            expect(router.navigateTo).toHaveBeenCalledWith('/');
        });

        test('should call router navigate exactly once per click', () => {
            aboutPage.render(parentElement);

            const backButton = parentElement.querySelector('.back-home-btn') as HTMLButtonElement;
            backButton.click();
            backButton.click();

            expect(router.navigateTo).toHaveBeenCalledTimes(2);
            expect(router.navigateTo).toHaveBeenCalledWith('/');
        });

        test('should navigate to home even when called multiple times', () => {
            aboutPage.render(parentElement);

            const backButton = parentElement.querySelector('.back-home-btn') as HTMLButtonElement;
            backButton.click();
            backButton.click();
            backButton.click();

            expect(router.navigateTo).toHaveBeenCalledTimes(3);
            expect(router.navigateTo).toHaveBeenCalledWith('/');
        });
    });
});