export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex justify-end">
        <button className="px-6 py-2 rounded-full border border-white text-white hover:bg-white hover:text-black transition-colors">
          Connect Wallet
        </button>
      </header>
      <main className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold">Live Trading App</h1>
      </main>
    </div>
  );
}
