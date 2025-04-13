import React, { useState, useEffect } from 'react';
import { encode } from 'gpt-tokenizer';
import './TokenCounter.css';

function TokenCounter({ content, modelName = 'gpt-3.5-turbo' }) {
  const [tokenCount, setTokenCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  // Define token limits for different models
  const modelLimits = {
    'gpt-3.5-turbo': 4096,
    'gpt-4': 8192,
    'gpt-4-32k': 32768,
    'claude-2': 100000,
    'claude-instant': 100000,
    'llama-2-7b': 4096,
    'llama-2-13b': 4096,
    'llama-2-70b': 4096
  };
  
  // Get the current model's token limit
  const currentLimit = modelLimits[modelName] || 4096;
  
  useEffect(() => {
    if (content) {
      // Count tokens
      const tokens = encode(content);
      setTokenCount(tokens.length);
      
      // Count characters
      setCharCount(content.length);
      
      // Count words
      setWordCount(content.split(/\s+/).filter(Boolean).length);
    } else {
      setTokenCount(0);
      setCharCount(0);
      setWordCount(0);
    }
  }, [content]);
  
  // Format model name for display
  const formattedModelName = formatModelName(modelName);
  
  // Calculate percentage of token limit used
  const percentUsed = (tokenCount / currentLimit) * 100;
  
  // Determine color based on usage
  const getBarColor = () => {
    if (percentUsed < 50) return 'var(--color-success)';
    if (percentUsed < 85) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };
  
  return (
    <div className={`token-counter ${showDetails ? 'token-details-open' : ''}`}>
      <div className="token-summary" onClick={() => setShowDetails(!showDetails)}>
        <div className="token-info">
          <span className="token-count">{tokenCount.toLocaleString()}</span> tokens
          <span className="token-model">({formattedModelName})</span>
          <span className="token-limit"> / {currentLimit.toLocaleString()}</span>
          <span className="token-percentage"> ({percentUsed.toFixed(1)}%)</span>
        </div>
        <div className="token-progress-container">
          <div 
            className="token-progress-bar" 
            style={{ 
              width: `${Math.min(percentUsed, 100)}%`,
              backgroundColor: getBarColor()
            }}
          ></div>
        </div>
      </div>
      
      {showDetails && (
        <div className="token-details">
          <div className="token-stats">
            <div className="token-stat">
              <div className="stat-label">Characters:</div>
              <div className="stat-value">{charCount.toLocaleString()}</div>
            </div>
            <div className="token-stat">
              <div className="stat-label">Words:</div>
              <div className="stat-value">{wordCount.toLocaleString()}</div>
            </div>
            <div className="token-stat">
              <div className="stat-label">Tokens per word:</div>
              <div className="stat-value">
                {wordCount > 0 ? (tokenCount / wordCount).toFixed(2) : '0'}
              </div>
            </div>
          </div>
          
          <div className="token-explainer">
            <p>
              <strong>What are tokens?</strong> Tokens are pieces of text that LLMs process. 
              A token can be a word, part of a word, or even a single character.
            </p>
            <p>
              <strong>Why do tokens matter?</strong> Most AI models have token limits
              and pricing is typically based on token usage.
            </p>
            <p className="token-tip">
              👉 Switch to the <strong>Token Analytics</strong> tab for detailed cost estimation and analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format model names
function formatModelName(modelName) {
  switch (modelName) {
    case 'gpt-3.5-turbo':
      return 'GPT-3.5';
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

export default TokenCounter;