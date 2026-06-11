import { Consultation } from '../models/Consultation';
import { Client } from '../models/Client';
import { Types } from 'mongoose';

export class AnalyticsService {
  /**
   * Aggregate metrics for the dashboard cards
   */
  static async getDashboardMetrics(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Total Recordings (non-deleted)
    const totalRecordings = await Consultation.countDocuments({
      userId: userObjectId,
      isDeleted: false,
    });

    // 2. Total Clients
    const totalClients = await Client.countDocuments({
      userId: userObjectId,
    });

    // 3. Total Consultation Hours
    const durationSumResult = await Consultation.aggregate([
      { $match: { userId: userObjectId, isDeleted: false } },
      { $group: { _id: null, totalSeconds: { $sum: '$duration' } } },
    ]);
    const totalSeconds = durationSumResult[0]?.totalSeconds || 0;
    const totalHours = Number((totalSeconds / 3600).toFixed(1));

    // 4. Recordings This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const recordingsThisMonth = await Consultation.countDocuments({
      userId: userObjectId,
      isDeleted: false,
      createdAt: { $gte: startOfMonth },
    });

    return {
      totalRecordings,
      totalClients,
      totalHours,
      recordingsThisMonth,
    };
  }

  /**
   * Generate chart data for uploads per month, categories, and duration trends
   */
  static async getAnalyticsData(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // 1. Uploads per month (last 6 months)
    const uploadsPipeline = [
      {
        $match: {
          userId: userObjectId,
          isDeleted: false,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1 as const, '_id.month': 1 as const } },
    ];

    const uploadsResult = await Consultation.aggregate(uploadsPipeline);
    
    // Map of month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate empty buckets for the last 6 months
    const uploadsData = [];
    const dateCursor = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
      const year = dateCursor.getFullYear();
      const month = dateCursor.getMonth() + 1; // 1-indexed
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;
      
      const found = uploadsResult.find(
        (r) => r._id.year === year && r._id.month === month
      );
      
      uploadsData.push({
        month: monthLabel,
        recordings: found ? found.count : 0,
      });
      
      dateCursor.setMonth(dateCursor.getMonth() + 1);
    }

    // 2. Consultation categories
    const categoriesPipeline = [
      {
        $match: {
          userId: userObjectId,
          isDeleted: false,
        },
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 as const } },
    ];

    const categoriesResult = await Consultation.aggregate(categoriesPipeline);
    const categoriesData = categoriesResult.map((c) => ({
      name: c._id,
      value: c.value,
    }));

    // Fallback if no categories exist
    if (categoriesData.length === 0) {
      categoriesData.push(
        { name: 'CareerPrediction', value: 0 },
        { name: 'RelationshipMatch', value: 0 },
        { name: 'HealthAstrology', value: 0 }
      );
    }

    // 3. Consultation duration trends (avg duration in minutes per month)
    const durationPipeline = [
      {
        $match: {
          userId: userObjectId,
          isDeleted: false,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          avgDuration: { $avg: '$duration' },
        },
      },
      { $sort: { '_id.year': 1 as const, '_id.month': 1 as const } },
    ];

    const durationResult = await Consultation.aggregate(durationPipeline);
    const durationData = [];
    
    // Reset date cursor
    dateCursor.setTime(sixMonthsAgo.getTime());
    for (let i = 0; i < 6; i++) {
      const year = dateCursor.getFullYear();
      const month = dateCursor.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;
      
      const found = durationResult.find(
        (r) => r._id.year === year && r._id.month === month
      );
      
      durationData.push({
        month: monthLabel,
        // Convert seconds to average minutes, rounded to 1 decimal place
        avgMinutes: found ? Number((found.avgDuration / 60).toFixed(1)) : 0,
      });
      
      dateCursor.setMonth(dateCursor.getMonth() + 1);
    }

    return {
      uploadsOverTime: uploadsData,
      categoriesDistribution: categoriesData,
      durationTrends: durationData,
    };
  }
}
