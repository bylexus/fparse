
/**
 * accesses an object's property by evaluating the given path.
 *
 * Example:
 *  - Object: { a: { b: { c: 1 } } }
 *  - Path: ['a', 'b', 'c']
 *  - Result: 1
 *
 * @param object
 * @param path
 * @param fullPath
 * @returns
 */
export function getProperty(object: ValueObject, path: string[], fullPath: string) {
    let curr: (number | string | Function | Object) & { [key: string]: any } = object;
    let prev: ((number | string | Function | Object) & { [key: string]: any }) | null = null;
    for (let propName of path) {
        if (!['object', 'string'].includes(typeof curr)) {
            throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
        }
        if (typeof curr === 'object' && !(propName in curr)) {
            throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
        }
        if (typeof curr === 'string' && !curr.hasOwnProperty(propName)) {
            throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
        }
        prev = curr;
        curr = curr[propName];
    }

    if (typeof curr === 'object' && !(curr instanceof Array)) {
        throw new Error('Invalid value');
    }
    // If we have a function that is part of an object (e.g. array.includes()), we need to
    // bind the scope before returning:
    if (typeof curr === 'function' && prev) {
        curr = curr.bind(prev);
    }

    return curr;
}