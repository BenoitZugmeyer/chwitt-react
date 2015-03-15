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

ss.vars = {
    gap: 6,
};

module.exports = ss;
