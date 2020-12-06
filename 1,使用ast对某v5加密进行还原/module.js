global.Buffer = global.Buffer || require('buffer').Buffer;
if (typeof btoa === 'undefined') {
    global.btoa = function (str) {
        return new Buffer(str).toString('base64');
    };
}
if (typeof atob === 'undefined') {
    global.atob = function (b64Encoded) {
        return new Buffer(b64Encoded, 'base64').toString();
    };
}

;var encode_version = 'sojson.v5'
    , jrkqk = ''
    , _0x3318 = ['eMO1woTDnRU=', '6L6h5pmt5LuD5Lq85Lq857Gi5Ymtwqh55pCG5LyT44OQ', '56us6ZaG5o2S6auk57ufDuKDp8KuwqzliYHlrpbig7NT5ZCXwrrigaJPw5bopp3lrb7ig4zCt+++heS/peWMheS+leeYlCB8w7bjga4=', 'Z3rCqsKQ', 'wq12EsOow7A=', 'wq3Di8Kpw63CisKZwr4=', 'RMOdwpc=', 'NTREw4FsCMKIQsKB', '54qF5p+/5Y6E772jw5LDkeS8meWsjOafneW+uOepq++9pei9v+itk+aXt+aMh+aKgOS7rOealOW3seS8vw==', '5Yis6Zia54ms5p225Y6H772nKMO85L2n5a+b5p+W5b2756iM', 'VMOBwofDtDscbsOBw7k=', 'eAglw6V9', 'dFUCw7LCsA==', 'wqzCij0=', '5YuX6Zip54ig5p6p5Y+J772cwqbDpOS+guWvgeadpOW+reermQ=='];
(function(_0x1cab0b, _0x9fc93e) {
    var _0x50aee6 = function(_0x5f6b93) {
        while (--_0x5f6b93) {
            _0x1cab0b['push'](_0x1cab0b['shift']());
        }
    };
    _0x50aee6(++_0x9fc93e);
}(_0x3318, 0x12d));
var _0x4d94 = function(_0x387cf0, _0x46d6a3) {
    _0x387cf0 = _0x387cf0 - 0x0;
    var _0x1c7cd3 = _0x3318[_0x387cf0];
    if (_0x4d94['initialized'] === undefined) {
        (function() {
            var _0x9672bc = typeof window !== 'undefined' ? window : typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
            var _0x47acfd = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            _0x9672bc['atob'] || (_0x9672bc['atob'] = function(_0x4f114b) {
                    var _0xda79c1 = String(_0x4f114b)['replace'](/=+$/, '');
                    for (var _0x2456af = 0x0, _0xc64c02, _0x5e6923, _0x48f516 = 0x0, _0x448f43 = ''; _0x5e6923 = _0xda79c1['charAt'](_0x48f516++); ~_0x5e6923 && (_0xc64c02 = _0x2456af % 0x4 ? _0xc64c02 * 0x40 + _0x5e6923 : _0x5e6923,
                    _0x2456af++ % 0x4) ? _0x448f43 += String['fromCharCode'](0xff & _0xc64c02 >> (-0x2 * _0x2456af & 0x6)) : 0x0) {
                        _0x5e6923 = _0x47acfd['indexOf'](_0x5e6923);
                    }
                    return _0x448f43;
                }
            );
        }());
        var _0x15dca8 = function(_0xa971bc, _0x5e580d) {
            var _0x2a7b0e = [], _0x18c27c = 0x0, _0x8cce7, _0x21fe1e = '', _0x21ee82 = '';
            _0xa971bc = atob(_0xa971bc);
            for (var _0x465e88 = 0x0, _0x1826b5 = _0xa971bc['length']; _0x465e88 < _0x1826b5; _0x465e88++) {
                _0x21ee82 += '%' + ('00' + _0xa971bc['charCodeAt'](_0x465e88)['toString'](0x10))['slice'](-0x2);
            }
            // _0xa971bc = decodeURIComponent(_0x21ee82);
            for (var _0x559b8b = 0x0; _0x559b8b < 0x100; _0x559b8b++) {
                _0x2a7b0e[_0x559b8b] = _0x559b8b;
            }
            for (_0x559b8b = 0x0; _0x559b8b < 0x100; _0x559b8b++) {
                _0x18c27c = (_0x18c27c + _0x2a7b0e[_0x559b8b] + _0x5e580d['charCodeAt'](_0x559b8b % _0x5e580d['length'])) % 0x100;
                _0x8cce7 = _0x2a7b0e[_0x559b8b];
                _0x2a7b0e[_0x559b8b] = _0x2a7b0e[_0x18c27c];
                _0x2a7b0e[_0x18c27c] = _0x8cce7;
            }
            _0x559b8b = 0x0;
            _0x18c27c = 0x0;
            for (var _0x325076 = 0x0; _0x325076 < _0xa971bc['length']; _0x325076++) {
                _0x559b8b = (_0x559b8b + 0x1) % 0x100;
                _0x18c27c = (_0x18c27c + _0x2a7b0e[_0x559b8b]) % 0x100;
                _0x8cce7 = _0x2a7b0e[_0x559b8b];
                _0x2a7b0e[_0x559b8b] = _0x2a7b0e[_0x18c27c];
                _0x2a7b0e[_0x18c27c] = _0x8cce7;
                _0x21fe1e += String['fromCharCode'](_0xa971bc['charCodeAt'](_0x325076) ^ _0x2a7b0e[(_0x2a7b0e[_0x559b8b] + _0x2a7b0e[_0x18c27c]) % 0x100]);
            }
            return _0x21fe1e;
        };
        _0x4d94['rc4'] = _0x15dca8;
        _0x4d94['data'] = {};
        _0x4d94['initialized'] = !![];
    }
    var _0x281020 = _0x4d94['data'][_0x387cf0];
    if (_0x281020 === undefined) {
        if (_0x4d94['once'] === undefined) {
            _0x4d94['once'] = !![];
        }
        _0x1c7cd3 = _0x4d94['rc4'](_0x1c7cd3, _0x46d6a3);
        _0x4d94['data'][_0x387cf0] = _0x1c7cd3;
    } else {
        _0x1c7cd3 = _0x281020;
    }
    return _0x1c7cd3;
};


exports.decryptStr = _0x4d94;
exports.decryptStrFnName = '_0x4d94';
