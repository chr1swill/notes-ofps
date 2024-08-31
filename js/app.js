import { opfsWorkerMessage } from "./globals.js";
import { FolderListContainer } from "./components/FolderListContainer.js";

class DebounceWriteMessage {
    /**@type{Readonly<number>}*/
    #debounceTime = 3000;

    /**@type{number}*/
    #timeout = -1;

    /**
     * @param{ Worker } worker 
     * @param{ HTMLTextAreaElement | null } textInput
     */
    constructor(worker, textInput) {
        this.textInput = textInput;
        if (this.textInput === null) {
            console.error("Could not find element with id: #note_text_input");
            return;
        };

        if (!(worker instanceof Worker)) {
            console.error("Invalid worker was provided note able to post write message", worker);
            return;
        };
        this.worker = worker;
    }

    run() { 
        const that = this;

        if (that.#timeout !== -1) {
            clearTimeout(that.#timeout);
        };

        that.#timeout = setTimeout(function() {
            clearTimeout(that.#timeout);

            if (that.textInput === null) {
                console.error("Could not find element with id: #note_text_input");
                return;
            };

            const message = { type: opfsWorkerMessage.WRITE, content: that.textInput.value };
            console.debug("message being sent to worker: ", message);
            if (!(that.worker instanceof Worker)) {
                console.error("Invalid worker was provided note able to post write message", that.worker);
                return;
            };

            that.worker.postMessage(message);
        }, that.#debounceTime);
    };
};

class UpdateNoteStateMessage {
    #Messages = Object.freeze({
        DEFAULT: "", 
        EDITED: "Edited", // awaiting save
        SAVED: "Saved",
    });

    /**@type{Readonly<number>}*/
    DEFAULT = 0;
    /**@type{Readonly<number>}*/
    EDITED = 1;
    /**@type{Readonly<number>}*/
    SAVED = 2;

    #currentState = this.DEFAULT;

    #timeout = -1;
    #MS_BEFORE_TOGGLE_TO_DEFAULT = 3000;

    constructor() {
        this.textElement = document.getElementById("note_state_message");
        if (this.textElement === null) {
            console.error("Could not find element with id: #note_state_message");
            return;
        };

        this.#currentState = this.DEFAULT;
        this.textElement.textContent = this.#Messages.DEFAULT;
    };

    getCurrentState() {
        return this.#currentState;
    };

    default() {
        if (this.textElement === null) {
            console.error("Could not find element with id: #note_state_message");
            return;
        };
        this.#currentState = this.DEFAULT;
        this.textElement.textContent = this.#Messages.DEFAULT;
        clearTimeout(this.#timeout);
    };

    edited() {
        if (this.textElement === null) {
            console.error("Could not find element with id: #note_state_message");
            return;
        };
        this.#currentState = this.EDITED;
        this.textElement.textContent = this.#Messages.EDITED;
        if (this.#timeout !== -1) {
            clearTimeout(this.#timeout);
            this.#timeout = -1;
        };
    };

    saved() {
        if (this.textElement === null) {
            console.error("Could not find element with id: #note_state_message");
            return;
        };
        this.#currentState = this.SAVED;
        this.textElement.textContent = this.#Messages.SAVED;
        if (this.#timeout !== -1) {
            clearTimeout(this.#timeout);
            this.#timeout = -1;
        };
        const that = this;
        this.#timeout = setTimeout(function() {
            clearTimeout(that.#timeout);
            that.#timeout = -1;
            that.default();
        }, this.#MS_BEFORE_TOGGLE_TO_DEFAULT)
    };
};

function main() {
    const noteTextInput = /**@type{ HTMLTextAreaElement | null }*/
        (document.getElementById("note_text_input"));
    if (noteTextInput === null) {
        console.error("Could not find element with id: #note_text_input");
        return;
    };

    const noteFileName = document.getElementById("note_file_name");
    if (noteFileName === null) {
        console.error("Could not find element with id: #note_file_name");
        return;
    };


    const opfsWorker = new Worker("./js/opfs-worker.js", { type: 'module' });
    const writeMessageDebouncer = new DebounceWriteMessage(opfsWorker, noteTextInput);
    const noteStateMessageUpdater = new UpdateNoteStateMessage();

    opfsWorker.onmessage = function(e) {
        const message = e.data;
        if (message.type === opfsWorkerMessage.READ) {
            noteTextInput.value = message.content;
        } else if (message.type === opfsWorkerMessage.WRITE) {
            noteStateMessageUpdater.saved();
        } else {
            console.error("Recieved unknown message type from worker: ", message.type);
            return;
        };
    };

    noteTextInput.oninput = function() {
        if (noteStateMessageUpdater.getCurrentState() !== noteStateMessageUpdater.EDITED) {
            noteStateMessageUpdater.edited();
        };

        writeMessageDebouncer.run();
    };

    window.onload = function() {
        opfsWorker.postMessage({ type: opfsWorkerMessage.READ });
        new FolderListContainer().renderList();
    };
};
main();
