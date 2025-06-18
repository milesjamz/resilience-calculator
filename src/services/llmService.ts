import OpenAI from 'openai';
import { Recommendation, LLMContext } from '../types/assessment';

export class LLMService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async generateRecommendations(context: LLMContext): Promise<Recommendation[]> {
    if (!this.openai) {
      return this.generateMockRecommendations(context);
    }

    try {
      const prompt = this.buildRecommendationPrompt(context);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content;
      return content ? this.parseRecommendations(content, context) : this.generateMockRecommendations(context);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateMockRecommendations(context);
    }
  }

  async generateSummary(context: LLMContext): Promise<string> {
    if (!this.openai) {
      return this.generateMockSummary(context);
    }

    try {
      const prompt = this.buildSummaryPrompt(context);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],

      });
      console.log('returning real LLM response for summary', response)
      return response.choices[0].message.content || this.generateMockSummary(context);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateMockSummary(context);
    }
  }

  private buildRecommendationPrompt(context: LLMContext): string {
    return `
    As a flood resilience expert in New Orleans architecture, analyze this building assessment:
    
    Building: ${context.neighborhood.name}, ${context.foundation.name}, ${context.input.elevation}ft elevation
    Foundation Score: ${context.foundationScore}%
    Overall Score: ${context.overallScore}%
    Flood Zone: ${context.neighborhood.floodZone}
    Risk Factors: ${context.riskFactors.join(', ')}

    Please round the foundation and overall scores to the nearest whole number.
    
    Provide 3-5 specific, actionable recommendations prioritized by impact and feasibility.
    Consider:
    - NFIP compliance requirements
    - Cost-effectiveness for architects
    - 30-year timeline considerations
    - New Orleans-specific challenges (subsidence, hurricane risk)
    
    Format each recommendation with priority, cost range, expected benefit, and implementation timeframe.
    `;
  }

  private buildSummaryPrompt(context: LLMContext): string {
    return `
    Summarize this flood resilience assessment for a New Orleans architect in 2-3 sentences:
    Score: ${context.overallScore}%
    Timeline: Shows performance through 2055
    Key risks: ${context.riskFactors.join(', ')}
    
    Be specific about the building's resilience and key action items, and round the score to the nearest whole number. If the building's score for the present is good, but will drop steeply in the next 30 years, mentionn it in the response.
    `;
  }

  private parseRecommendations(content: string, context: LLMContext): Recommendation[] {
    // ideally we'd have a robust pre-made list of recommendations, and would ask the llm to pick which were appropriate for this use case. for now, use fallback algo.
    return this.generateMockRecommendations(context);
  }

  //fallback deterministic algo, to use in case of no API key or LLM access.
  private generateMockRecommendations(context: LLMContext): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (context.foundationScore < 70) {
      recommendations.push({
        action: `Upgrade from ${context.foundation.name} to pile/column foundation`,
        priority: 'high',
        costRange: { min: 50000, max: 120000 },
        benefit: 'Increases resilience score by 20-30% and ensures V-zone compliance',
        timeframe: 'Within 3 years',
        roi: 2.5,
        type: 'structural',
        feasibility: 'complex'
      });
    }

    if (context.input.elevation < context.neighborhood.baseBFE + 2) {
      recommendations.push({
        action: 'Elevate structure additional 2-3 feet above current level',
        priority: 'high',
        costRange: { min: 25000, max: 60000 },
        benefit: 'Reduces flood insurance premiums and improves long-term viability',
        timeframe: 'Within 2 years',
        roi: 3.0,
        type: 'elevation',
        feasibility: 'moderate'
      });
    }

    if (context.input.floodMitigation === 'none') {
      recommendations.push({
        action: 'Install NFIP-compliant flood vents and openings',
        priority: 'medium',
        costRange: { min: 2500, max: 4000 },
        benefit: 'Required for code compliance, reduces hydrostatic pressure damage',
        timeframe: 'Within 6 months',
        roi: 4.0,
        type: 'mitigation',
        feasibility: 'easy'
      });
    }

    if (context.neighborhood.subsidenceRate > 0.4) {
      recommendations.push({
        action: 'Implement ongoing foundation monitoring and maintenance program',
        priority: 'medium',
        costRange: { min: 3000, max: 8000 },
        benefit: 'Early detection of subsidence-related issues, extends foundation life',
        timeframe: 'Ongoing',
        roi: 2.0,
        type: 'mitigation',
        feasibility: 'easy'
      });
    }

    if (context.overallScore < 60) {
      recommendations.push({
        action: 'Comprehensive retrofit with flood-resistant materials',
        priority: 'high',
        costRange: { min: 15000, max: 35000 },
        benefit: 'Improves overall resilience and reduces repair costs after flooding',
        timeframe: 'Within 18 months',
        roi: 2.2,
        type: 'material',
        feasibility: 'moderate'
      });
    }
    console.log('returning mock recommendations')
    return recommendations;
  }

  // same, but for summary.
  private generateMockSummary(context: LLMContext): string {
    const score = context.overallScore;
    const foundation = context.foundation.name;
    const neighborhood = context.neighborhood.name;
    const mainRisks = context.riskFactors.slice(0, 2).join(' and ');

    let summary = `Your building in ${neighborhood} with ${foundation} shows `;
    
    if (score >= 80) {
      summary += `excellent flood resilience (${Math.round(score)}%). `;
    } else if (score >= 70) {
      summary += `good flood resilience (${Math.round(score)}%). `;
    } else if (score >= 60) {
      summary += `fair flood resilience (${Math.round(score)}%). `;
    } else {
      summary += `poor flood resilience (${Math.round(score)}%). `;
    }

const score2045 = context.timeline.find(t => t.year === 2045)?.score ?? 0;
if (score2045 >= 65) {
      summary += 'The building should maintain adequate protection through 2045 with proper maintenance. ';
    } else {
      const criticalYear = context.timeline.find(t => t.score < 60)?.year || 2040;
      summary += `Consider major improvements by ${criticalYear} to maintain adequate protection. `;
    }

    if (mainRisks) {
      summary += `Primary concerns include ${mainRisks}.`;
    }

    return summary;
  }
}
