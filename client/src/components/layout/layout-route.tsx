import type { ComponentType, ReactNode } from 'react';
import { Route, type RouteProps } from 'wouter';

interface LayoutRouteProps extends RouteProps {
  layout: ComponentType<{ children: ReactNode }>;
}

export function LayoutRoute({ layout: Layout, component: Component, ...rest }: LayoutRouteProps) {
  return <Route {...rest} component={(props) => <Layout>{Component ? <Component {...props} /> : null}</Layout>} />;
}
