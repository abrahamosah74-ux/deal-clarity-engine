import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiFileText, FiDownload, FiCalendar, FiDollarSign, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('sales-summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
    fetchDeals();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/summary');
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await api.get('/deals');
      setDeals(response.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Deal Clarity - Sales Report', 20, yPosition);
    yPosition += 15;

    // Date Range
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 20, yPosition);
    yPosition += 10;

    // Sales Summary Section
    if (reportType.includes('sales') && analytics) {
      doc.setFontSize(14);
      doc.text('Sales Summary', 20, yPosition);
      yPosition += 10;

      const summaryData = [
        ['Total Deals', analytics.totalDeals || 0],
        ['Total Pipeline Value', `$${(analytics.totalPipelineValue || 0).toLocaleString()}`],
        ['Average Deal Size', `$${(analytics.averageDealSize || 0).toLocaleString()}`],
        ['Total Contacts', analytics.totalContacts || 0],
        ['Active Tasks', analytics.activeTasks || 0]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        margin: { left: 20, right: 20 }
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Pipeline Stage Analysis
    if (reportType.includes('pipeline') && analytics) {
      doc.setFontSize(14);
      doc.text('Pipeline by Stage', 20, yPosition);
      yPosition += 10;

      const stageData = [
        ['Discovery', `${analytics.byStage?.discovery || 0} deals`],
        ['Demo', `${analytics.byStage?.demo || 0} deals`],
        ['Proposal', `${analytics.byStage?.proposal || 0} deals`],
        ['Negotiation', `${analytics.byStage?.negotiation || 0} deals`],
        ['Won', `${analytics.byStage?.won || 0} deals`],
        ['Lost', `${analytics.byStage?.lost || 0} deals`]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Stage', 'Count']],
        body: stageData,
        margin: { left: 20, right: 20 }
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Top Deals
    if (reportType.includes('deals') && deals.length > 0) {
      doc.setFontSize(14);
      doc.text('Top 10 Deals', 20, yPosition);
      yPosition += 10;

      const topDeals = deals.slice(0, 10).map(deal => [
        deal.name,
        `$${(deal.amount || 0).toLocaleString()}`,
        deal.stage,
        `${deal.probability || 0}%`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Deal Name', 'Amount', 'Stage', 'Probability']],
        body: topDeals,
        margin: { left: 20, right: 20 }
      });
    }

    // Save PDF
    doc.save(`deal-clarity-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExcelReport = () => {
    // For Excel export, we'll use a simple CSV approach
    let csv = [];

    // Header
    csv.push(['Deal Clarity - Sales Report']);
    csv.push([`Period: ${dateRange.startDate} to ${dateRange.endDate}`]);
    csv.push([]);

    // Summary
    csv.push(['SALES SUMMARY']);
    if (analytics) {
      csv.push(['Total Deals', analytics.totalDeals || 0]);
      csv.push(['Total Pipeline Value', analytics.totalPipelineValue || 0]);
      csv.push(['Average Deal Size', analytics.averageDealSize || 0]);
      csv.push(['Total Contacts', analytics.totalContacts || 0]);
      csv.push(['Active Tasks', analytics.activeTasks || 0]);
    }
    csv.push([]);

    // Deals
    csv.push(['DEALS']);
    csv.push(['Deal Name', 'Amount', 'Stage', 'Probability', 'Contact']);
    deals.forEach(deal => {
      csv.push([
        deal.name,
        deal.amount || 0,
        deal.stage,
        `${deal.probability || 0}%`,
        deal.contact?.name || ''
      ]);
    });

    // Convert to CSV string
    const csvContent = csv.map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `deal-clarity-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiFileText /> Reports
        </h1>
        <p className="text-gray-600">Generate and export comprehensive sales reports</p>
      </div>

      {/* Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold">Generate Report</h2>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="sales-summary">Sales Summary</option>
              <option value="sales-pipeline">Sales & Pipeline</option>
              <option value="deals">Top Deals</option>
              <option value="sales-pipeline-deals">Complete Report (All)</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={generatePDFReport}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2"
            >
              <FiDownload /> Export as PDF
            </button>
            <button
              onClick={generateExcelReport}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
            >
              <FiDownload /> Export as CSV
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {analytics && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiDollarSign className="text-blue-600" />
                  <span className="text-sm text-gray-600">Pipeline Value</span>
                </div>
                <p className="text-2xl font-bold">${(analytics.totalPipelineValue || 0).toLocaleString()}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-green-600" />
                  <span className="text-sm text-gray-600">Total Deals</span>
                </div>
                <p className="text-2xl font-bold">{analytics.totalDeals || 0}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiBarChart2 className="text-purple-600" />
                  <span className="text-sm text-gray-600">Avg Deal Size</span>
                </div>
                <p className="text-2xl font-bold">${(analytics.averageDealSize || 0).toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pre-built Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiBarChart2 /> Sales Performance
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li>✓ Total revenue this period</li>
            <li>✓ Deals by stage breakdown</li>
            <li>✓ Win rate analysis</li>
            <li>✓ Sales velocity trends</li>
          </ul>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp /> Sales Forecast
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li>✓ Revenue forecast</li>
            <li>✓ Probability-weighted pipeline</li>
            <li>✓ Monthly projections</li>
            <li>✓ Best case / Worst case scenarios</li>
          </ul>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiCalendar /> Activity Report
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li>✓ Activities by team member</li>
            <li>✓ Calls, emails, meetings</li>
            <li>✓ Contact interaction history</li>
            <li>✓ Task completion rates</li>
          </ul>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiFileText /> Custom Report
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li>✓ Select your own metrics</li>
            <li>✓ Custom date ranges</li>
            <li>✓ Filter by stage, contact, team</li>
            <li>✓ Schedule recurring reports</li>
          </ul>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold">
            Build Custom Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
