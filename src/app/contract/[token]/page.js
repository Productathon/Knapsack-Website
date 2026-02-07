'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileText, CheckCircle2, Loader2, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PublicContractPage() {
  const params = useParams();
  const token = params.token;
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signing, setSigning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5001/api/contracts/${token}`);
        const data = await res.json();
        
        if (data.success) {
          setContract(data.data);
          if (data.data.status === 'Signed') {
            setSuccess(true);
          }
        } else {
          setError(data.error || 'Failed to load contract');
        }
      } catch (err) {
        setError('Connection error. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchContract();
  }, [token]);

  // Signature Pad Logic
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  
  const startDrawing = (e) => {
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = document.getElementById('signature-pad');
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSign = async () => {
    if (!signatureData) {
      alert('Please sign the contract before accepting.');
      return;
    }

    setSigning(true);
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/contracts/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureData })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setContract(data.data);
      } else {
        alert('Failed to sign: ' + data.error);
      }
    } catch (err) {
      alert('Error signing contract');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Unavailable</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Contract Signed!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your business. A copy of the signed agreement has been sent to your email.
          </p>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-left space-y-3">
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Agreement</p>
                <p className="font-medium text-slate-900">{contract.title}</p>
                <p className="text-sm text-slate-500 mt-1">Signed on {new Date(contract.signedAt).toLocaleDateString()}</p>
            </div>
            {contract.signature && (
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Signature</p>
                    <img src={contract.signature} alt="Signature" className="h-12 border border-slate-200 rounded bg-white" />
                </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl border-b border-slate-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Agreement for Review</p>
              <h1 className="text-3xl font-bold text-slate-900">{contract.title}</h1>
              {contract.account && (
                <p className="text-slate-500 mt-2">Prepared for {contract.account.name}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                ${contract.value?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Content */}
        <div className="bg-white p-8 min-h-[400px] border-x border-slate-200">
          <div className="prose prose-slate max-w-none">
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap font-serif leading-relaxed">
              {contract.content || "No content provided."}
            </div>

            {contract.items && contract.items.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Service Schedule</h3>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {contract.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{item.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">${item.price.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">${(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Total Value</td>
                        <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">${contract.value?.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
            
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Terms & Conditions</h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>This agreement is binding upon signature.</li>
                <li>Payment terms are Net 30 from the date of invoice.</li>
                <li>Services will commence upon receipt of the signed contract.</li>
                <li>Confidentiality of all shared data is guaranteed.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-white border-t border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sign Document</h3>
            <p className="text-sm text-slate-500 mb-3">Please sign in the box below using your mouse or touch screen.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 relative">
                <canvas
                    id="signature-pad"
                    width={500}
                    height={200}
                    className="w-full h-[200px] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <button 
                  onClick={clearSignature}
                  className="absolute top-2 right-2 text-xs text-slate-400 hover:text-red-500 px-2 py-1 bg-white border border-slate-200 rounded"
                >
                  Clear
                </button>
            </div>
        </div>

        {/* Action Footer */}
        <div className="bg-white rounded-b-xl border-t border-slate-200 p-8 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              By clicking "Sign & Accept", you agree to the terms above and confirm the signature is yours.
            </div>
            <button
              onClick={handleSign}
              disabled={signing}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing ? <Loader2 className="h-5 w-5 animate-spin" /> : <PenTool className="h-5 w-5" />}
              {signing ? 'Signing...' : 'Sign & Accept'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
