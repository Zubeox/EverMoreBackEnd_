import React, { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { Mail, Lock, Send, CircleCheck as CheckCircle, Circle as XCircle, Loader as Loader2, Code, Globe, TriangleAlert as AlertTriangle } from 'lucide-react';

export const SupabaseFunctionCaller: React.FC = () => {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callMethod, setCallMethod] = useState<'invoke' | 'fetch'>('invoke');

  const callEdgeFunctionWithInvoke = async () => {
    try {
      // Using supabaseClient.functions.invoke for authenticated calls
      // This method automatically handles adding the Authorization header if a session exists.
      const { data, error: invokeError } = await supabaseClient.functions.invoke('client-gallery-auth', {
        body: { email, code: accessCode },
        // The invoke method handles content-type and authorization headers automatically.
      });

      if (invokeError) {
        console.error('Supabase Function Invoke Error:', invokeError);
        setError(`Invoke Error: ${invokeError.message || 'Failed to invoke function'}`);
        return;
      }

      setResponse(data);
    } catch (err: any) {
      console.error('Unexpected error calling Edge Function with invoke:', err);
      setError(`Unexpected Error: ${err.message || 'An unexpected error occurred.'}`);
    }
  };

  const callEdgeFunctionWithFetch = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setError('Missing Supabase environment variables');
        return;
      }

      const functionUrl = `${supabaseUrl}/functions/v1/client-galleries`;
      
      // Using direct fetch call with manual headers
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ email, code: accessCode }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch Error Response:', errorText);
        setError(`HTTP ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      setResponse(data);
    } catch (err: any) {
      console.error('Unexpected error calling Edge Function with fetch:', err);
      setError(`Fetch Error: ${err.message || 'Network error occurred.'}`);
    }
  };

  const callEdgeFunction = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      if (callMethod === 'invoke') {
        await callEdgeFunctionWithInvoke();
      } else {
        await callEdgeFunctionWithFetch();
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResponse(null);
    setError(null);
  };

  return (
    <div className="boho-card rounded-boho p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-boho-brown boho-heading flex items-center space-x-2">
            <Code className="w-6 h-6" />
            <span>Test Supabase Edge Function</span>
          </h2>
          <p className="text-boho-rust font-boho mt-1">
            Test the `client-gallery-auth` Edge Function to debug CORS and authentication issues.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-boho-sage" />
          <span className="text-sm text-boho-rust font-boho">localhost:5173 → Supabase</span>
        </div>
      </div>

      {/* Method Selection */}
      <div className="bg-boho-warm bg-opacity-10 rounded-boho p-4 border border-boho-brown border-opacity-20">
        <label className="block text-sm font-medium text-boho-brown mb-3 font-boho">
          Call Method
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="invoke"
              checked={callMethod === 'invoke'}
              onChange={(e) => setCallMethod(e.target.value as 'invoke' | 'fetch')}
              className="w-4 h-4 text-boho-sage border-boho-brown focus:ring-boho-sage"
            />
            <span className="text-sm text-boho-brown font-boho">supabase.functions.invoke()</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="fetch"
              checked={callMethod === 'fetch'}
              onChange={(e) => setCallMethod(e.target.value as 'invoke' | 'fetch')}
              className="w-4 h-4 text-boho-sage border-boho-brown focus:ring-boho-sage"
            />
            <span className="text-sm text-boho-brown font-boho">Direct fetch()</span>
          </label>
        </div>
        <p className="text-xs text-boho-rust mt-2 font-boho">
          {callMethod === 'invoke' 
            ? 'Uses Supabase client with automatic header management' 
            : 'Direct HTTP request with manual headers - better for debugging CORS'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust font-boho"
              placeholder="client@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
            Access Code
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust font-boho uppercase tracking-wider"
              placeholder="ACCESSCODE"
              maxLength={10}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={callEdgeFunction}
            disabled={loading || !email || !accessCode}
            className="flex-1 boho-button py-3 rounded-boho text-boho-cream font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl font-boho text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Calling Function...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Call Edge Function</span>
              </>
            )}
          </button>
          
          {(response || error) && (
            <button
              onClick={clearResults}
              className="px-4 py-3 bg-boho-warm bg-opacity-30 text-boho-brown rounded-boho hover:bg-opacity-50 transition-all font-boho"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Debugging Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-boho p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 font-boho mb-2">Debugging Tips:</p>
            <ul className="text-xs text-blue-700 space-y-1 font-boho">
              <li>• Open Browser DevTools (F12) → Network tab before calling</li>
              <li>• Look for OPTIONS preflight request (should return 200 OK)</li>
              <li>• Check CORS headers in response: Access-Control-Allow-Origin</li>
              <li>• Verify function URL in network request matches your Supabase project</li>
              <li>• Check Console tab for detailed CORS error messages</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Response */}
      {response && (
        <div className="bg-green-50 border border-green-200 rounded-boho p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 font-boho mb-2">✅ Function Response:</p>
              <div className="bg-green-100 rounded-boho p-3 overflow-auto">
                <pre className="text-xs text-green-700 whitespace-pre-wrap break-all font-mono">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Response */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-boho p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 font-boho mb-2">❌ Error Details:</p>
              <div className="bg-red-100 rounded-boho p-3 overflow-auto">
                <pre className="text-xs text-red-700 whitespace-pre-wrap break-all font-mono">
                  {error}
                </pre>
              </div>
              <div className="mt-3 text-xs text-red-600 font-boho">
                <p className="font-medium mb-1">Common Solutions:</p>
                <ul className="space-y-1 ml-4">
                  <li>• CORS Error: Check Edge Function CORS headers and OPTIONS handling</li>
                  <li>• 401/403: Verify Supabase API keys and function permissions</li>
                  <li>• 404: Ensure Edge Function is deployed and URL is correct</li>
                  <li>• Network Error: Check internet connection and Supabase status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Function URL Info */}
      <div className="bg-boho-sage bg-opacity-10 rounded-boho p-4 border border-boho-sage border-opacity-30">
        <p className="text-sm font-medium text-boho-brown font-boho mb-2">Function URL:</p>
        <code className="text-xs text-boho-brown bg-boho-cream bg-opacity-50 px-2 py-1 rounded border font-mono break-all">
          {import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-galleries
        </code>
      </div>
    </div>
  );
};