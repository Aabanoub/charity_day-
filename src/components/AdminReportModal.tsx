'use client';

import React, { useState } from 'react';
import { AdminItemSummary } from '@/lib/types';
import { downloadPdfReport } from '@/lib/pdfGenerator';
import {
  Printer,
  Download,
  X,
  Phone,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AdminReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AdminItemSummary[];
}

export default function AdminReportModal({
  isOpen,
  onClose,
  items,
}: AdminReportModalProps) {
  const [viewMode, setViewMode] = useState<'both' | 'detailed' | 'summary'>('both');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  // Prepare items and their submissions (already sorted low-to-high)
  const displayItems = items.map((item) => {
    const lowest = item.allSubmissions.length > 0 ? item.allSubmissions[0] : null;
    return {
      ...item,
      filteredSubs: item.allSubmissions,
      lowest,
    };
  });

  // Compute Metrics
  const totalItems = items.length;
  const totalSubmissions = displayItems.reduce((acc, i) => acc + i.filteredSubs.length, 0);
  const itemsWithPrices = displayItems.filter((i) => i.lowest !== null).length;
  const lowestTotalSum = displayItems.reduce((acc, i) => acc + (i.lowest ? i.lowest.price : 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      downloadPdfReport(items, { viewMode });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn print-modal-container">
      <div className="relative w-full max-w-4xl bg-[#0b1d33] border border-[#123A66] rounded-[16px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print-sheet my-auto">
        {/* On-Screen Controls Header (Hidden during print / export) */}
        <div className="no-print p-3 sm:p-4 bg-[#071526] border-b border-[#123A66] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-[#B22026] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white truncate">Market Price Research Sheet (PDF)</h3>
              <p className="text-[11px] text-[#A9C8EE] hidden sm:block">
                Contains all submitted prices, contributor contact info & store details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-[#123A66]/40 p-0.5 border border-[#123A66] text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  viewMode === 'both' ? 'bg-[#123A66] text-white font-medium' : 'text-[#A9C8EE]'
                }`}
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => setViewMode('detailed')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  viewMode === 'detailed' ? 'bg-[#123A66] text-white font-medium' : 'text-[#A9C8EE]'
                }`}
              >
                Ledger
              </button>
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  viewMode === 'summary' ? 'bg-[#123A66] text-white font-medium' : 'text-[#A9C8EE]'
                }`}
              >
                Lowest
              </button>
            </div>

            {/* Direct Native PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow transition-all duration-200 tap-active disabled:opacity-50 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            {/* Browser Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-[#123A66] hover:bg-[#18497d] text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow transition-all duration-200 tap-active shrink-0"
              title="Print document or save using browser dialog"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body - Strictly isolated with id="printable-report-content" */}
        <div
          id="printable-report-content"
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-gray-900 bg-white print:p-0"
        >
          {/* Printable Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-gray-900 print-break-inside-avoid">
            <div className="flex items-center gap-3">
              {/* High-res transparent logo for print & display */}
              <div className="w-14 h-14 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-transparent.png"
                  alt="Make Their Day Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                  MAKE THEIR <span className="text-[#B22026]">DAY</span>
                </h1>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
                  Charity Market Price Research & Inquiry Sheet
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-gray-600">
              <div className="font-semibold text-gray-900">CONFIDENTIAL PURCHASING REFERENCE</div>
              <div className="flex items-center sm:justify-end gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentDateStr}</span>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print-break-inside-avoid">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Catalogue Items</span>
              <span className="text-xl font-bold text-gray-900 block mt-0.5">{totalItems}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Prices Gathered</span>
              <span className="text-xl font-bold text-[#123A66] block mt-0.5">{totalSubmissions}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Items Priced</span>
              <span className="text-xl font-bold text-[#B22026] block mt-0.5">
                {itemsWithPrices} / {totalItems}
              </span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Lowest Total Budget</span>
              <span className="text-xl font-bold text-green-700 block mt-0.5">
                ${lowestTotalSum.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Empty Catalogue State */}
          {items.length === 0 && (
            <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-gray-800">No items currently in the catalogue</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Once items are added to the catalogue in the Admin Dashboard, price submissions and lowest-price research will appear here.
              </p>
            </div>
          )}

          {/* ============================================================= */}
          {/* SECTION 1: EXECUTIVE SUMMARY OF LOWEST PRICES PER ITEM */}
          {/* ============================================================= */}
          {items.length > 0 && (viewMode === 'both' || viewMode === 'summary') && (
            <div className="space-y-2 print-break-inside-avoid">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B22026]" />
                  <span>Lowest Found Prices Summary</span>
                </h2>
                <span className="text-xs text-gray-500 italic">Quick Reference by Catalogue Order</span>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3 text-right">Lowest Price</th>
                      <th className="py-2.5 px-3">Found By</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Phone Number</th>
                      <th className="py-2.5 px-3">Store Info & Notes</th>
                      <th className="py-2.5 px-3 text-center">Total Quotes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="py-2.5 px-3 font-medium text-gray-900">
                          {idx + 1}. {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#B22026] whitespace-nowrap">
                          {item.lowest ? `$${item.lowest.price.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-900 whitespace-nowrap">
                          {item.lowest ? item.lowest.userName : <span className="text-gray-400 italic">No prices</span>}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">
                          {item.lowest ? item.lowest.userClass : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-900 whitespace-nowrap">
                          {item.lowest ? item.lowest.userPhone : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 max-w-xs">
                          {item.lowest?.comment ? (
                            <span className="text-gray-800">{item.lowest.comment}</span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-600 font-medium">
                          {item.filteredSubs.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SECTION 2: ALL PRICES LEDGER (ITEM BY ITEM WITH LOWEST HIGHLIGHTED) */}
          {/* ============================================================= */}
          {items.length > 0 && (viewMode === 'both' || viewMode === 'detailed') && (
            <div className="space-y-4 pt-3">
              <div className="flex items-center justify-between pb-1 border-b border-gray-300">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#123A66]" />
                  <span>Complete Price Quotes Ledger (All Prices Added per Item)</span>
                </h2>
                <span className="text-xs text-gray-500 italic">Lowest price highlighted on top</span>
              </div>

              <div className="space-y-4">
                {displayItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-gray-300 rounded-lg overflow-hidden print-break-inside-avoid shadow-sm"
                  >
                    {/* Item Heading Header */}
                    <div className="bg-gray-100 px-3.5 py-2.5 border-b border-gray-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          #{idx + 1}. {item.name}
                        </span>
                        <span className="text-[11px] font-medium text-[#123A66] bg-white px-2 py-0.5 rounded border border-gray-200">
                          {item.filteredSubs.length} price quote{item.filteredSubs.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {item.lowest ? (
                        <div className="text-xs bg-[#B22026]/10 text-[#B22026] border border-[#B22026]/30 px-2.5 py-1 rounded-md font-medium">
                          Lowest Found: <strong>${item.lowest.price.toFixed(2)}</strong> by{' '}
                          <span className="text-gray-900 font-semibold">{item.lowest.userName}</span>{' '}
                          <span className="text-gray-600 font-mono">({item.lowest.userPhone})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No price quotes yet</span>
                      )}
                    </div>

                    {/* All Submissions Table for this Item */}
                    {item.filteredSubs.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 italic bg-white">
                        No prices recorded for this item yet.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left border-collapse bg-white">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-600 font-semibold text-[10px] uppercase bg-gray-50/70">
                            <th className="py-2 px-3 w-28">Status / Rank</th>
                            <th className="py-2 px-3 text-right">Price Found</th>
                            <th className="py-2 px-3">Added By</th>
                            <th className="py-2 px-3">Class</th>
                            <th className="py-2 px-3">Phone Number</th>
                            <th className="py-2 px-3">Store Info & Notes</th>
                            <th className="py-2 px-3 text-right">Submitted At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {item.filteredSubs.map((sub, sIdx) => {
                            const isLowest = sIdx === 0;
                            return (
                              <tr
                                key={sub.id}
                                className={
                                  isLowest
                                    ? 'bg-emerald-50/80 font-medium border-l-4 border-l-emerald-600 print:bg-emerald-50'
                                    : 'hover:bg-gray-50'
                                }
                              >
                                {/* Status / Rank with highlight on the lowest */}
                                <td className="py-2 px-3 whitespace-nowrap">
                                  {isLowest ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] tracking-wide shadow-xs">
                                      ★ LOWEST PRICE
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                                      Quote #{sIdx + 1}
                                    </span>
                                  )}
                                </td>

                                {/* Price ($) */}
                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                  <span
                                    className={
                                      isLowest
                                        ? 'text-sm font-bold text-emerald-800'
                                        : 'text-xs font-semibold text-gray-800'
                                    }
                                  >
                                    ${sub.price.toFixed(2)}
                                  </span>
                                </td>

                                {/* Added By (User Name) */}
                                <td className="py-2 px-3 text-gray-900 whitespace-nowrap font-medium">
                                  {sub.userName}
                                </td>

                                {/* Class */}
                                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                                  {sub.userClass}
                                </td>

                                {/* Phone Number */}
                                <td className="py-2 px-3 font-mono text-gray-900 whitespace-nowrap">
                                  <a href={`tel:${sub.userPhone}`} className="hover:underline text-gray-900">
                                    {sub.userPhone}
                                  </a>
                                </td>

                                {/* Store Info & Notes */}
                                <td className="py-2 px-3 text-gray-700">
                                  {sub.comment ? (
                                    <span className="font-normal text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 block">
                                      {sub.comment}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic text-[11px]">— No info provided —</span>
                                  )}
                                </td>

                                {/* Submitted Time */}
                                <td className="py-2 px-3 text-right text-gray-500 text-[10px] whitespace-nowrap font-mono">
                                  {new Date(sub.submittedAt).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })}{' '}
                                  {new Date(sub.submittedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Printable Footer */}
          <div className="pt-6 border-t border-gray-300 flex items-center justify-between text-[11px] text-gray-500 print-break-inside-avoid">
            <span>Make Their Day &copy; {new Date().getFullYear()} • Charity Market Price Research</span>
            <span>Confidential Organizer Purchasing Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
