import { forwardRef, type ComponentProps } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

type NavLinkCompatProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
};

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pending, to, ...props }, ref) => {
    const { pathname } = useLocation();
    const target = to.split(/[?#]/)[0] || "/";
    const isActive = pathname === target || (target !== "/" && pathname.startsWith(`${target}/`));
    return <Link ref={ref} to={to} className={cn(className, isActive && activeClassName)} {...props} />;
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
