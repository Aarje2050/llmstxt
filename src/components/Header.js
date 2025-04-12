import React from 'react';

function Header() {
  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo">Free LLMs.txt Generator</div>
          <div className="header-right">
            <span style={{ color: '#0171ce', fontWeight: 500 }}>Web Scraping Tool</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;