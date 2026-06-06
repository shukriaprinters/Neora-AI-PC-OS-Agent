import React, { useState } from 'react';
import { Invoice, InvoiceItem } from '../types';
import { TRANSLATIONS } from '../translations';
import { Printer, Plus, Trash2, ShieldCheck, DollarSign, FileText } from 'lucide-react';

interface EarningViewProps {
  lang: 'en' | 'bn';
}

export function EarningView({ lang }: EarningViewProps) {
  const t = TRANSLATIONS[lang];

  // Invoice dynamic states
  const [invoice, setInvoice] = useState<Invoice>({
    id: 'inv-1',
    invoiceNumber: 'INV-2026-003',
    senderName: lang === 'bn' ? 'শুকরিয়া প্রিন্টার্স অ্যান্ড পাবলিশার্স' : 'Shukria Printers & Publishers',
    senderEmail: 'shukriaprinters@gmail.com',
    senderPhone: '+880-1712-XXXXXX',
    receiverName: 'Neora AI Developers Ltd',
    receiverEmail: 'accounts@neora.ai',
    receiverAddress: 'Level 14, Silicon Tower, Gulshan-2, Dhaka',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
    items: [
      { description: 'Banner Printing (Shukria printers high-gloss finish)', quantity: 15, rate: 120, amount: 1800 },
      { description: 'Neora AI System Layout Design & Branding', quantity: 1, rate: 850, amount: 850 }
    ],
    taxRate: 7.5,
    notes: lang === 'bn' ? 'শুকরিয়া প্রিন্টার্সে অর্ডার করার জন্য আপনাকে ধন্যবাদ।' : 'Thank you for your business. Invoices are payable within 15 days via bank transfer or mobile banking portal.'
  });

  // Items line modification
  const handleAddItem = () => {
    const defaultItem: InvoiceItem = { description: 'New Print / Dev Service Item', quantity: 1, rate: 100, amount: 100 };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, defaultItem]
    }));
  };

  const handleUpdateItem = (index: number, fields: Partial<InvoiceItem>) => {
    const updatedItems = [...invoice.items];
    const targetItem = { ...updatedItems[index], ...fields };
    targetItem.amount = (targetItem.quantity || 0) * (targetItem.rate || 0);
    updatedItems[index] = targetItem;
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleUpdateMeta = (fields: Partial<Invoice>) => {
    setInvoice(prev => ({ ...prev, ...fields }));
  };

  // Tax and Total Math calculations
  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * (invoice.taxRate || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div id="earning-studio-container" className="flex-1 flex flex-col lg:flex-row h-full bg-slate-950 text-slate-100 overflow-hidden print:bg-white print:text-black">
      
      {/* LEFT PANEL: INVOICE META EDITORS */}
      <div id="invoice-editor-sidebar" className="w-full lg:w-5/12 p-5 border-r border-slate-900 overflow-y-auto space-y-5 shrink-0 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1 bg-slate-900/40 p-2 border border-slate-850 rounded">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            {t.invoiceBuilder}
          </h2>
          <p className="text-[10px] text-slate-400">Generate fully customized, print-ready PDF invoices. Add custom items, VAT details, and export instantly.</p>
        </div>

        {/* Sender Credentials */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block border-b border-slate-800 pb-1">
            🏢 {t.senderDetails}
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            <input
              id="inv-sender-name"
              type="text"
              placeholder="Publisher Name"
              value={invoice.senderName}
              onChange={(e) => handleUpdateMeta({ senderName: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                id="inv-sender-email"
                type="email"
                placeholder="Sender Email Address"
                value={invoice.senderEmail}
                onChange={(e) => handleUpdateMeta({ senderEmail: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
              />
              <input
                id="inv-sender-phone"
                type="text"
                placeholder="Sender Phone Number"
                value={invoice.senderPhone}
                onChange={(e) => handleUpdateMeta({ senderPhone: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Client details */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block border-b border-slate-800 pb-1">
            👥 {t.receiverDetails}
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            <input
              id="inv-receiver-name"
              type="text"
              placeholder="Client / Corporate Organization"
              value={invoice.receiverName}
              onChange={(e) => handleUpdateMeta({ receiverName: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
            />
            <input
              id="inv-receiver-email"
              type="email"
              placeholder="Client Contact Email"
              value={invoice.receiverEmail}
              onChange={(e) => handleUpdateMeta({ receiverEmail: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
            />
            <input
              id="inv-receiver-addr"
              type="text"
              placeholder="Client Billing Address"
              value={invoice.receiverAddress}
              onChange={(e) => handleUpdateMeta({ receiverAddress: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Invoicing configuration */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block border-b border-slate-800 pb-1">
            ⚙ INVOICING METADATA
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-400">Invoice Number</label>
              <input
                id="inv-num"
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => handleUpdateMeta({ invoiceNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-400">Tax / VAT Rate (%)</label>
              <input
                id="inv-tax-rate"
                type="number"
                step="0.1"
                value={invoice.taxRate}
                onChange={(e) => handleUpdateMeta({ taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-400">Issue Date</label>
              <input
                type="date"
                value={invoice.date}
                onChange={(e) => handleUpdateMeta({ date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-400">DUE Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => handleUpdateMeta({ dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: LIVE ENTERPRISE RENDERED PDF INVOICE SHEET */}
      <div id="invoice-preview-area" className="flex-1 p-6 overflow-y-auto bg-slate-900 border-l border-slate-900 flex flex-col items-center print:border-none print:bg-white print:p-0 print:overflow-hidden">
        
        {/* Export toolbar controller */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-4 bg-slate-950 p-2.5 rounded border border-slate-850 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{t.previewInvoice}</span>
          </div>
          <button
            onClick={handleTriggerPrint}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded text-xs cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printInvoice}</span>
          </button>
        </div>

        {/* Corporate print sheet design layout */}
        <div id="print-sheet-paper" className="w-full max-w-2xl bg-white text-zinc-900 rounded-lg p-8 shadow-2xl flex flex-col justify-between font-sans text-xs min-h-[820px] print:shadow-none print:rounded-none print:p-4">
          
          <div className="space-y-6">
            {/* Header section banner */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5">
              <div>
                <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900 uppercase">
                  {invoice.senderName}
                </h1>
                <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">
                  📧 {invoice.senderEmail} | 📞 {invoice.senderPhone}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">TAX TAX INVOICE</span>
                <span className="text-sm font-mono font-bold text-slate-800 select-all block mt-1">{invoice.invoiceNumber}</span>
              </div>
            </div>

            {/* Billing addresses split */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-5 font-mono text-[10px] leading-relaxed">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase tracking-wider font-bold">DATE OF ISSUE:</span>
                <p className="text-slate-800 font-bold">{invoice.date}</p>
                <span className="text-slate-400 uppercase tracking-wider font-bold block mt-3">PAYMENT DUE DATE:</span>
                <p className="text-rose-600 font-bold">{invoice.dueDate}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-slate-400 uppercase tracking-wider font-bold">CLIENT INFORMATION:</span>
                <p className="text-slate-950 font-bold">{invoice.receiverName}</p>
                <p className="text-slate-500">{invoice.receiverEmail}</p>
                <p className="text-slate-500 truncate">{invoice.receiverAddress}</p>
              </div>
            </div>

            {/* Editable worksheet line components */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100 pb-1 block">
                💼 {t.invoiceItems}
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] font-mono text-slate-500 uppercase">
                    <th className="py-2 font-bold">Description</th>
                    <th className="py-2 text-center font-bold w-16">Qty</th>
                    <th className="py-2 text-right font-bold w-24">Unit Rate</th>
                    <th className="py-2 text-right font-bold w-28">Amount</th>
                    <th className="py-2 w-10 print:hidden text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((it, idx) => (
                    <tr key={idx} className="group hover:bg-neutral-50 print:hover:bg-transparent">
                      <td className="py-2.5">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleUpdateItem(idx, { description: e.target.value })}
                          className="w-full bg-transparent border-none py-1 focus:outline-none text-zinc-800 placeholder-zinc-400 text-xs font-sans print:p-0 font-medium"
                          placeholder="Line item description detail"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => handleUpdateItem(idx, { quantity: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-transparent border-none py-1 text-center font-mono focus:outline-none text-zinc-800 print:text-center text-xs"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono text-zinc-700">
                        <span className="text-zinc-400">$</span>
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => handleUpdateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
                          className="w-20 bg-transparent border-none py-1 text-right font-mono focus:outline-none text-zinc-800 text-xs inline-block"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-zinc-900">
                        ${(it.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 print:hidden text-center">
                        <button
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1 text-neutral-450 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add item row trigger button */}
              <button
                onClick={handleAddItem}
                className="print:hidden w-full py-1.5 border border-dashed border-zinc-200 hover:border-zinc-400 rounded transition-colors text-[10px] font-mono text-zinc-500 hover:text-zinc-800 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>ADD WORK BILLING LINE ITEM</span>
              </button>
            </div>
          </div>

          {/* Sum total parameters block panel */}
          <div className="mt-8 border-t border-zinc-200 pt-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="max-w-xs space-y-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">TERM AND CLIENT NOTES:</span>
                <textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => handleUpdateMeta({ notes: e.target.value })}
                  className="w-full bg-transparent border-none text-[10px] font-sans focus:outline-none text-zinc-500 leading-relaxed resize-none font-medium text-left print:p-0"
                />
              </div>
              
              {/* Financial columns */}
              <div className="w-64 font-mono space-y-2 text-[10px] text-right">
                <div className="flex justify-between">
                  <span className="text-zinc-550">Subtotal:</span>
                  <span className="text-zinc-800 font-bold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>VAT / Tax ({invoice.taxRate}%):</span>
                  <span>+${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-250 pt-2 text-xs font-bold text-zinc-900 uppercase">
                  <span>Total Gross Due:</span>
                  <span className="text-sm text-emerald-600 font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Standard signatures and footer seals */}
            <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono pt-5 border-t border-zinc-100 bg-neutral-50/50 p-2 rounded leading-relaxed">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>SYSTEM VERIFIED & TAX COMPLIANT</span>
              </div>
              <span>ISSUED VIA NEORA CLIENT BILLING PROV v2.0</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
