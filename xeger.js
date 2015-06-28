var Xeger = (function () {
    function Xeger(cb, options) {
        this.regexStr = '';
        this.flags = '';
        this.groups = [];
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
        return this;
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
        return this;
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
        return this.add(hasOptions
            ? ('(?:' + this.escape(str) + ')')
            : this.escape(str))
            .addOptions(options);
    };
    Xeger.prototype.alphanumeric = function (options) {
        return this.add('\\w')
            .addOptions(options);
    };
    Xeger.prototype.number = function (options) {
        return this.add('\\d')
            .addOptions(options);
    };
    Xeger.prototype.newline = function (options) {
        return this.add('\\n')
            .addOptions(options);
    };
    Xeger.prototype.whitespace = function (options) {
        return this.add('\\s')
            .addOptions(options);
    };
    Xeger.prototype.start = function () {
        return this.add('^');
    };
    Xeger.prototype.end = function () {
        return this.add('$');
    };
    Xeger.prototype.to = function () {
        return this.add('-');
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
        return this.addOptions(options);
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
        return this.addOptions(options);
    };
    Xeger.prototype.group = function (cb, options) {
        var startPosition = this.regexStr.length;
        this.add('(');
        if (options && options.ignore) {
            this.add('?:');
        }
        cb.call(this, this);
        this.add(')');
        this.groups.push(this.regexStr.substring(startPosition));
        return this.addOptions(options);
    };
    Xeger.prototype.backreference = function (group, options) {
        return typeof group === 'string'
            ? this.add("\\" + (this.groups.indexOf(group) + 1))
            : this.add("\\" + group);
    };
    Xeger.prototype.regex = function () {
        return new RegExp(this.regexStr, this.flags);
    };
    Xeger.prototype.toString = function () {
        return "/" + this.regexStr + "/" + this.flags;
    };
    Xeger.prototype.valueOf = function () {
        return this.regex();
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
