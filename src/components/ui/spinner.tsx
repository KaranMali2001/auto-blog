import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.ComponentProps<"svg"> {
  title?: string
  centered?: boolean
  size?: "sm" | "md" | "lg"
}

function Spinner({
  className,
  title,
  centered = false,
  size = "md",
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12"
  }

  const spinner = (
    <div className={cn("flex flex-col items-center gap-3", centered && "min-h-screen justify-center")}>
      <Loader2Icon
        role="status"
        aria-label={title || "Loading"}
        className={cn(sizeClasses[size], "animate-spin text-primary", className)}
        {...props}
      />
      {title && (
        <p className="text-sm text-muted-foreground animate-pulse">{title}</p>
      )}
    </div>
  )

  return spinner
}

export { Spinner }
