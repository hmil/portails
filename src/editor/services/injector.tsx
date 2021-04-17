import { memo } from "editor/ui/hooks/utils";
import * as React from "react";

export interface Injector<T> {
    provider: React.Provider<T>;
    factory: () => T;
}

export interface InjectorProps {
    injectors: ReadonlyArray<Injector<any>>;
}

export function createServiceModule<T extends { new(...args: any[]): any}>(ctr: T) {
    return new ServiceModule(ctr);
}

export class ServiceModule<T extends { new(...args: any[]): any}> {

    constructor(private readonly ctr: T) { }

    provide = memo((...args: ConstructorParameters<T>) => new this.ctr(...args));

    // TODO: Would be nice of react to throw an error when context is not defined rather than returning a stupid default
    context = React.createContext<InstanceType<T>>(undefined as any);

    injector = (args: () => ConstructorParameters<T>): Injector<InstanceType<T>> => ({
        factory: () => this.provide(...args()),
        provider: this.context.Provider
    });

    get = () => React.useContext(this.context);
}

export function Injector(props: React.PropsWithChildren<InjectorProps>) {
    if (props.injectors.length === 0) {
        return <>{props.children}</>;
    }
    const i = props.injectors[0];
    return <><i.provider value={i.factory()}><Injector injectors={props.injectors.slice(1)}>{props.children}</Injector></i.provider></>;
}