import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'plain'
  trailing?: ReactNode
}

const variants = {
  primary: [
    'inline-flex min-h-14 select-none touch-manipulation items-center justify-center gap-2 rounded-xl bg-scottle px-5 text-base font-semibold text-white',
    '[-webkit-tap-highlight-color:transparent]',
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_0_0_#075985]',
    'transition-[transform,translate,box-shadow,filter] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    'enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 enabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_0_0_#075985]',
    'enabled:active:translate-y-1 enabled:active:brightness-100 enabled:active:duration-75 enabled:active:ease-out enabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_0_0_0_#075985]',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-scottle',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_0_0_#075985]',
    'motion-reduce:transition-none',
  ].join(' '),
  plain:
    'inline-flex items-center justify-center bg-transparent text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scottle',
}
export function Button({ variant = 'primary', trailing, className = '', children, ...props }: Props) {
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
      {trailing}
    </button>
  )
}