import { Navbar, Welcome, Services, Transactions, Footer } from "@/components"
import { TransactionProvider } from "@/contexts/TransactionContext"

export default function Home() {
  return (
    <TransactionProvider>
      <main>
        <div className="min-h-screen">
          <div className="gradient-bg-welcome">
            <Navbar />
            <Welcome />
          </div>
          <Services />
          <Transactions />
          <Footer />
        </div>
      </main>
    </TransactionProvider>
  )
}
