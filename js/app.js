import { opfsWorkerMessage } from "./globals.js";

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
        const text = noteTextInput.value;
        console.debug("message being sent to worker: ", { type: opfsWorkerMessage.WRITE, content: text });
        opfsWorker.postMessage({ type: opfsWorkerMessage.WRITE, content: text });
    };
};
main();
