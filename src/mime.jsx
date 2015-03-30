'use strict';

function isVideo(type) {
    return /^video\/(?:webm|mp4)/.test(type);
}

function isImage(type) {
    return /^image\//.test(type);
}

module.exports = { isVideo, isImage };
