'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import { AdminItemSummary } from '@/lib/types';
import { CLASS_OPTIONS } from '@/lib/constants';
import {
  Printer,
  X,
  Award,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
  Filter,
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
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'both' | 'summary' | 'detailed'>('both');

  if (!isOpen) return null;

  // Compute Metrics
  const totalItems = items.length;
  const totalSubmissions = items.reduce((acc, i) => acc + i.pricesCount, 0);
  const itemsWithBids = items.filter((i) => i.lowestPrice !== null).length;

  // Filter items
  const displayItems = items.map((item) => {
    let filteredSubs = item.allSubmissions;
    if (filterClass !== 'ALL') {
      filteredSubs = filteredSubs.filter((s) => s.userClass === filterClass);
    }
    const lowest = filteredSubs.length > 0 ? filteredSubs[0] : null;
    return {
      ...item,
      filteredSubs,
      lowest,
    };
  });

  const handlePrint = () => {
    window.print();
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
        {/* On-Screen Controls Header (Hidden during actual print/PDF export) */}
        <div className="no-print p-4 bg-[#071526] border-b border-[#123A66] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#B22026]" />
            <div>
              <h3 className="text-sm font-medium text-white">Executive PDF Price Sheet</h3>
              <p className="text-[11px] text-[#A9C8EE]">
                Ready for saving as PDF or printing directly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-[#123A66]/40 p-0.5 border border-[#123A66] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'both' ? 'bg-[#123A66] text-white font-medium' : 'text-[#A9C8EE]'
                }`}
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'summary' ? 'bg-[#123A66] text-white font-medium' : 'text-[#A9C8EE]'
                }`}
              >
                Winners Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode('detailed')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'detailed' ? 'bg-[#123A66] text-white font-medium' : 'text-[#A9C8EE]'
                }`}
              >
                All Bids Ledger
              </button>
            </div>

            {/* Class Filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-[#0d2745] border border-[#123A66] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#A9C8EE]"
            >
              <option value="ALL">All Classes</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow transition-all duration-200 tap-active"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-gray-900 bg-white print:p-0">
          {/* Printable Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-gray-900 print-break-inside-avoid">
            <div className="flex items-center gap-3">
              <Logo size="lg" showText={false} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                  MAKE THEIR <span className="text-[#B22026]">DAY</span>
                </h1>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
                  Charity Price Collection & Auction Report
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-gray-600">
              <div className="font-semibold text-gray-900">CONFIDENTIAL ORGANIZER SHEET</div>
              <div className="flex items-center sm:justify-end gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentDateStr}</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Filter: <strong>{filterClass === 'ALL' ? 'All Groups & Classes' : filterClass}</strong>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-3 gap-3 print-break-inside-avoid">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Catalogue Items</span>
              <span className="text-xl font-bold text-gray-900 block mt-0.5">{totalItems}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Prices Received</span>
              <span className="text-xl font-bold text-[#123A66] block mt-0.5">{totalSubmissions}</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Priced Items</span>
              <span className="text-xl font-bold text-[#B22026] block mt-0.5">
                {itemsWithBids} / {totalItems}
              </span>
            </div>
          </div>

          {/* ============================================================= */}
          {/* SECTION 1: WINNERS / LOWEST BIDS TABLE */}
          {/* ============================================================= */}
          {(viewMode === 'both' || viewMode === 'summary') && (
            <div className="space-y-2 print-break-inside-avoid">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#B22026]" />
                  <span>Lowest Price Winners Summary</span>
                </h2>
                <span className="text-xs text-gray-500 italic">Sorted by Catalogue Order</span>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3 text-right">Lowest Price</th>
                      <th className="py-2.5 px-3">Winner Name</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Phone Number</th>
                      <th className="py-2.5 px-3">Comment / Note</th>
                      <th className="py-2.5 px-3 text-center">Total Bids</th>
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
                          {item.lowest ? item.lowest.userName : <span className="text-gray-400 italic">No bids</span>}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">
                          {item.lowest ? item.lowest.userClass : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-900 whitespace-nowrap">
                          {item.lowest ? item.lowest.userPhone : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">
                          {item.lowest?.comment || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-600 font-medium">
                          {item.pricesCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SECTION 2: DETAILED SUBMISSIONS LEDGER (ITEM BY ITEM) */}
          {/* ============================================================= */}
          {(viewMode === 'both' || viewMode === 'detailed') && (
            <div className="space-y-4 pt-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-300">
                <Layers className="w-4 h-4 text-[#123A66]" />
                <span>Detailed Bids Ledger (Ranked Lowest to Highest)</span>
              </h2>

              <div className="space-y-4">
                {displayItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-gray-300 rounded-lg overflow-hidden print-break-inside-avoid"
                  >
                    {/* Item Heading */}
                    <div className="bg-gray-100 px-3.5 py-2 border-b border-gray-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          #{idx + 1} {item.name}
                        </span>
                        <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {item.filteredSubs.length} bids
                        </span>
                      </div>
                      {item.lowest && (
                        <div className="text-xs">
                          Winning: <strong className="text-[#B22026]">${item.lowest.price.toFixed(2)}</strong> by{' '}
                          <span className="font-medium text-gray-800">{item.lowest.userName}</span>
                        </div>
                      )}
                    </div>

                    {/* Submissions Table */}
                    {item.filteredSubs.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 italic bg-white">
                        No submissions recorded for this item yet.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left border-collapse bg-white">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[10px] uppercase">
                            <th className="py-1.5 px-3 w-16">Rank</th>
                            <th className="py-1.5 px-3">Price</th>
                            <th className="py-1.5 px-3">Participant Name</th>
                            <th className="py-1.5 px-3">Class</th>
                            <th className="py-1.5 px-3">Phone Number</th>
                            <th className="py-1.5 px-3">Note / Comment</th>
                            <th className="py-1.5 px-3 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {item.filteredSubs.map((sub, sIdx) => (
                            <tr
                              key={sub.id}
                              className={sIdx === 0 ? 'bg-red-50/70 font-medium' : 'hover:bg-gray-50'}
                            >
                              <td className="py-1.5 px-3">
                                {sIdx === 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-[#B22026] font-bold text-[10px]">
                                    ★ #1
                                  </span>
                                ) : (
                                  <span className="text-gray-500">#{sIdx + 1}</span>
                                )}
                              </td>
                              <td className="py-1.5 px-3 font-bold text-gray-900 whitespace-nowrap">
                                ${sub.price.toFixed(2)}
                              </td>
                              <td className="py-1.5 px-3 text-gray-900 whitespace-nowrap">{sub.userName}</td>
                              <td className="py-1.5 px-3 text-gray-600 whitespace-nowrap">{sub.userClass}</td>
                              <td className="py-1.5 px-3 font-mono text-gray-900 whitespace-nowrap">
                                {sub.userPhone}
                              </td>
                              <td className="py-1.5 px-3 text-gray-600 truncate max-w-xs">
                                {sub.comment || '—'}
                              </td>
                              <td className="py-1.5 px-3 text-right text-gray-400 text-[10px] whitespace-nowrap">
                                {new Date(sub.submittedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                            </tr>
                          ))}
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
            <span>Make Their Day &copy; {new Date().getFullYear()} • Charity Price Platform</span>
            <span>Confidential • Official Event Summary</span>
          </div>
        </div>
      </div>
    </div>
  );
}
