import { Globe } from "lucide-react";
import SubdomainCreator from "@/components/SubdomainCreator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-semibold text-slate-800">beenshub DNS Manager</h1>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="-ml-0.5 mr-1.5 h-2 w-2 rounded-full bg-green-400" />
              API Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <SubdomainCreator />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-slate-500">
            Powered by <span className="font-medium text-primary-600">beenshub.lol</span> with Porkbun DNS API
          </p>
        </div>
      </footer>
    </div>
  );
}
