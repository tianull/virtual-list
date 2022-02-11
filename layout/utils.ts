import { Item } from './src/types';

export function get(source: Item, path: string, defaultValue = undefined): string {
    // a[3].b -> a.3.b
    const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let result;
    for (const p of paths) {
        result = result ? result[p] : source[p];
        if (result === undefined) {
            return defaultValue;
        }
    }
    return result;
}
