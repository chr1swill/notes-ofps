export const opfsWorkerMessage = Object.freeze({
    WRITE: 0,
    READ: 1,
    DELETE: 2,
    MOVE: 3,
});

/**
 *
 * for the one use case it is faster than a regex :)
 *
 * @param{string} input
 * @returns {string}
 */
export function toSnakeCase(input) {
    const inputLength = input.length;
    const output = new Array(inputLength);
    for (let i = 0; i < inputLength; i++) {
        //@ts-ignore
        if (input.i !== ' ') { 
            //@ts-ignore
            output.i = input.i;
        } else {
            //@ts-ignore
            output.i = "_";
        };
    };
    return output.join('');
};
