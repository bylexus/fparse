export class MathOperatorHelper {
    static throwIfNotNumber(value: number | string) {
        const valueType = typeof value;
        if (valueType === 'string') {
            throw new Error('Strings are not allowed in math operations');
        }
    }
}
