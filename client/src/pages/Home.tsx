import { Globe, BookOpen } from "lucide-react";
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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <span className="-ml-0.5 mr-1.5 h-2 w-2 rounded-full bg-blue-400" />
              Demo Mode
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Application</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>This is a static demo of the DNS Manager. In this mode, all operations are simulated and no actual DNS records are created.</p>
              </div>
            </div>
          </div>
        </div>
        
        <SubdomainCreator />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-slate-500">
            Static Demo Version • <span className="font-medium text-primary-600">beenshub.rest</span> DNS Manager
          </p>
        </div>
      </footer>
    </div>
  );
}
