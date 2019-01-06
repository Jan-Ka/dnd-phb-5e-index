/**
 * @file DnD 5e index crawler specific helper and utility functions
 */

/**
 * Helper function to make array like objects iterable
 * @param {any[]} arrayLike
 * @returns items within the arrayLike mapped into an array or an empty array
 */
function arrayLikeToArray(arrayLike) {
    if (typeof (arrayLike) === "undefined" || arrayLike === null) {
        return [];
    }

    if (Array.isArray(arrayLike)) {
        return arrayLike;
    }

    var result = [];

    if (arrayLike instanceof FileList) {
        for (var i = 0; i < arrayLike.length; i++) {
            result.push(arrayLike.item(i));
        }
    } else {
        for (var arrayLikeKey in arrayLike) {
            if (!arrayLike.hasOwnProperty(arrayLikeKey)) {
                continue;
            }

            result.push(arrayLike[arrayLikeKey]);
        }
    }

    return result;
}

/**
 * Clear all child nodes from element
 * @param {HTMLElement} element 
 */
function clearChildren(element) {
    var range = document.createRange();

    range.selectNodeContents(element);
    range.deleteContents();

    range.detach();
}