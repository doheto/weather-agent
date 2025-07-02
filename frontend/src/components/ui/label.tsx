import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

function Label({
  className,
  ...props
}: React.ComponentProps<"label"> &
  VariantProps<typeof labelVariants>) {
  return (
    <label
      className={cn(labelVariants(), className)}
      {...props}
    />
  )
}

export { Label } 