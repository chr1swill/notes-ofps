import { opfsWorkerMessage } from "./globals.js";

class DebounceWriteMessage {
    /**@type{Readonly<number>}*/
    #debounceTime = 5000;

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

    opfsWorker.onmessage = function(e) {
        const message = e.data;
        if (message.type === opfsWorkerMessage.READ) {
            noteTextInput.value = message.content;
        } else {
            console.error("Recieved unknown message type from worker: ", message.type);
            return;
        };
    };

    window.onload = function() {
        opfsWorker.postMessage({ type: opfsWorkerMessage.READ });
    };

    noteTextInput.oninput = function() {
        writeMessageDebouncer.run();
    };
};
main();
