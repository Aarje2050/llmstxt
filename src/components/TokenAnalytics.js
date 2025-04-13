import React, { useState, useEffect } from 'react';
import { encode } from 'gpt-tokenizer';
import './TokenAnalytics.css';

function TokenAnalytics({ content, modelName = 'gpt-3.5-turbo' }) {
  const [sectionTokens, setSectionTokens] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [modelPricing, setModelPricing] = useState({
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    'claude-2': { input: 0.01102, output: 0.03268 },
    'claude-instant': { input: 0.00163, output: 0.00551 },
    'llama-2-7b': { input: 0.0010, output: 0.0010 },
    'llama-2-13b': { input: 0.0020, output: 0.0020 },
    'llama-2-70b': { input: 0.0050, output: 0.0050 }
  });
  
  useEffect(() => {
    if (!content) return;
    
    // Split content by headings to analyze sections
    const sections = [];
    let currentHeading = 'Header';
    let currentContent = '';
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line is a heading
      if (line.startsWith('# ')) {
        // If we have content from a previous section, add it
        if (currentContent) {
          sections.push({
            title: currentHeading,
            content: currentContent,
            tokens: 0
          });
        }
        
        currentHeading = line.replace(/^#+ /, '');
        currentContent = line + '\n';
      } else if (line.startsWith('## ')) {
        // If we have content from a previous section, add it
        if (currentContent) {
          sections.push({
            title: currentHeading,
            content: currentContent,
            tokens: 0
          });
        }
        
        currentHeading = line.replace(/^#+ /, '');
        currentContent = line + '\n';
      } else {
        // Add line to current content
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentContent) {
      sections.push({
        title: currentHeading,
        content: currentContent,
        tokens: 0
      });
    }
    
    // Count tokens for each section
    let total = 0;
    const sectionsWithTokens = sections.map(section => {
      const tokens = encode(section.content).length;
      total += tokens;
      return {
        ...section,
        tokens
      };
    });
    
    setSectionTokens(sectionsWithTokens);
    setTotalTokens(total);
  }, [content]);
  
  // Calculate estimated cost
  const calculateCost = (tokens, pricePerToken) => {
    const cost = tokens * pricePerToken / 1000;
    return cost.toFixed(4);
  };
  
  // Get the current model's pricing
  const getCurrentModelPricing = () => {
    return modelPricing[modelName] || modelPricing['gpt-3.5-turbo'];
  };
  
  // Sort sections by token count
  const sortedSections = [...sectionTokens].sort((a, b) => b.tokens - a.tokens);
  
  return (
    <div className="token-analytics">
      <div className="analytics-summary">
        <div className="summary-item">
          <div className="summary-label">Total Tokens</div>
          <div className="summary-value">{totalTokens.toLocaleString()}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Estimated Cost ({formatModelName(modelName)})</div>
          <div className="summary-value">${calculateCost(totalTokens, getCurrentModelPricing().input)}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Sections</div>
          <div className="summary-value">{sectionTokens.length}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Avg Tokens Per Section</div>
          <div className="summary-value">
            {sectionTokens.length > 0 ? Math.round(totalTokens / sectionTokens.length).toLocaleString() : '0'}
          </div>
        </div>
      </div>
      
      <div className="token-distribution">
        <h4>Token Distribution by Section</h4>
        <div className="distribution-chart">
          {sortedSections.map((section, index) => {
            const percentage = (section.tokens / totalTokens) * 100;
            return (
              <div key={index} className="chart-bar-container">
                <div className="bar-label">
                  <span className="section-title" title={section.title}>
                    {section.title.length > 20 ? section.title.substring(0, 20) + '...' : section.title}
                  </span>
                  <span className="section-tokens">{section.tokens.toLocaleString()} tokens</span>
                </div>
                <div className="chart-bar-bg">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getColorForPercentage(percentage)
                    }}
                  ></div>
                </div>
                <div className="bar-percentage">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="pricing-table">
        <h4>Token Pricing (per 1K tokens)</h4>
        <div className="price-cards">
          {Object.entries(modelPricing).map(([model, { input, output }]) => (
            <div key={model} className={`price-card ${model === modelName ? 'highlighted' : ''}`}>
              <div className="model-name">{formatModelName(model)}</div>
              <div className="price-details">
                <div className="price-row">
                  <span>Input:</span>
                  <span>${input.toFixed(4)}</span>
                </div>
                <div className="price-row">
                  <span>Output:</span>
                  <span>${output.toFixed(4)}</span>
                </div>
                <div className="price-row total">
                  <span>Your Content:</span>
                  <span>${calculateCost(totalTokens, input)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="token-tips">
        <h4>Tips for Reducing Token Usage</h4>
        <ul>
          <li>Be concise in descriptions and remove redundant information</li>
          <li>Use shorter section headings while maintaining clarity</li>
          <li>Consider removing very small sections and merging them</li>
          <li>Use abbreviations for common terms (but include a legend)</li>
          <li>Focus content on the most valuable information for AI models</li>
        </ul>
      </div>
    </div>
  );
}

// Helper function to format model names
function formatModelName(modelName) {
  switch (modelName) {
    case 'gpt-3.5-turbo':
      return 'GPT-3.5 Turbo';
    case 'gpt-4':
      return 'GPT-4 (8K)';
    case 'gpt-4-32k':
      return 'GPT-4 (32K)';
    case 'claude-2':
      return 'Claude 2';
    case 'claude-instant':
      return 'Claude Instant';
    case 'llama-2-7b':
      return 'LLaMA 2 7B';
    case 'llama-2-13b':
      return 'LLaMA 2 13B';
    case 'llama-2-70b':
      return 'LLaMA 2 70B';
    default:
      return modelName;
  }
}

// Helper function to get color based on percentage
function getColorForPercentage(percentage) {
  if (percentage < 5) return '#10b981'; // Green for small sections
  if (percentage < 15) return '#3b82f6'; // Blue for medium sections
  if (percentage < 30) return '#f59e0b'; // Orange for large sections
  return '#ef4444'; // Red for very large sections
}

export default TokenAnalytics;