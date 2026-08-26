"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

type ModalPortalProps = {
  children: ReactNode;
};

export function ModalPortal({
  children,
}: ModalPortalProps) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setMounted(true);
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    children,
    document.body,
  );
}