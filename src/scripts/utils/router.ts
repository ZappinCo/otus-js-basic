type RouteHandler = (params?: Record<string, string>) => void;

interface Route {
    path: string;
    handler: RouteHandler;
    isParametric: boolean;
    paramName: string | null;
}

interface RouteMatch {
    route: Route;
    params: Record<string, string>;
}

class Router {
    #routes: Route[] = [];

    constructor() {
        window.addEventListener('hashchange', () => this.#handleRoute());
        window.addEventListener('load', () => this.#handleRoute());
    }

    addRoute(path: string, handler: RouteHandler, isParametric = false) {
        this.#routes.push({
            path,
            handler,
            isParametric,
            paramName: isParametric ? (path.match(/:(\w+)/)?.[1] ?? null) : null
        });
        return this;
    }

    navigateTo(url: string, update = true) {
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

    #findRoute(pathname: string) {
        for (const route of this.#routes) {
            if (route.isParametric && route.paramName != null) {
                const pattern = route.path.replace(/:\w+/, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                const match = pathname.match(regex);

                if (match) {
                    return {
                        route,
                        params: { [route.paramName]: match[1] }
                    } as RouteMatch;
                }
            } else if (route.path === pathname) {
                return {
                    route,
                    params: {}
                } as RouteMatch;
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