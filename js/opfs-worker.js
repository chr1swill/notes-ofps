import { opfsWorkerMessage } from "./globals.js";

class SyncFileHandler {
    #textEncoder;
    #textDecoder;

    /**
     * @param{TextEncoder | undefined} [textEncoder=undefined]
     * @param{TextDecoder | undefined} [textDecoder=undefined]
     */
    constructor(textEncoder = undefined, textDecoder = undefined) {
        if (textEncoder instanceof TextEncoder) {
            this.#textEncoder = textEncoder;
        } else {
            this.#textEncoder = new TextEncoder();
        };

        if (textDecoder instanceof TextDecoder) {
            this.#textDecoder = textDecoder;
        } else {
            this.#textDecoder = new TextDecoder();
        };
    };


    /**
     * @param {*} syncAccessHandle - type is FileSystemSyncAccessHandle
     * @param {string} content
     * @param {number} [offset=0]
     * @return {void}
     */
    write(syncAccessHandle, content, offset = 0) {
        try {
            syncAccessHandle.write(this.#textEncoder.encode(content), { at: offset });
            syncAccessHandle.flush()
        } catch (err) {
            console.error(err);
        }; 
    };

    /**
     * @param {*} syncAccessHandle - type is FileSystemSyncAccessHandle
     * @param {number} [offset=0]
     * @return {string | undefined}
     */
    read(syncAccessHandle, offset = 0) {
        try {
            const size = syncAccessHandle.getSize();
            const buffer = new ArrayBuffer(size);
            syncAccessHandle.read(buffer, { at: offset }); 
            return this.#textDecoder.decode(buffer);
        } catch (err) {
            console.error(err);
            return;
        };
    };
};

const syncFileHandler = new SyncFileHandler();

self.onerror = function(e) {
    console.error(e);
};

self.onmessage = function(e) {
    const message = e.data;
    if (message.type === opfsWorkerMessage.WRITE) {
        navigator.storage.getDirectory().then(function(opfsRoot) {
            return new Promise(function(resolve) {
                resolve(opfsRoot.getFileHandle("text.txt", { create: true }));
            });
        }).then(function(fileHandle) {
            return new Promise(function(resolve) {
                resolve(fileHandle.createSyncAccessHandle());
            });
        }).then(function(syncAccessHandle) {
            syncFileHandler.write(syncAccessHandle, message.content, 0);
            self.postMessage({ type: opfsWorkerMessage.WRITE });
            syncAccessHandle.close();
        }).catch(function(err) {
            console.error(err);
        });
        return;
    } else if (message.type === opfsWorkerMessage.READ) {
        navigator.storage.getDirectory().then(function(opfsRoot) {
            return new Promise(function(resolve) {
                resolve(opfsRoot.getFileHandle("text.txt", { create: true }));
            });
        }).then(function(fileHandle) {
            return new Promise(function(resolve) {
                resolve(fileHandle.createSyncAccessHandle());
            });
        }).then(function(syncAccessHandle) {
            const content = syncFileHandler.read(syncAccessHandle, 0);
            console.assert(content === undefined, "Failed to read data from the sync access handler");
            self.postMessage({ type: opfsWorkerMessage.READ, content: content === undefined ? "" : content });
            syncAccessHandle.close();
        }).catch(function(err) {
            console.error(err);
        });
    } else {
        console.error("No handler has been set up for provided message type: ", message.type);
        return;
    };
};
