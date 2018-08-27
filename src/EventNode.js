import EventEmitter from 'events';

class EventNode
{
	constructor()
	{
		this._events = new EventEmitter();
	}

	on(eventName, cb)
	{
		this._events.on(eventName, cb);
		return this;
	}

	emit(type, ...args)
	{
		this._events.emit(type, ...args);
	}
}

export {EventNode};