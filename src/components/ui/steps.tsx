"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, CircleDashed } from "lucide-react";

export interface StepItem {
  title: string;
  description?: string;
  status: "complete" | "current" | "upcoming";
}

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: StepItem[];
  orientation?: "vertical" | "horizontal";
}

export function Steps({
  items,
  orientation = "vertical",
  className,
  ...props
}: StepsProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex",
            orientation === "vertical" ? "flex-row" : "flex-col items-center"
          )}
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                item.status === "complete"
                  ? "border-green-600 bg-green-100"
                  : item.status === "current"
                  ? "border-blue-600 bg-blue-100"
                  : "border-gray-300 bg-gray-100"
              )}
            >
              {item.status === "complete" ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : item.status === "current" ? (
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              ) : (
                <CircleDashed className="h-4 w-4 text-gray-400" />
              )}
            </div>
            {index < items.length - 1 && orientation === "vertical" && (
              <div
                className={cn(
                  "mx-auto h-10 w-0.5",
                  item.status === "complete" ? "bg-green-600" : "bg-gray-300"
                )}
              />
            )}
          </div>
          <div
            className={cn(
              "flex flex-col",
              orientation === "vertical" ? "ml-4" : "mt-2 items-center"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                item.status === "complete"
                  ? "text-green-600"
                  : item.status === "current"
                  ? "text-blue-600"
                  : "text-gray-500"
              )}
            >
              {item.title}
            </span>
            {item.description && (
              <span className="text-xs text-gray-500">{item.description}</span>
            )}
          </div>
          {index < items.length - 1 && orientation === "horizontal" && (
            <div
              className={cn(
                "mx-2 h-0.5 flex-1",
                item.status === "complete" ? "bg-green-600" : "bg-gray-300"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
} 