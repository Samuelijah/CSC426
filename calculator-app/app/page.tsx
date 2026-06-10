import { Calculator } from "@/components/calculator"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-12">
      <header className="text-center">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">Samuel's Calculator</h1>
      </header>
      <Calculator />
    </main>
  )
}
