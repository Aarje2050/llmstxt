import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import UrlInput from './components/UrlInput';
import FilePreview from './components/FilePreview';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeUrl, setActiveUrl] = useState(null);
  const [activeMdFile, setActiveMdFile] = useState(null);
  
  const handleScrape = async (urls, bulkMode = false) => {
    setLoading(true);
    try {
      // Show initial toast
      const toastId = toast.info('Extracting website content. This may take a moment...', { autoClose: false });
      
      // Make API call to backend with bulkMode flag
      const response = await axios.post('https://llmstxt-backend.onrender.com/api/scrape', 
        { urls, bulkMode }, 
        { timeout: 60000 }  // Increase timeout for larger sites
      );
      
      // Update toast
      toast.update(toastId, { 
        render: 'Content extracted successfully!', 
        type: toast.TYPE.SUCCESS,
        autoClose: 3000
      });
      
      // Process the results
      setResults(response.data);
      
      // Set the first URL as active
      if (Object.keys(response.data).length > 0) {
        const firstUrl = Object.keys(response.data)[0];
        setActiveUrl(firstUrl);
        
        // If there are MD files for this URL, set the first one as active
        const urlData = response.data[firstUrl];
        if (urlData.status === 'success' && urlData.md_files) {
          const mdUrls = Object.keys(urlData.md_files);
          if (mdUrls.length > 0) {
            setActiveMdFile(mdUrls[0]);
          }
        }
      }
      
    } catch (error) {
      console.error('Error scraping URLs:', error);
      
      let errorMessage = 'Failed to extract content.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += ` Server error: ${error.response.status}`;
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += ' No response from server. Please check if the backend is running.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += ` Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateLlmsTxt = (url, content) => {
    setResults(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        llms_txt: content
      }
    }));
    toast.success('LLMs.txt content updated');
  };
  
  const handleUpdateMdFile = (url, fileUrl, content) => {
    setResults(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        md_files: {
          ...prev[url].md_files,
          [fileUrl]: {
            ...prev[url].md_files[fileUrl],
            content: content
          }
        }
      }
    }));
    toast.success('Markdown file content updated');
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <UrlInput onScrape={handleScrape} loading={loading} />
          
          {loading && (
            <div className="loader">
              <div className="loader-spinner"></div>
              <p style={{ marginLeft: '1rem' }}>Extracting content from website. This may take a moment...</p>
            </div>
          )}
          
          {results && activeUrl && !loading && (
            <FilePreview 
              results={results} 
              activeUrl={activeUrl}
              activeMdFile={activeMdFile}
              onUrlChange={setActiveUrl}
              onMdFileChange={setActiveMdFile}
              onUpdateLlmsTxt={handleUpdateLlmsTxt}
              onUpdateMdFile={handleUpdateMdFile}
            />
          )}
        </div>
      </main>
      
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;