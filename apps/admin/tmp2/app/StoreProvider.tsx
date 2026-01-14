"use client";

import { store } from "@/store";
import { createElement, type ComponentType, type ReactNode } from "react";
import { Provider } from "react-redux";

interface Props {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  return <Provider store={store}>{children}</Provider>;
};

export function withStoreProvider<T extends object>(
  component: ComponentType<T>,
): ComponentType<T> {
  return function WrappedComponent(props: T) {
    return <StoreProvider>{createElement(component, props)}</StoreProvider>;
  };
}
