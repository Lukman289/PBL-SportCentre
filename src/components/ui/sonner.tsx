"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "#E7F9ED",
          "--success-text": "#0E7B34",
          "--success-border": "#75D89E",
          "--error-bg": "#FEECEB",
          "--error-text": "#D72C0D",
          "--error-border": "#F9ADA3",
          "--warning-bg": "#FFF9E6",
          "--warning-text": "#946200",
          "--warning-border": "#FFCF70",
          "--info-bg": "#E5F1FB",
          "--info-text": "#006BB4",
          "--info-border": "#86C3F1",
          "--shadow": "0px 4px 12px rgba(0, 0, 0, 0.08)",
          "--border-radius": "8px",
        } as React.CSSProperties
      }
      richColors
      closeButton
      {...props}
    />
  )
}

export { Toaster }
