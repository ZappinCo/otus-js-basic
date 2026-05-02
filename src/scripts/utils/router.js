class Router {
    #routes = [];

    constructor() {
        window.addEventListener('hashchange', () => this.#handleRoute());
        window.addEventListener('load', () => this.#handleRoute());
    }

    addRoute(path, handler, isParametric = false) {
        this.#routes.push({
            path,
            handler,
            isParametric,
            paramName: isParametric ? path.match(/:(\w+)/)?.[1] : null
        });
        return this;
    }

    navigateTo(url, update = true) {
        if (update) {
            window.location.hash = url;
        } else {
            window.history.pushState({}, '', `#${url}`);
        }
    }

    #getCurrentPath() {
        const hash = window.location.hash.slice(1);
        return hash || '/';
    }

    #findRoute(pathname) {
        for (const route of this.#routes) {
            if (route.isParametric) {
                const pattern = route.path.replace(/:\w+/, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                const match = pathname.match(regex);

                if (match) {
                    return {
                        route,
                        params: { [route.paramName]: match[1] }
                    };
                }
            } else if (route.path === pathname) {
                return {
                    route,
                    params: {}
                };
            }
        }
        return null;
    }

    #handleRoute() {
        const pathname = this.#getCurrentPath();
        const routeMatch = this.#findRoute(pathname);

        if (routeMatch) {
            routeMatch.route.handler(routeMatch.params);
        } else {
            this.navigateTo('/');
        }
    }
}

export default new Router();