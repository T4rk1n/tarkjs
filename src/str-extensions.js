/**
 * Created by T4rk on 6/19/2017.
 */

const defaultFindAllOptions = {
    indexGet: 1, raw: true
}

/**
 * Find all regex matches in a string.
 * @param str {string}
 * @param re {RegExp}
 * @param options {{}}
 * @return {Array}
 */
export const findAllMatches = (str, re, options=defaultFindAllOptions) => {
    const { indexGet, raw } = {...defaultFindAllOptions, ...options}
    const matches = []
    let m
    while (m = re.exec(str)) {
        matches.push(raw ? m : m[indexGet])
    }
    return matches
}

export const capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1, str.length)}`
