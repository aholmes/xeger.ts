interface ConstructorOptions
{
	global?: boolean;
	multiline?: boolean;
	insensitive?: boolean;
}

interface RuleOptions
{
	multiple?: boolean;
	optional?: boolean;
	repeat?: number;
	from?: number;
	to?: number;
}

interface GroupOptions extends RuleOptions
{
	ignore?: boolean;
}

class Xeger
{
	public regexStr = '';
	public flags = '';

	constructor(cb?: (xeger: Xeger) => void, options?: ConstructorOptions)
	{
		options = options || {};

		if (options.multiline)
		{
			this.flags += 'm';
		}
		if (options.global)
		{
			this.flags += 'g';
		}
		if (options.insensitive)
		{
			this.flags += 'i';
		}
		if (typeof cb === 'function')
		{
			cb.call(this, this);
		}
	}

	private add(str: string)
	{
		this.regexStr += str;
	}

	private addOptions(options?: RuleOptions)
	{
		options = options || {};

		switch (true)
		{
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
				var to   = typeof options.to   === 'number' && options.to   || '';
				this.add(`{${from},${to}}`);
			break;
		}
	}

	private escape(str: string)
	{
		var result = '';
		for (var char of str)
		{
			result += /\w/.test(char) ? char : ('\\' + char);
		}

		return result;
	}


	public literal(str: string, options?: RuleOptions)
	{
		var hasOptions = typeof options === 'object' &&
			Object.keys(options).length > 0 &&
			str.length > 1;

		this.add(hasOptions
			? ('(?:' + this.escape(str) + ')')
			: this.escape(str)
		);

		this.addOptions(options);

		return this;
	}

	public alphanumeric(options?: RuleOptions)
	{
		this.add('\\w');
		this.addOptions(options);

		return this;
	}

	public number(options?: RuleOptions)
	{
		this.add('\\d');
		this.addOptions(options);

		return this;
	}

	public newline(options?: RuleOptions)
	{
		this.add('\\n');
		this.addOptions(options);

		return this;
	}

	public whitespace(options?: RuleOptions)
	{
		this.add('\\s');
		this.addOptions(options);

		return this;
	}

	public start()
	{
		this.add('^');

		return this;
	}

	public end()
	{
		this.add('$');

		return this;
	}

	public to()
	{
		this.add('-');

		return this;
	}

	public any(str: string|Function|RuleOptions, options?: RuleOptions)
	{
		switch (true)
		{
			case typeof str === 'string':
				this.add('[' + this.escape(<string>str) + ']');
			break;

			case typeof str === 'function':
				this.add('[');
				(<Function>str).call(this, this);
				this.add(']');
			break;

			default:
				options = str;
				this.add('.');
		}

		this.addOptions(options);
		return this;
	}

	public not(str?: string|Function, options?: RuleOptions)
	{
		if (typeof str === 'string')
		{
			this.add(`[^${this.escape(str)}]`);
		}
		else if (typeof str === 'function')
		{
			var cb = str;
			this.add('[^');
			cb.call(this, this);
			this.add(']');
		}
		this.addOptions(options);
	}

	public group(cb: Function, options?: GroupOptions)
	{
		this.add('(');
		if (options && options.ignore)
		{
			this.add('?:');
		}
		cb.call(this, this);
		this.add(')');
		this.addOptions(options);

		return this;
	}

	public regex()
	{
		return new RegExp(this.regexStr, this.flags);
	}

	public toString()
	{
		return `/${this.regexStr}/${this.flags}`;
	}

	public valueOf()
	{
		return this.regex();
	}
}

export = (cb: (xeger: Xeger) => void, options: ConstructorOptions): Xeger|RegExp =>
{
	if (typeof cb !== 'function')
	{
		options = cb;
	}
	var r = new Xeger(cb, options);

	if (typeof cb === 'function')
	{
		return r.regex();
	}
	else
	{
		return r;
	}
};