// Fully independent js script to add full screen (page) button and button for moving top (header)
// Those buttons are useful on small screen devices
// Tested only with doxygen 1.13.2
// May don't work on other versions

var page_layout = 1;

const storage = {
    get: (name) => localStorage.getItem(name) === 'true',
    set: (name, value) => localStorage.setItem(name, value),
    header: (value) => value !== undefined ? storage.set('headerAttached', value) : storage.get('headerAttached'),
    fullPage: (value) => value !== undefined ? storage.set('fullPage', value) : storage.get('fullPage')
};

document.addEventListener('DOMContentLoaded', () => {
    const domCache = {
        topDiv: document.getElementById('top'),
        sideNav: document.getElementById('side-nav'),
        projectRow: document.getElementById('projectrow'),
        mSearchBox: document.getElementById('MSearchBox'),
        handle: $(".ui-resizable-handle"),
        sidenav: $("#side-nav"),
        body: document.body
    };

    var toggleButtonPos = 20;
    const toggleButtonOffset = 10;
    const toggleButtonSize = 20;

    function createToggleButton(id, title, symbol, clickHandler) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.title = title;
        btn.textContent = symbol;
        btn.addEventListener('click', clickHandler);

        Object.assign(btn.style, {
            position: 'fixed',
            right: toggleButtonPos + 'px',
            top: '10px',
            background: 'var(--nav-background-color)',
            border: '1px solid var(--nav-separator-color)',
            color: 'var(--nav-text-normal-color)',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: '1001',
            fontSize: '10px'
        });

        toggleButtonPos += toggleButtonOffset + toggleButtonSize;

        return btn;
    }

    const sidebar = {
        toggle: (open) => {
            domCache.sidenav.width(open ? 0 : 1);
            domCache.handle.trigger("dblclick");
        },
        close: () => sidebar.toggle(false)
    };

    const headerManager = {
        toggle: (isAttached) => {
            const { mSearchBox, projectRow, topDiv, sideNav, body } = domCache;
            const mSearchTd = mSearchBox.parentElement;
            const currentTr = mSearchTd.parentElement;
            const tbody = projectRow.parentElement;

            if (isAttached) {
                if (currentTr === projectRow) {
                    projectRow.removeChild(mSearchTd);
                    mSearchTd.setAttribute('colspan', '2');
                    const newTr = document.createElement('tr');
                    newTr.appendChild(mSearchTd);
                    tbody.insertBefore(newTr, projectRow.nextSibling);
                }
                sideNav.insertBefore(topDiv, sideNav.firstChild);

                Object.assign(mSearchBox.style, {
                    position: '',
                    right: '',
                    margin: ''
                });
            } else {
                if (currentTr !== projectRow) {
                    currentTr.removeChild(mSearchTd);
                    tbody.removeChild(currentTr);
                    mSearchTd.removeAttribute('colspan');
                    projectRow.appendChild(mSearchTd);
                }
                body.insertBefore(topDiv, body.firstChild);

                Object.assign(mSearchBox.style, {
                    position: 'absolute',
                    right: '5px',
                    margin: '0px'
                });
            }

            body.classList.toggle('fullHeaderActive', !isAttached);
            $(window).trigger('resize');
        }
    };

    const eventHandlers = {
        onHeaderToggle: () => {
            let isAttached = storage.header();
            if (!storage.fullPage()) isAttached = !isAttached;
            storage.fullPage(false);

            page_layout = isAttached ? 1 : 0;
            sidebar.toggle(true);
            headerManager.toggle(isAttached);
            storage.header(isAttached);
        },
        onFullscreenToggle: () => {
            let isFullPage = !storage.fullPage();

            if (isFullPage) {
                page_layout = 1;
                headerManager.toggle(true);
                sidebar.close();
            } else eventHandlers.onHeaderToggle();
            
            storage.fullPage(isFullPage);
        }
    };

    domCache.body.appendChild(
        createToggleButton('toggleHeader', 'Toggle header', '☰', eventHandlers.onHeaderToggle)
    );
    domCache.body.appendChild(
        createToggleButton('toggleFullscreen', 'Toggle full page', '⛶', eventHandlers.onFullscreenToggle)
    );

    if (storage.fullPage()) {
        page_layout = 1;
        headerManager.toggle(true);
        sidebar.close();
    } else {
        const isAttached = storage.header();
        page_layout = isAttached ? 1 : 0;
        headerManager.toggle(isAttached);
    }
});