import React, { useState } from 'react';
import FileActions from './FileActions';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import TokenCounter from './TokenCounter';
import TokenAnalytics from './TokenAnalytics';
import FileEditor from './FileEditor';

function FilePreview({ 
  results, 
  activeUrl, 
  activeMdFile, 
  onUrlChange, 
  onMdFileChange,
  onUpdateLlmsTxt,
  onUpdateMdFile
}) {
  const [activeTab, setActiveTab] = useState('llms-txt');
  const [isEditing, setIsEditing] = useState(false);
  const [tokenModel, setTokenModel] = useState('gpt-3.5-turbo');

  const result = results[activeUrl];
  
  // Handle errors
  if (result.status === 'error') {
    return (
      <div className="file-preview-container">
        <h2>Error</h2>
        <div className="alert alert-error">
          {result.error}
        </div>
      </div>
    );
  }
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSaveContent = (content) => {
    if (activeTab === 'llms-txt') {
      // Clean any potential .md extensions before saving
      const cleanedContent = cleanMdExtensions(content);
      onUpdateLlmsTxt(activeUrl, cleanedContent);
    } else if (activeTab === 'md-files' && activeMdFile) {
      onUpdateMdFile(activeUrl, activeMdFile, content);
    }
    
    setIsEditing(false);
  };

  // Handle token model change
  const handleModelChange = (model) => {
    setTokenModel(model);
  };
  
  // Function to clean .md extensions from content if any are present
  const cleanMdExtensions = (content) => {
    // Simple regex to find and remove .md extensions in markdown links
    return content.replace(/\]\(([^)]+)\.md\)/g, ']($1)');
  };
  
  // Get clean content
  const getCleanContent = () => {
    return cleanMdExtensions(result.llms_txt || '');
  };
  
  // Get current filename based on active tab
  const getCurrentFilename = () => {
    if (activeTab === 'llms-txt') {
      return 'LLMs.txt';
    } else if (activeTab === 'md-files' && activeMdFile) {
      return result.md_files[activeMdFile].filename;
    }
    return '';
  };

  return (
    <div className="file-preview-container">
      <h2>Results for {activeUrl}</h2>
      
      {/* URL selection dropdown if multiple URLs */}
      {Object.keys(results).length > 1 && (
        <div className="input-group">
          <label htmlFor="url-select">Select URL:</label>
          <select 
            id="url-select"
            value={activeUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="select-input"
          >
            {Object.keys(results).map(url => (
              <option key={url} value={url}>
                {url}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Tab navigation */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'llms-txt' ? 'active' : ''}`}
          onClick={() => setActiveTab('llms-txt')}
        >
          LLMs.txt
        </div>
        <div 
          className="tab disabled"
          title="Markdown files coming soon"
        >
          Markdown Files <span className="coming-soon-badge">COMING SOON</span>
        </div>
        <div 
          className={`tab ${activeTab === 'discovered-urls' ? 'active' : ''}`}
          onClick={() => setActiveTab('discovered-urls')}
        >
          Discovered URLs <span className="url-count">{result.discovered_urls.length}</span>
        </div>
        <div 
          className={`tab ${activeTab === 'token-analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('token-analytics')}
        >
          Token Analytics
        </div>
      </div>
      
      {/* Content area */}
      <div className="file-preview-content">
        {activeTab === 'llms-txt' && (
          <>
            <h3>LLMs.txt</h3>
            
            {/* Token counter in LLMs.txt tab */}
            <TokenCounter 
              content={getCleanContent()} 
              modelName={tokenModel}
            />
            
            {isEditing ? (
              <FileEditor 
                content={getCleanContent()}
                onSave={handleSaveContent}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                <SyntaxHighlighter language="markdown" style={docco}>
                  {getCleanContent()}
                </SyntaxHighlighter>
                <FileActions 
                  content={getCleanContent()}
                  filename="LLMs.txt"
                  onEdit={handleEditToggle}
                />
              </>
            )}
          </>
        )}
        
        {activeTab === 'discovered-urls' && (
          <>
            <h3>Discovered URLs</h3>
            <div className="file-content">
              <ul className="url-list">
                {result.discovered_urls.map((url, index) => (
                  <li key={index} className="url-list-item">{url}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        {activeTab === 'token-analytics' && (
          <>
            <h3>Token Analytics</h3>
            <p className="tab-description">
              Detailed token usage statistics and cost estimates for your LLMs.txt content.
            </p>
            
            {/* Model selector in the analytics tab */}
            <div className="model-selector-container">
              <label htmlFor="analytics-model-select">AI Model:</label>
              <select 
                id="analytics-model-select"
                value={tokenModel}
                onChange={(e) => setTokenModel(e.target.value)}
                className="model-select-input"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (4K)</option>
                <option value="gpt-4">GPT-4 (8K)</option>
                <option value="gpt-4-32k">GPT-4 (32K)</option>
                <option value="claude-2">Claude 2 (100K)</option>
                <option value="claude-instant">Claude Instant (100K)</option>
                <option value="llama-2-7b">LLaMA 2 7B (4K)</option>
                <option value="llama-2-13b">LLaMA 2 13B (4K)</option>
                <option value="llama-2-70b">LLaMA 2 70B (4K)</option>
              </select>
            </div>
            
            <TokenAnalytics 
              content={getCleanContent()}
              modelName={tokenModel}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default FilePreview;