/**
 *  An OPFS interface usable in a worker or on the main thread
 */
export class AsyncStorageHandler {

    /**@returns{ Promise<Array<string>> }*/
    async getAllRootDirectories() {
        const root = await navigator.storage.getDirectory() 
        /**@type{Array<string>}*/
        const directoryEnties = [];
        //@ts-ignore
        const directoryIterator = await root.entries();
        if (directoryIterator.length === 0) return directoryEnties;

        while (true) {
            const { value, done } = await directoryIterator.next();
            if (done) break;

            const [name, handle] = value;
            if (handle.kind === 'directory') {
                directoryEnties.push(name);
            };
        };

        return directoryEnties;
    };

    /**
     * only allowing one level of directories so no nested directories
     *
     * will create a directory if it does not exist or return the one matching the name you provided
     * @param {string} name
     * @returns {Promise<FileSystemDirectoryHandle>}
     */
    async getDirectory(name) {
        const root = await navigator.storage.getDirectory();
        return await root.getDirectoryHandle(name, { create: true });
    };

    /**
     *
     * returns the file handler that matches that provided file name in the given directory
     * if the directory or file name do not currently exisit it will create them/it and return the handler
     *
     * @param {string} directoryName
     * @param {string} fileName
     * @returns {Promise<FileSystemFileHandle>}
     */
    async getFile(directoryName, fileName) {
        const root = await navigator.storage.getDirectory();
        const directoryHandle = await root.getDirectoryHandle(directoryName, { create: true });
        return await directoryHandle.getFileHandle(fileName, { create: true });
    };
};
