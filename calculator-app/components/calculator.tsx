"use client"

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Op = "+" | "-" | "*" | "/" | "^" | "%"

const OPERATORS: Op[] = ["+", "-", "*", "/", "^", "%"]

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b
    case "-":
      return a - b
    case "*":
      return a * b
    case "/":
      return b === 0 ? Number.NaN : a / b
    case "^":
      return Math.pow(a, b)
    case "%":
      return b === 0 ? Number.NaN : a % b
  }
}

const OP_LABEL: Record<Op, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "^": "^",
  "%": "%",
}

export function Calculator() {
  const [display, setDisplay] = useState("0")
  const [accumulator, setAccumulator] = useState<number | null>(null)
  const [pendingOp, setPendingOp] = useState<Op | null>(null)
  const [overwrite, setOverwrite] = useState(true)

  const formatResult = useCallback((n: number): string => {
    if (Number.isNaN(n) || !Number.isFinite(n)) return "Error"
    const rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10
    return String(rounded)
  }, [])

  const inputDigit = useCallback(
    (digit: string) => {
      setDisplay((prev) => {
        if (overwrite || prev === "0" || prev === "Error") {
          return digit
        }
        return prev + digit
      })
      setOverwrite(false)
    },
    [overwrite],
  )

  const inputDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (overwrite || prev === "Error") return "0."
      if (prev.includes(".")) return prev
      return prev + "."
    })
    setOverwrite(false)
  }, [overwrite])

  const clearAll = useCallback(() => {
    setDisplay("0")
    setAccumulator(null)
    setPendingOp(null)
    setOverwrite(true)
  }, [])

  const toggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return prev
      return prev.startsWith("-") ? prev.slice(1) : "-" + prev
    })
  }, [])

  const backspace = useCallback(() => {
    if (overwrite) return
    setDisplay((prev) => {
      if (prev === "Error") return "0"
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith("-"))) {
        return "0"
      }
      return prev.slice(0, -1)
    })
  }, [overwrite])

  const chooseOperator = useCallback(
    (op: Op) => {
      const current = Number.parseFloat(display)
      if (pendingOp !== null && accumulator !== null && !overwrite) {
        const result = compute(accumulator, current, pendingOp)
        const formatted = formatResult(result)
        setDisplay(formatted)
        setAccumulator(formatted === "Error" ? null : result)
      } else {
        setAccumulator(current)
      }
      setPendingOp(op)
      setOverwrite(true)
    },
    [display, pendingOp, accumulator, overwrite, formatResult],
  )

  const equals = useCallback(() => {
    if (pendingOp === null || accumulator === null) return
    const current = Number.parseFloat(display)
    const result = compute(accumulator, current, pendingOp)
    setDisplay(formatResult(result))
    setAccumulator(null)
    setPendingOp(null)
    setOverwrite(true)
  }, [pendingOp, accumulator, display, formatResult])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { key } = e
      if (key >= "0" && key <= "9") inputDigit(key)
      else if (key === ".") inputDecimal()
      else if (key === "+" || key === "-" || key === "*" || key === "/" || key === "%")
        chooseOperator(key as Op)
      else if (key === "^") chooseOperator("^")
      else if (key === "Enter" || key === "=") {
        e.preventDefault()
        equals()
      } else if (key === "Backspace") backspace()
      else if (key === "Escape" || key === "c" || key === "C") clearAll()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [inputDigit, inputDecimal, chooseOperator, equals, backspace, clearAll])

  const expression =
    accumulator !== null && pendingOp !== null
      ? `${formatResult(accumulator)} ${OP_LABEL[pendingOp]}`
      : ""

  return (
    <div className="w-full max-w-xs rounded-3xl border border-border bg-card p-5 shadow-lg">
      {/* Display */}
      <div className="mb-5 flex flex-col items-end gap-1 rounded-2xl bg-muted px-4 py-6">
        <div className="h-5 text-sm font-mono text-muted-foreground">{expression}</div>
        <div
          className="w-full truncate text-right font-mono text-4xl font-semibold tabular-nums text-foreground"
          aria-live="polite"
        >
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3">
        <Key label="C" onClick={clearAll} variant="action" ariaLabel="Clear" />
        <Key label="⌫" onClick={backspace} variant="action" ariaLabel="Delete" />
        <Key label="%" onClick={() => chooseOperator("%")} variant="op" ariaLabel="Modulo" />
        <Key label="÷" onClick={() => chooseOperator("/")} variant="op" ariaLabel="Divide" />

        <Key label="7" onClick={() => inputDigit("7")} />
        <Key label="8" onClick={() => inputDigit("8")} />
        <Key label="9" onClick={() => inputDigit("9")} />
        <Key label="×" onClick={() => chooseOperator("*")} variant="op" ariaLabel="Multiply" />

        <Key label="4" onClick={() => inputDigit("4")} />
        <Key label="5" onClick={() => inputDigit("5")} />
        <Key label="6" onClick={() => inputDigit("6")} />
        <Key label="−" onClick={() => chooseOperator("-")} variant="op" ariaLabel="Subtract" />

        <Key label="1" onClick={() => inputDigit("1")} />
        <Key label="2" onClick={() => inputDigit("2")} />
        <Key label="3" onClick={() => inputDigit("3")} />
        <Key label="+" onClick={() => chooseOperator("+")} variant="op" ariaLabel="Add" />

        <Key label="±" onClick={toggleSign} variant="action" ariaLabel="Toggle sign" />
        <Key label="^" onClick={() => chooseOperator("^")} variant="op" ariaLabel="Power" />
        <Key label="0" onClick={() => inputDigit("0")} />
        <Key label="." onClick={inputDecimal} ariaLabel="Decimal point" />

        <Key label="=" onClick={equals} variant="equals" ariaLabel="Equals" className="col-span-4" />
      </div>
    </div>
  )
}

function Key({
  label,
  onClick,
  variant = "digit",
  ariaLabel,
  className,
}: {
  label: string
  onClick: () => void
  variant?: "digit" | "op" | "action" | "equals"
  ariaLabel?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={cn(
        "flex h-14 items-center justify-center rounded-2xl text-xl font-medium transition-colors select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95",
        variant === "digit" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "op" && "bg-accent text-accent-foreground hover:bg-accent/70",
        variant === "action" && "bg-muted text-muted-foreground hover:bg-muted/70",
        variant === "equals" && "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
    >
      {label}
    </button>
  )
}
