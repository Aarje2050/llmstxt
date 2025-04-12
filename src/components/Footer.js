import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="container">
        <p>LLMs.txt Generator &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export default Footer;