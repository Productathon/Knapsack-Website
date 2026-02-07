'use client';

import { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Copy, Loader2, Plus, Trash2, DollarSign } from 'lucide-react';

export default function SendContractModal({ isOpen, onClose, account, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [contractData, setContractData] = useState({
    title: '',
    content: ''
  });
  
  // Line Items State
  const [items, setItems] = useState([
    { description: 'Consulting Services', quantity: 1, price: 5000 },
  ]);

  const [publicLink, setPublicLink] = useState('');

  // Auto-calculate total
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5001/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: account._id,
          title: contractData.title,
          value: totalValue,
          content: contractData.content || `Service agreement for ${account.name}`,
          items: items // Send line items
        })
      });

      const data = await res.json();
      if (data.success) {
        setPublicLink(`${window.location.origin}${data.publicLink}`);
        setStep('success');
        if (onSuccess) onSuccess(); // Refresh activities
      } else {
        alert('Failed to create contract: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error sending contract');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 fade-in duration-200 max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {step === 'form' ? 'Draft New Contract' : 'Contract Sent!'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Contract Headers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Contract Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enterprise License Agreement Q3"
                    className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                    value={contractData.title}
                    onChange={(e) => setContractData({...contractData, title: e.target.value})}
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">Service Line Items</label>
                  <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                
                <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-left">
                        <th className="px-3 py-2 font-medium text-muted-foreground w-[40%]">Description</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground w-[15%]">Qty</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground w-[20%]">Price</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground w-[15%] text-right">Total</th>
                        <th className="px-3 py-2 w-[10%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item, index) => (
                        <tr key={index} className="group hover:bg-muted/20">
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="Item description"
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              required
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-foreground"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">$</span>
                              <input
                                type="number"
                                min="0"
                                required
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-foreground"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                              />
                            </div>
                          </td>
                          <td className="p-2 text-right font-medium text-foreground">
                            ${(item.quantity * item.price).toLocaleString()}
                          </td>
                          <td className="p-2 text-center">
                            {items.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50 border-t border-border">
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right font-semibold text-muted-foreground">Total Value</td>
                        <td className="px-3 py-2 text-right font-bold text-lg text-primary">
                          ${totalValue.toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Additional Terms / Notes</label>
                <textarea
                  className="w-full p-3 rounded-lg border border-border bg-background h-24 resize-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Payment terms, delivery schedule, or special conditions..."
                  value={contractData.content}
                  onChange={(e) => setContractData({...contractData, content: e.target.value})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                  {loading ? 'Processing...' : `Generate Contract ($${totalValue.toLocaleString()})`}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50 dark:ring-green-900/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground">Contract Generated Successfully!</h4>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                  The digital contract has been created and logged. Share the secure link below with the client for signature.
                </p>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border max-w-md mx-auto">
                <code className="text-xs flex-1 truncate font-mono text-foreground">{publicLink}</code>
                <button onClick={copyToClipboard} className="p-2 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border text-muted-foreground hover:text-foreground" title="Copy Link">
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-center gap-3">
                 <button
                  onClick={onClose}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  Return to Dashboard
                </button>
                <a
                  href={publicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Contract
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Fix missing imports
import { ExternalLink } from 'lucide-react';
