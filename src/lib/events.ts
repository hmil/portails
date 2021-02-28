
export interface GameEvent<TYPE extends string = string, DATA = void> {
    readonly type: TYPE;
    readonly data: DATA;
}

export interface EventListener<T extends GameEvent> {
    (evt: T): void;
}

export class EventBus {

    private readonly listeners = new Map<string, Array<EventListener<GameEvent>>>()

    on<T extends GameEvent>(type: T['type'], cb: EventListener<T>): void {
        const bucket = this.listeners.get(type) ?? this.createBucket(type);
        bucket.push(cb as EventListener<GameEvent>);
    }

    emit<T extends GameEvent<any, any>>(event: T): void {
        const bucket = this.listeners.get(event.type);
        if (bucket != null) {
            bucket.forEach(b => b(event));
        }
    }

    private createBucket(type: string): Array<EventListener<GameEvent>> {
        const bucket: Array<EventListener<GameEvent>> = [];
        this.listeners.set(type, bucket);
        return bucket;
    }
}