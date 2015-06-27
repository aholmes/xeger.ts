var Xeger = (function () {
    function Xeger(cb, options) {
        this.regexStr = '';
        this.flags = '';
        options = options || {};
        if (options.multiline) {
            this.flags += 'm';
        }
        if (options.global) {
            this.flags += 'g';
        }
        if (options.insensitive) {
            this.flags += 'i';
        }
        if (typeof cb === 'function') {
            cb.call(this, this);
        }
    }
    Xeger.prototype.add = function (str) {
        this.regexStr += str;
    };
    Xeger.prototype.addOptions = function (options) {
        options = options || {};
        switch (true) {
            case options.multiple && options.optional:
                this.add('*');
                break;
            case options.multiple:
                this.add('+');
                break;
            case options.optional:
                this.add('?');
                break;
            case typeof options.repeat === 'number':
                this.add('{' + options.repeat + '}');
                break;
            case typeof options.from === 'number' || typeof options.to === 'number':
                var from = typeof options.from === 'number' && options.from || '';
                var to = typeof options.to === 'number' && options.to || '';
                this.add("{" + from + "," + to + "}");
                break;
        }
    };
    Xeger.prototype.escape = function (str) {
        var result = '';
        for (var _i = 0; _i < str.length; _i++) {
            var char = str[_i];
            result += /\w/.test(char) ? char : ('\\' + char);
        }
        return result;
    };
    Xeger.prototype.literal = function (str, options) {
        var hasOptions = typeof options === 'object' &&
            Object.keys(options).length > 0 &&
            str.length > 1;
        this.add(hasOptions
            ? ('(?:' + this.escape(str) + ')')
            : this.escape(str));
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.alphanumeric = function (options) {
        this.add('\\w');
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.number = function (options) {
        this.add('\\d');
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.newline = function (options) {
        this.add('\\n');
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.whitespace = function (options) {
        this.add('\\s');
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.start = function () {
        this.add('^');
        return this;
    };
    Xeger.prototype.end = function () {
        this.add('$');
        return this;
    };
    Xeger.prototype.to = function () {
        this.add('-');
        return this;
    };
    Xeger.prototype.any = function (str, options) {
        switch (true) {
            case typeof str === 'string':
                this.add('[' + this.escape(str) + ']');
                break;
            case typeof str === 'function':
                this.add('[');
                str.call(this, this);
                this.add(']');
                break;
            default:
                options = str;
                this.add('.');
        }
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.not = function (str, options) {
        if (typeof str === 'string') {
            this.add("[^" + this.escape(str) + "]");
        }
        else if (typeof str === 'function') {
            var cb = str;
            this.add('[^');
            cb.call(this, this);
            this.add(']');
        }
        this.addOptions(options);
    };
    Xeger.prototype.group = function (cb, options) {
        this.add('(');
        if (options && options.ignore) {
            this.add('?:');
        }
        cb.call(this, this);
        this.add(')');
        this.addOptions(options);
        return this;
    };
    Xeger.prototype.regex = function () {
        return new RegExp(this.regexStr, this.flags);
    };
    return Xeger;
})();
module.exports = function (cb, options) {
    if (typeof cb !== 'function') {
        options = cb;
    }
    var r = new Xeger(cb, options);
    if (typeof cb === 'function') {
        return r.regex();
    }
    else {
        return r;
    }
};
