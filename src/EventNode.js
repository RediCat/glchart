import EventEmitter from 'events';

class EventNode
{
	constructor()
	{
        this._loaded = false;
		this._events = new EventEmitter();
	}

	on(eventName, cb)
	{
        if (eventName === 'load' && this._loaded) {
            setTimeout(() => cb());
        } else {
            this._events.on(eventName, cb);
        }
		return this;
	}

	emit(type, ...args)
	{
        if (!this._loaded && type === 'load') {
            this._loaded = true;
        }
		this._events.emit(type, ...args);
	}
}

export {EventNode};