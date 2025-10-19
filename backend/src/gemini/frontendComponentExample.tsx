/* /**
 * Frontend Component Example
 * Shows how to display linked recommendations in your app
 */

import React, { useState } from 'react';
import { AnalysisResult, Recommendation, Anomaly, CategoryAnalysis } from './types';

// Example React component for displaying linked recommendations
export const RecommendationCard: React.FC<{
  recommendation: Recommendation;
  supportingInsights: CategoryAnalysis[];
  supportingAnomalies: Anomaly[];
}> = ({ recommendation, supportingInsights, supportingAnomalies }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="recommendation-card" onClick={() => setIsExpanded(!isExpanded)}>
      {/* Card Header - Always Visible */}
      <div className="card-header">
        <div className="header-content">
          <span className="category-icon">
            {recommendation.category === 'financial' ? '💰' : 
             recommendation.category === 'wellness' ? '🧘' : '🎯'}
          </span>
          <h3 className="short-insight">{recommendation.shortInsight}</h3>
        </div>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* Detailed View - Only when expanded */}
      {isExpanded && (
        <div className="detailed-view">
          {/* Main Recommendation */}
          <div className="recommendation-details">
            <h4>Recommendation</h4>
            <p>{recommendation.detailedAdvice}</p>
          </div>

          {/* Supporting AI Insights */}
          {supportingInsights.length > 0 && (
            <div className="supporting-insights">
              <h4>Understand the Analysis</h4>
              {supportingInsights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-header">
                    <span className="category">{insight.category}</span>
                    <span className="trend">{insight.trend}</span>
                    <span className="change">{insight.change}</span>
                  </div>
                  <p className="insight-text">{insight.detailedAnalysis}</p>
                </div>
              ))}
            </div>
          )}

          {/* Supporting Anomalies */}
          {supportingAnomalies.length > 0 && (
            <div className="supporting-anomalies">
              <h4>Related Anomalies</h4>
              {supportingAnomalies.map((anomaly, index) => (
                <div key={index} className="anomaly-item">
                  <div className="anomaly-header">
                    <span className="date">{anomaly.date}</span>
                    <span className="category">{anomaly.category}</span>
                    <span className="amount">${anomaly.amount}</span>
                  </div>
                  <p className="anomaly-reason">{anomaly.detailedReason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component that uses the linked recommendations
export const FinancialAnalysisDashboard: React.FC<{
  analysis: AnalysisResult;
}> = ({ analysis }) => {
  return (
    <div className="financial-dashboard">
      {/* Summary Section */}
      <div className="summary-section">
        <h2>Financial Analysis</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p>${analysis.summary.totalSpent.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Average Daily</h3>
            <p>${analysis.summary.averageDaily.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="recommendations-section">
        <h2>Personalized Recommendations</h2>
        <div className="recommendations-grid">
          {analysis.recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              recommendation={recommendation}
              supportingInsights={analysis.categories.filter(cat => 
                recommendation.linkedInsights.some(insight => 
                  cat.detailedAnalysis.includes(insight)
                )
              )}
              supportingAnomalies={analysis.anomalies.filter(anomaly => 
                recommendation.linkedAnomalies.includes(anomaly.id)
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// CSS Styles (you can move these to a separate CSS file)
export const styles = `
.recommendation-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 24px;
}

.short-insight {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.expand-icon {
  font-size: 14px;
  color: #666;
}

.detailed-view {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.recommendation-details h4,
.supporting-insights h4,
.supporting-anomalies h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.insight-item,
.anomaly-item {
  margin: 12px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.insight-header,
.anomaly-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
}

.category {
  color: #007bff;
}

.trend {
  color: #28a745;
}

.change {
  color: #6c757d;
}

.date {
  color: #6c757d;
}

.amount {
  color: #dc3545;
  font-weight: 600;
}

.insight-text,
.anomaly-reason {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #555;
}
`;

// Usage example
export const usageExample = `
// In your main app component
import { FinancialAnalysisDashboard } from './FinancialAnalysisDashboard';
import { analyzeSpending } from './analyzeSpending';

function App() {
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    analyzeSpending(transactions).then(setAnalysis);
  }, [transactions]);
  
  return (
    <div>
      {analysis && <FinancialAnalysisDashboard analysis={analysis} />}
    </div>
  );
}
`;
 */