
export interface BaseAction<Type extends string, DATA> {
    type: Type;
    data: DATA;
}

export interface ActionFactory<Type extends string, S, D> {
    (d: UnknownToVoid<D>): BaseAction<Type, UnknownToVoid<D>>;
    reduce(s: S, a: D): S;
}

type UnknownToVoid<T> = unknown extends T ? T extends void ? T : void : T;

export function action<T extends string, S, D>(type: T, factory: (s: S, data: D) => S): ActionFactory<T, S, D> {
    const f: ActionFactory<T, S, D> = data => ({ data, type });
    f.reduce = factory;
    return f;
}

type UnionOfReturnValues<T extends { [k: string]: any}, K extends keyof T> = K extends keyof T ? ReturnType<T[K]> : never;
export type ActionTypes<T extends {[k: string]: any}> = UnionOfReturnValues<T, keyof T>;
