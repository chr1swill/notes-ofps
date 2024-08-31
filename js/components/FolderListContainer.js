import { AsyncStorageHandler } from '../storage.js';
import { toSnakeCase } from '../globals.js'

export class FolderListContainer {

    constructor() {
        const ulElement = document.getElementById("folder_list_container");
        if (ulElement === null) {
            throw new ReferenceError("Could not find an element matching id: #folder_list_container");
        };

        this.listContainer = ulElement;
        this.storageHandler = new AsyncStorageHandler();
    };

    async renderList() {
        const that = this;
        const fragment = new DocumentFragment();

        return new Promise(function(resolve) {
            resolve(that.storageHandler.getAllRootDirectories());
        }).then(function(arrayOfDirectoryNames) {
            while (arrayOfDirectoryNames.length > 0) {
                const folderListItem = new FolderListItem(arrayOfDirectoryNames[arrayOfDirectoryNames.length - 1]);
                fragment.prepend(folderListItem.getElement())
                arrayOfDirectoryNames.pop();
            };

            fragment.prepend(new AllNotesFolderListItem().getElement());
            that.emptyListContainer();
            that.listContainer.append(fragment);
        })
    };

    emptyListContainer() {
        while (this.listContainer.firstChild) {
            this.listContainer.removeChild(this.listContainer.firstChild);
        };
    }

};

function IconMoreInfoComponent() {
    const template = document.createElement("template");
    template.innerHTML = `<svg class="icon_more_info" width="84" xmlns="http://www.w3.org/2000/svg" height="84" fill="none"><g data-testid="button_more_info__default"><g class="fills"><rect rx="0" ry="0" width="84" height="84" class="frame-icon-color-background" /></g><g class="frame-children"><g data-testid="Ellipse"><circle cx="42" cy="42" r="42" class="fills" /><g class="strokes"><g class="inner-stroke-shape"><defs><clipPath id="b"><use href="#a" /></clipPath><circle cx="42" cy="42" id="a" style="fill: var(--icon-color-background); stroke-width: 24; stroke: var(--icon-color-foreground); stroke-opacity: 1;"r="42" /></defs><use href="#a" clip-path="url('#b')" /></g></g></g><g data-testid="Group"><circle cx="22" cy="42" style="fill: var(--icon-color-foreground); fill-opacity: 1;" r="6.5" class="fills" data-testid="Ellipse" /><circle cx="42" cy="42" style="fill: var(--icon-color-foreground); fill-opacity: 1;" r="6.5" class="fills" data-testid="Ellipse" /><circle cx="62" cy="42" style="fill: var(--icon-color-foreground); fill-opacity: 1;" r="6.5" class="fills" data-testid="Ellipse" /></g></g></g></svg>`;

    return template.cloneNode(true);
};

function IconFolderComponent() {
    const template = document.createElement("template");
    template.innerHTML = `<svg width="75" xmlns="http://www.w3.org/2000/svg" height="65.342" fill="none" class="icon_folder"><g><g><rect rx="0" ry="0" width="75" height="65.342"/></g><g><g><path d="M0 8c0-4.415 3.585-8 8-8h37.175L55 12.523h12c4.415 0 8 3.585 8 8v36.819c0 4.416-3.585 8-8 8H8c-4.415 0-8-3.584-8-8V8Z" style="fill: var(--icon-color-background); fill-opacity: 1;"/><g><g><defs><clipPath id="b"><use href="#a" /></clipPath><path d="M0 8c0-4.415 3.585-8 8-8h37.175L55 12.523h12c4.415 0 8 3.585 8 8v36.819c0 4.416-3.585 8-8 8H8c-4.415 0-8-3.584-8-8V8Z" id="a" style="fill: none; stroke-width: 20; stroke: var(--icon-color-stroke); stroke-opacity: 1;" /></defs><use href="#a" clip-path="url('#b')" /></g></g></g><g><path d="M59 19.523H0"/><g><path d="M59 19.523H0" style="fill: none; stroke-width: 6; stroke: var(--icon-color-stroke); stroke-opacity: 1;"/></g></g></g></g></svg>`;
    return template.cloneNode(true);
};

class FolderListItem {

    /**@param{string} name*/
    constructor(name) {
        let nameFormatedForId = toSnakeCase(name.trim());

        const li = document.createElement('li');
        li.classList.add("folder_list_item__container");
        li.id = `folder_list_item_${nameFormatedForId}`;

        const span = document.createElement('span');
        span.classList.add("folder_list_item__folder_title_wrapper");
        const i = document.createElement('i');
        i.classList.add("folder_list_item__folder_icon");
        i.appendChild(IconFolderComponent());

        const p = document.createElement('p');
        p.textContent = name;
        p.classList.add("folder_list_item__folder_title");
        span.appendChild(i);
        span.appendChild(p);

        const button = document.createElement("button");
        button.appendChild(IconMoreInfoComponent());

        li.appendChild(span);
        li.appendChild(button);

        li.onclick = function() {
            // handle click on componnet
        };
        button.onclick = function() {
            // handle click on more info button
        };

        this.element = li;
    };

    getElement() {
        return this.element;
    };
};

class AllNotesFolderListItem {

    constructor() {
        const li = document.createElement('li');
        li.classList.add("folder_list_item__container");
        li.id = `folder_list_item_all_notes_folder`;

        const span = document.createElement('span');
        span.classList.add("folder_list_item__folder_title_wrapper");
        const i = document.createElement('i');
        i.classList.add("folder_list_item__folder_icon");
        i.appendChild(IconFolderComponent());

        const p = document.createElement('p');
        p.textContent = 'All Notes';
        p.classList.add("folder_list_item__folder_title");
        span.appendChild(i);
        span.appendChild(p);

        li.appendChild(span);

        li.onclick = function() {
            // handle click on componnet
        };

        this.element = li;
    };

    getElement() {
        return this.element;
    };
};
