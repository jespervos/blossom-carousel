/// <reference types="vite/client" />

import "react";

declare module "react" {
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}
