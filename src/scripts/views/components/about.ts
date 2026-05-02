import router from "../../utils/router";

export class AboutPage {
    render(parentElement: HTMLElement) {
        const container = document.createElement('div');
        container.className = 'about-page';

        const content = document.createElement('div');
        content.className = 'about-content';

        const topNav = document.createElement('div');
        topNav.className = 'about-top-nav';

        const backButton = document.createElement('button');
        backButton.className = 'back-home-btn';
        backButton.textContent = 'На главную';
        backButton.addEventListener('click', () => {
            router.navigateTo('/');
        });
        topNav.appendChild(backButton);

        const title = document.createElement('h1');
        title.textContent = 'О приложении "Прогноз погоды"';
        topNav.appendChild(title);

        content.appendChild(topNav);

        const projectSection = document.createElement('div');
        projectSection.className = 'about-section';

        const projectTitle = document.createElement('h2');
        projectTitle.textContent = 'О проекте';
        projectSection.appendChild(projectTitle);

        const versionText = document.createElement('p');
        versionText.textContent = 'Версия: 1.0.0';
        projectSection.appendChild(versionText);

        const descriptionText = document.createElement('p');
        descriptionText.textContent = 'Разработано в рамках домашнего задания по курсу JavaScript Basic';
        projectSection.appendChild(descriptionText);

        const taskText = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'Домашнее задание: ';
        taskText.appendChild(strong);
        taskText.appendChild(document.createTextNode('Клиентский роутинг для сохранения состояния приложения (город для которого показывается погода)'));
        projectSection.appendChild(taskText);

        content.appendChild(projectSection);

        container.appendChild(content);
        parentElement.replaceChildren(container);
        return container;
    }
}