'use strict';
var sansSel = require('sans-sel');

var ss = sansSel();

ss.add('link', {
    color: '#34495E',
    textDecoration: 'none',
    cursor: 'pointer',
    hover: {
        color: '#2C3E50'
    }
});

ss.add('link-light', {
    inherit: 'link',
    color: '#ECF0F1',
    // textShadow: [0, 0, 1, 'rgba(255, 255, 255, .4)'],
    hover: {
        color: '#BDC3C7',
    }
});

ss.transforms.$smallBoxShadow = {
    boxShadow: '0 0 5px rgba(0, 0, 0, .6)',
};

ss.transforms.$smallFontSize = {
    fontSize: '11px',
};

ss.transforms.$rounded = {
    borderRadius: 4,
};

ss.transforms.$inputPadding = {
    padding: [4, 6],
};

ss.transforms.$button = {
    backgroundColor: '#16A085',
    $rounded: true,
    $inputPadding: true,
    boxSizing: 'border-box',
    border: 0,
    outline: 0,
    color: '#fff',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    cursor: 'pointer',
    transition: '-webkit-filter .1s',
    hover: {
        WebkitFilter: 'brightness(1.1)',
    },
    active: {
        WebkitFilter: 'brightness(1.2)',
    },
};

function svgBackground(box, content) {
    var image = new Buffer(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${content}</svg>`).toString('base64');
    return {
        backgroundImage: `url(data:image/svg+xml;base64,${image})`,
    };
}

ss.transforms.$svgBackground = (desc) => {
    var box, content;

    if (typeof desc === 'string') content = desc;
    else {
        box = desc.box;
        content = desc.content;
    }

    return svgBackground(box || '0 0 24 24', content);

};

// http://www.flaticon.com/free-icon/tip-pen_68843
ss.transforms.$penIcon = svgBackground('0 0 401.047 401.047', `
<path fill="#fff" d="M330.045,195.219L290.31,86.76c-1.673-4.563-6.899-8.299-11.616-8.299h-156.34c-4.717,0-9.943,3.734-11.615,8.299
    L71.003,195.219c-1.674,4.564-1.234,11.828,0.975,16.144l89.529,181.61c2.208,4.313,7.874,7.843,12.591,7.843h11.643
    c4.717,0,8.44-3.99,8.275-8.869l-2.705-178.517c-0.167-4.879-3.434-11.203-7.263-14.055c0,0-15.611-11.626-15.611-26.537
    c0-18.34,14.366-33.207,32.088-33.207c17.721,0,32.088,14.867,32.088,33.207c0,14.911-15.611,26.537-15.611,26.537
    c-3.829,2.852-7.104,9.176-7.277,14.053l-2.949,178.75c-0.176,4.877,3.541,8.869,8.258,8.869h12.031
    c4.717,0,10.383-3.529,12.592-7.844l89.418-181.844C331.279,207.047,331.717,199.784,330.045,195.219z"/>
<path fill="#fff" d="M108.023,61.328h185c4.717,0,8.576-3.994,8.576-8.876V8.875c0-4.883-3.859-8.875-8.576-8.875h-185
    c-4.717,0-8.576,3.992-8.576,8.875v43.577C99.446,57.334,103.307,61.328,108.023,61.328z"/>
`);

ss.vars = {
    gap: 6,
    avatarSize: 48,
};

module.exports = ss;
