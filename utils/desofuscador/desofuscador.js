
var charMaps = require('./charMaps.json');
var patterns = {
    'HtmlEntitiesChar': /char\([0-9]{2,}\)/,
    'HtmlEntitiesAmp': /&[0-zZ]{2,}\;/,
    'HtmlEntitiesPer': /%[0-f]{2}/,
    'HexaChar': /[^%][0-f]{2}/
}

function decode(param) {
    let found = false;

    for (const key in patterns) {
        const pattern = patterns[key];
        const charMap = charMaps[key];

        param = param.replace(pattern, charMapKey => {
            const mapValue = charMap[charMapKey];
            if (mapValue) {
                found = true;
                return mapValue;
            } else {
                return charMapKey;
            }
        });
    }
    return { found: found, newValue: param };
}

function decodeIterator(param) {
    const decodeResult = decode(param);
    if (decodeResult) {
        if (decodeResult.found) {
            return decodeIterator(decodeResult.newValue);
        } else {
            return decodeResult.newValue;
        }
    }
}

module.exports = decodeIterator
