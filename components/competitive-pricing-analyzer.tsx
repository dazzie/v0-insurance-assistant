'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PricingStrategy {
  recommendedPrice: number;
  confidence: 'high' | 'medium' | 'low';
  strategy: string;
  reasoning: string[];
  profitMargin: number;
  winProbability: number;
  competitiveAdvantage: string;
  coverageDetails: CoverageDetails;
}

interface CoverageDetails {
  liability: {
    bodilyInjury: string;
    propertyDamage: string;
    uninsuredMotorist: string;
  };
  physicalDamage: {
    collision: string;
    comprehensive: string;
  };
  additionalCoverages: Array<{
    name: string;
    limit: string;
    premium: number;
    description: string;
  }>;
  deductibles: {
    collision: string;
    comprehensive: string;
  };
  discounts: Array<{
    name: string;
    amount: string;
    description: string;
  }>;
  coverageLevel: {
    name: string;
    description: string;
    features: string[];
    liabilityExplanation: string;
  };
}

interface MarketIntelligence {
  marketLeader: string;
  marketLaggard: string;
  priceSpread: number;
  averageRate: number;
  opportunity: string;
  recommendation: string;
}

interface CompetitivePricingAnalyzerProps {
  customerProfile: any;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function CompetitivePricingAnalyzer({ 
  customerProfile, 
  onAnalysisComplete 
}: CompetitivePricingAnalyzerProps) {
  const [yourQuote, setYourQuote] = useState<number>(0);
  const [targetCarrier, setTargetCarrier] = useState<string>('Progressive');
  const [coverageLevel, setCoverageLevel] = useState<string>('competitive');
  const [currentPolicy, setCurrentPolicy] = useState<any>(null);
  const [showCurrentPolicy, setShowCurrentPolicy] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!yourQuote || yourQuote <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/competitive-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerProfile,
          yourQuote,
          targetCarrier,
          coverageLevel,
          currentPolicy
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data);
        onAnalysisComplete?.(data);
      } else {
        alert('Failed to analyze pricing');
      }
    } catch (error) {
      console.error('Error analyzing pricing:', error);
      alert('Error analyzing pricing');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProfitColor = (margin: number) => {
    if (margin > 10) return 'text-green-600';
    if (margin > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-lg font-semibold mb-4">🎯 Competitive Pricing Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Quote ($/month)
            </label>
            <input
              type="number"
              value={yourQuote}
              onChange={(e) => setYourQuote(Number(e.target.value))}
              placeholder="150"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Carrier
            </label>
            <select
              value={targetCarrier}
              onChange={(e) => setTargetCarrier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Progressive">Progressive</option>
              <option value="GEICO">GEICO</option>
              <option value="State Farm">State Farm</option>
              <option value="Allstate">Allstate</option>
              <option value="Liberty Mutual">Liberty Mutual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Level
            </label>
            <select
              value={coverageLevel}
              onChange={(e) => setCoverageLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="aggressive">Basic Protection</option>
              <option value="competitive">Standard Protection</option>
              <option value="premium">Comprehensive Protection</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleAnalyze}
              disabled={loading || !yourQuote}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Analyzing...' : 'Analyze Pricing'}
            </Button>
          </div>
        </div>

        {/* Current Policy Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Current Policy (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowCurrentPolicy(!showCurrentPolicy)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showCurrentPolicy ? 'Hide' : 'Add Current Policy'}
            </button>
          </div>
          
          {showCurrentPolicy && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Premium ($/month)
                </label>
                <input
                  type="number"
                  value={currentPolicy?.monthlyPremium || ''}
                  onChange={(e) => setCurrentPolicy({
                    ...currentPolicy,
                    monthlyPremium: Number(e.target.value)
                  })}
                  placeholder="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Carrier
                </label>
                <input
                  type="text"
                  value={currentPolicy?.carrier || ''}
                  onChange={(e) => setCurrentPolicy({
                    ...currentPolicy,
                    carrier: e.target.value
                  })}
                  placeholder="State Farm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liability Coverage
                </label>
                <input
                  type="text"
                  value={currentPolicy?.liability || ''}
                  onChange={(e) => setCurrentPolicy({
                    ...currentPolicy,
                    liability: e.target.value
                  })}
                  placeholder="100/300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Main Strategy */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Recommended Strategy</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  ${analysis.pricingStrategy.recommendedPrice.toFixed(0)}/mo
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Recommended Price
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Strategy:</span>
                    <span className="font-semibold">{analysis.pricingStrategy.strategy}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(analysis.pricingStrategy.confidence)}`}>
                      {analysis.pricingStrategy.confidence.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Win Probability:</span>
                    <span className="font-semibold">{(analysis.pricingStrategy.winProbability * 100).toFixed(0)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profit Margin:</span>
                    <span className={`font-semibold ${getProfitColor(analysis.pricingStrategy.profitMargin)}`}>
                      {analysis.pricingStrategy.profitMargin > 0 ? '+' : ''}{analysis.pricingStrategy.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Reasoning:</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysis.pricingStrategy.reasoning.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-semibold text-green-800 mb-1">Competitive Advantage:</div>
                  <div className="text-sm text-green-700">{analysis.pricingStrategy.competitiveAdvantage}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Market Intelligence */}
          {analysis.marketIntelligence && (
            <Card className="p-6 bg-white shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4">📈 Market Intelligence</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Leader:</span>
                      <span className="font-semibold text-green-600">{analysis.marketIntelligence.marketLeader}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Laggard:</span>
                      <span className="font-semibold text-red-600">{analysis.marketIntelligence.marketLaggard}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price Spread:</span>
                      <span className="font-semibold">${analysis.marketIntelligence.priceSpread.toFixed(0)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Rate:</span>
                      <span className="font-semibold">${analysis.marketIntelligence.averageRate.toFixed(0)}/mo</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="p-4 bg-yellow-50 rounded-lg mb-3">
                    <div className="text-sm font-semibold text-yellow-800 mb-1">Opportunity:</div>
                    <div className="text-sm text-yellow-700">{analysis.marketIntelligence.opportunity}</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold text-blue-800 mb-1">Recommendation:</div>
                    <div className="text-sm text-blue-700">{analysis.marketIntelligence.recommendation}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Coverage Level Overview */}
          {analysis.pricingStrategy.coverageDetails?.coverageLevel && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">🛡️ Coverage Level: {analysis.pricingStrategy.coverageDetails.coverageLevel.name}</h4>
              <p className="text-gray-700 mb-4">{analysis.pricingStrategy.coverageDetails.coverageLevel.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Key Features:</h5>
                  <ul className="space-y-1">
                    {analysis.pricingStrategy.coverageDetails.coverageLevel.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Liability Coverage:</h5>
                  <p className="text-sm text-gray-600">{analysis.pricingStrategy.coverageDetails.coverageLevel.liabilityExplanation}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Detailed Coverage Information */}
          {analysis.pricingStrategy.coverageDetails && (
            <Card className="p-6 bg-white shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4">📋 Detailed Coverage Breakdown</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Liability Coverage */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 border-b pb-2">Liability Coverage</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bodily Injury:</span>
                      <span className="font-medium">${analysis.pricingStrategy.coverageDetails.liability.bodilyInjury}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Property Damage:</span>
                      <span className="font-medium">${analysis.pricingStrategy.coverageDetails.liability.propertyDamage}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uninsured Motorist:</span>
                      <span className="font-medium">${analysis.pricingStrategy.coverageDetails.liability.uninsuredMotorist}</span>
                    </div>
                  </div>
                </div>

                {/* Physical Damage */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 border-b pb-2">Physical Damage</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Collision:</span>
                      <span className="font-medium">{analysis.pricingStrategy.coverageDetails.physicalDamage.collision}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Comprehensive:</span>
                      <span className="font-medium">{analysis.pricingStrategy.coverageDetails.physicalDamage.comprehensive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Collision Deductible:</span>
                      <span className="font-medium">${analysis.pricingStrategy.coverageDetails.deductibles.collision}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Comp Deductible:</span>
                      <span className="font-medium">${analysis.pricingStrategy.coverageDetails.deductibles.comprehensive}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Coverages */}
              <div className="mt-6">
                <h5 className="font-semibold text-gray-900 border-b pb-2 mb-4">Additional Coverages</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.pricingStrategy.coverageDetails.additionalCoverages.map((coverage, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{coverage.name}</span>
                        <span className="text-sm text-blue-600">+${coverage.premium}/mo</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Limit: {coverage.limit}</div>
                      <div className="text-xs text-gray-500">{coverage.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Discounts */}
              <div className="mt-6">
                <h5 className="font-semibold text-gray-900 border-b pb-2 mb-4">Available Discounts</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.pricingStrategy.coverageDetails.discounts.map((discount, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <span className="font-medium text-gray-900">{discount.name}</span>
                        <div className="text-xs text-gray-600">{discount.description}</div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{discount.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Current Policy Analysis */}
          {analysis.pricingStrategy.currentPolicyAnalysis && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">🔄 Current Policy Renewal Analysis</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Current Policy Details */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 border-b pb-2">Current Policy</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Carrier:</span>
                      <span className="font-medium">{analysis.pricingStrategy.currentPolicyAnalysis.currentCarrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Premium:</span>
                      <span className="font-medium">${analysis.pricingStrategy.currentPolicyAnalysis.currentPremium.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Liability:</span>
                      <span className="font-medium">${analysis.pricingStrategy.currentPolicyAnalysis.currentCoverage.liability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deductible:</span>
                      <span className="font-medium">${analysis.pricingStrategy.currentPolicyAnalysis.currentCoverage.deductibles}</span>
                    </div>
                  </div>
                </div>

                {/* Competitive Advantage */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 border-b pb-2">Your Competitive Advantage</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Savings:</span>
                      <span className="font-medium text-green-600">
                        ${analysis.pricingStrategy.currentPolicyAnalysis.competitiveAdvantage.priceSavings.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Savings:</span>
                      <span className="font-medium text-green-600">
                        ${(analysis.pricingStrategy.currentPolicyAnalysis.competitiveAdvantage.priceSavings * 12).toFixed(0)}
                      </span>
                    </div>
                  </div>
                  
                  {analysis.pricingStrategy.currentPolicyAnalysis.competitiveAdvantage.coverageImprovements.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Coverage Improvements:</h6>
                      <ul className="space-y-1">
                        {analysis.pricingStrategy.currentPolicyAnalysis.competitiveAdvantage.coverageImprovements.map((improvement: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5"></span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Renewal Strategy */}
              <div className="mt-6">
                <h5 className="font-semibold text-gray-900 border-b pb-2 mb-4">
                  Renewal Strategy: {analysis.pricingStrategy.currentPolicyAnalysis.renewalStrategy.approach}
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2">Key Selling Points:</h6>
                    <ul className="space-y-1">
                      {analysis.pricingStrategy.currentPolicyAnalysis.renewalStrategy.keySellingPoints.map((point: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2">Risk Mitigation:</h6>
                    <ul className="space-y-1">
                      {analysis.pricingStrategy.currentPolicyAnalysis.renewalStrategy.riskMitigation.map((strategy: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 mt-1.5"></span>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Multiple Scenarios */}
          {analysis.scenarios && analysis.scenarios.length > 0 && (
            <Card className="p-6 bg-white shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4">🎯 Alternative Strategies</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.scenarios.map((scenario: PricingStrategy, idx: number) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      ${scenario.recommendedPrice.toFixed(0)}/mo
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{scenario.strategy}</div>
                    <div className="text-xs text-gray-500">
                      Win: {(scenario.winProbability * 100).toFixed(0)}% | 
                      Margin: {scenario.profitMargin > 0 ? '+' : ''}{scenario.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
