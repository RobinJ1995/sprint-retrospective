/*
 * Sorting functions
 */

// Sort by total:descending + alphabetically:ascending
export const sortRetrospectiveItems = (a: any, b: any) : number => {
    // By score
    const aScore: number = a.up - a.down;
    const bScore: number = b.up - b.down;
    if (aScore < bScore) {
        return 1;
    } else if (aScore > bScore) {
        return -1;
    }

    // Alphabetical
    const aTextLowerCase: string = String(a.text).toLowerCase();
    const bTextLowerCase: string = String(b.text).toLowerCase();
    if (aTextLowerCase < bTextLowerCase) {
        return -1;
    } else if (aTextLowerCase > bTextLowerCase) {
        return 1;
    }

    return 0;
};