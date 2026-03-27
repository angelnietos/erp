import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from '../../../database/services/invoice.repository';
import { InvoiceStatus } from '../../dto/tipo-factura.enum';
import { InvoiceDocument } from '../../../database/schemas/invoice.schema';

export interface InvoiceStatistics {
  total: number;
  byStatus: Record<InvoiceStatus, number>;
  byMonth: Array<{ month: string; count: number; total: number }>;
  bySeller: Array<{ sellerNif: string; sellerName: string; count: number; total: number }>;
  totalAmount: number;
  averageAmount: number;
  successRate: number;
  rejectionRate: number;
  pendingCount: number;
}

export interface InvoiceTrends {
  daily: Array<{ date: string; count: number; total: number }>;
  weekly: Array<{ week: string; count: number; total: number }>;
  monthly: Array<{ month: string; count: number; total: number }>;
}

/**
 * Invoice Analytics Service
 * Servicio de análisis y estadísticas de facturas
 */
@Injectable()
export class InvoiceAnalyticsService {
  constructor(private invoiceRepository: InvoiceRepository) {}

  /**
   * Get comprehensive statistics
   */
  async getStatistics(
    sellerNif?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InvoiceStatistics> {
    const filters: {
      sellerNif?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};
    if (sellerNif) filters.sellerNif = sellerNif;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const invoices = await this.invoiceRepository.findAll(1, 10000, filters);

    const stats: InvoiceStatistics = {
      total: invoices.total,
      byStatus: {} as Record<InvoiceStatus, number>,
      byMonth: [],
      bySeller: [],
      totalAmount: 0,
      averageAmount: 0,
      successRate: 0,
      rejectionRate: 0,
      pendingCount: 0,
    };

    // Initialize status counts
    Object.values(InvoiceStatus).forEach((status) => {
      stats.byStatus[status] = 0;
    });

    // Process invoices
    const monthMap = new Map<string, { count: number; total: number }>();
    const sellerMap = new Map<
      string,
      { name: string; count: number; total: number }
    >();

    let totalAmount = 0;
    let confirmedCount = 0;
    let rejectedCount = 0;

    invoices.invoices.forEach((invoice) => {
      // Status counts
      stats.byStatus[invoice.status] =
        (stats.byStatus[invoice.status] || 0) + 1;

      // Pending count
      if (
        invoice.status === InvoiceStatus.PENDIENTE_ENVIO ||
        invoice.status === InvoiceStatus.ENVIADA
      ) {
        stats.pendingCount++;
      }

      // Amounts
      totalAmount += invoice.totalAmount || 0;

      // Success/Rejection rates
      if (invoice.status === InvoiceStatus.CONFIRMADA) {
        confirmedCount++;
      } else if (invoice.status === InvoiceStatus.RECHAZADA) {
        rejectedCount++;
      }

      // Monthly aggregation
      const monthKey = new Date(invoice.issueDate).toISOString().slice(0, 7); // YYYY-MM
      const monthData = monthMap.get(monthKey) || { count: 0, total: 0 };
      monthData.count++;
      monthData.total += invoice.totalAmount || 0;
      monthMap.set(monthKey, monthData);

      // Seller aggregation
      const sellerKey = invoice.sellerNif;
      const sellerData = sellerMap.get(sellerKey) || {
        name: invoice.sellerName || sellerKey,
        count: 0,
        total: 0,
        sellerNif: sellerKey,
      };
      sellerData.count++;
      sellerData.total += invoice.totalAmount || 0;
      sellerMap.set(sellerKey, sellerData);
    });

    // Convert maps to arrays
    stats.byMonth = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    stats.bySeller = Array.from(sellerMap.entries())
      .map(([sellerNif, data]) => ({ sellerNif, sellerName: data.name, count: data.count, total: data.total }))
      .sort((a, b) => b.total - a.total);

    // Calculate derived metrics
    stats.totalAmount = totalAmount;
    stats.averageAmount =
      invoices.total > 0 ? totalAmount / invoices.total : 0;
    stats.successRate =
      invoices.total > 0 ? (confirmedCount / invoices.total) * 100 : 0;
    stats.rejectionRate =
      invoices.total > 0 ? (rejectedCount / invoices.total) * 100 : 0;

    return stats;
  }

  /**
   * Get trends over time
   */
  async getTrends(
    sellerNif?: string,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    days: number = 30,
  ): Promise<InvoiceTrends> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filters: {
      sellerNif?: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      startDate,
      endDate,
    };
    if (sellerNif) filters.sellerNif = sellerNif;

    const invoices = await this.invoiceRepository.findAll(1, 10000, filters);

    const trends: InvoiceTrends = {
      daily: [],
      weekly: [],
      monthly: [],
    };

    const dailyMap = new Map<string, { count: number; total: number }>();
    const weeklyMap = new Map<string, { count: number; total: number }>();
    const monthlyMap = new Map<string, { count: number; total: number }>();

    invoices.invoices.forEach((invoice) => {
      const date = new Date(invoice.issueDate);

      // Daily
      const dayKey = date.toISOString().split('T')[0];
      const dayData = dailyMap.get(dayKey) || { count: 0, total: 0 };
      dayData.count++;
      dayData.total += invoice.totalAmount || 0;
      dailyMap.set(dayKey, dayData);

      // Weekly
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekData = weeklyMap.get(weekKey) || { count: 0, total: 0 };
      weekData.count++;
      weekData.total += invoice.totalAmount || 0;
      weeklyMap.set(weekKey, weekData);

      // Monthly
      const monthKey = date.toISOString().slice(0, 7);
      const monthData = monthlyMap.get(monthKey) || { count: 0, total: 0 };
      monthData.count++;
      monthData.total += invoice.totalAmount || 0;
      monthlyMap.set(monthKey, monthData);
    });

    trends.daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    trends.weekly = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week));

    trends.monthly = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return trends;
  }

  /**
   * Get top sellers
   */
  async getTopSellers(limit: number = 10): Promise<
    Array<{
      sellerNif: string;
      sellerName: string;
      count: number;
      total: number;
      average: number;
    }>
  > {
    const invoices = await this.invoiceRepository.findAll(1, 10000);

    const sellerMap = new Map<
      string,
      { name: string; count: number; total: number }
    >();

    invoices.invoices.forEach((invoice) => {
      const sellerKey = invoice.sellerNif;
      const sellerData = sellerMap.get(sellerKey) || {
        name: invoice.sellerName || sellerKey,
        count: 0,
        total: 0,
      };
      sellerData.count++;
      sellerData.total += invoice.totalAmount || 0;
      sellerMap.set(sellerKey, sellerData);
    });

    return Array.from(sellerMap.entries())
      .map(([sellerNif, data]) => ({
        sellerNif,
        sellerName: data.name,
        count: data.count,
        total: data.total,
        average: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    sellerNif?: string,
    days: number = 30,
  ): Promise<{
    totalInvoices: number;
    successRate: number;
    averageProcessingTime: number;
    rejectionRate: number;
    pendingRate: number;
    totalAmount: number;
    averageAmount: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filters: {
      sellerNif?: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      startDate,
      endDate,
    };
    if (sellerNif) filters.sellerNif = sellerNif;

    const invoices = await this.invoiceRepository.findAll(1, 10000, filters);

    let totalAmount = 0;
    let confirmedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;
    let totalProcessingTime = 0;
    let processedCount = 0;

    invoices.invoices.forEach((invoice) => {
      totalAmount += invoice.totalAmount || 0;

      if (invoice.status === InvoiceStatus.CONFIRMADA) {
        confirmedCount++;
      } else if (invoice.status === InvoiceStatus.RECHAZADA) {
        rejectedCount++;
      } else if (invoice.status === InvoiceStatus.PENDIENTE_ENVIO) {
        pendingCount++;
      }

      // Calculate processing time
      if (invoice.sentAt && invoice.issueDate) {
        const processingTime =
          new Date(invoice.sentAt).getTime() -
          new Date(invoice.issueDate).getTime();
        totalProcessingTime += processingTime;
        processedCount++;
      }
    });

    const total = invoices.total;
    const averageProcessingTime =
      processedCount > 0 ? totalProcessingTime / processedCount : 0;

    return {
      totalInvoices: total,
      successRate: total > 0 ? (confirmedCount / total) * 100 : 0,
      averageProcessingTime: averageProcessingTime / 1000 / 60, // Convert to minutes
      rejectionRate: total > 0 ? (rejectedCount / total) * 100 : 0,
      pendingRate: total > 0 ? (pendingCount / total) * 100 : 0,
      totalAmount,
      averageAmount: total > 0 ? totalAmount / total : 0,
    };
  }
}
