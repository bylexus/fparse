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
export declare function getProperty(object: ValueObject, path: string[], fullPath: string): any[] | (number & {
    [key: string]: any;
}) | (Object & {
    [key: string]: any;
});
