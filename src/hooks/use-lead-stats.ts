
import { useMemo } from 'react';
import { Lead } from '@/types/lead';

export function useLeadStats(leads: Lead[]) {
  return useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    
    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLeads = leads.filter(lead => 
      new Date(lead.createdAt) > weekAgo
    ).length;
    
    // Lead sources breakdown
    const sourceBreakdown = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Average lead score
    const averageScore = totalLeads > 0 
      ? leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads 
      : 0;
    
    // High-priority leads (score > 80)
    const highPriorityLeads = leads.filter(lead => lead.score > 80).length;
    
    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      conversionRate,
      qualificationRate,
      recentLeads,
      sourceBreakdown,
      averageScore,
      highPriorityLeads
    };
  }, [leads]);
}
