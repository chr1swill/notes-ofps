import { opfsWorkerMessage } from "./globals.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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
            syncAccessHandle.write(textEncoder.encode(message.content), { at: 0 });
            syncAccessHandle.flush();
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
            const size = syncAccessHandle.getSize();
            const buffer = new ArrayBuffer(size);
            syncAccessHandle.read(buffer, { at: 0 });
            self.postMessage({ type: opfsWorkerMessage.READ, content: textDecoder.decode(buffer) });
            syncAccessHandle.close();
        }).catch(function(err) {
            console.error(err);
        });
    } else  {
        console.error("No handler has been set up for provided message type: ", message.type);
        return;
    };
};
