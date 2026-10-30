import * as React from "react"
import "./Button.css"

type ButtonVariant = "default" | "outline" | "ghost"
type ButtonSize = "default" | "lg" | "icon"

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = ["button", `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(" ")

  if (asChild) {
    const child = React.Children.only(children)

    if (!React.isValidElement<{ className?: string }>(child)) {
      throw new Error("Button with asChild requires a single React element child.")
    }

    return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      ...props,
      className: [buttonClassName, child.props.className].filter(Boolean).join(" "),
    } as Record<string, unknown>)
  }

  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  )
}

export { Button }