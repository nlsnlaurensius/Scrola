'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Supabase Connection', status: 'pending', message: 'Testing...' },
    { name: 'Environment Variables', status: 'pending', message: 'Checking...' },
    { name: 'Database Access', status: 'pending', message: 'Testing...' },
  ]);

  useEffect(() => {
    async function runTests() {
      const supabase = createClient();
      const newResults: TestResult[] = [];

      // Test 1: Environment Variables
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        newResults.push({
          name: 'Environment Variables',
          status: 'success',
          message: 'Environment variables are configured',
        });
      } else {
        newResults.push({
          name: 'Environment Variables',
          status: 'error',
          message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
        });
      }

      // Test 2: Supabase Connection
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        newResults.push({
          name: 'Supabase Connection',
          status: 'success',
          message: 'Successfully connected to Supabase',
        });
      } catch (err) {
        newResults.push({
          name: 'Supabase Connection',
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to connect',
        });
      }

      // Test 3: Database Access
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        newResults.push({
          name: 'Database Access',
          status: 'success',
          message: `Database accessible. Tables exist.`,
        });
      } catch (err) {
        newResults.push({
          name: 'Database Access',
          status: 'error',
          message: err instanceof Error ? err.message : 'Cannot access database. Did you run schema.sql?',
        });
      }

      setResults(newResults);
    }

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Scrola - System Test</h1>
        <p className="text-gray-600 mb-8">Testing backend setup and database connection</p>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{result.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700">{result.message}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4">📋 Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              If database test fails, go to{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Supabase Dashboard
              </a>{' '}
              and execute <code className="bg-blue-100 px-2 py-1 rounded">schema.sql</code>
            </li>
            <li>Create storage buckets: avatars, covers, pages</li>
            <li>Check <code className="bg-blue-100 px-2 py-1 rounded">TESTING_GUIDE.md</code> for detailed instructions</li>
            <li>Start implementing UI components and pages</li>
          </ol>
        </div>

        <div className="mt-8 p-6 bg-gray-100 border-2 border-gray-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4">📊 Project Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Backend Services</p>
              <p className="text-2xl font-bold text-green-600">100%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frontend UI</p>
              <p className="text-2xl font-bold text-red-600">0%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Database Schema</p>
              <p className="text-2xl font-bold text-yellow-600">Ready</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Authentication</p>
              <p className="text-2xl font-bold text-green-600">Ready</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            See <code className="bg-gray-100 px-2 py-1 rounded">PROJECT_STATUS.md</code> and{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">TESTING_GUIDE.md</code> for detailed information
          </p>
        </div>
      </div>
    </div>
  );
}
