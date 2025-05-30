import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-darker text-neutral-medium p-6 mt-12 text-center">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} NatuSambilile. All rights reserved.</p>
        <p className="text-sm mt-1">Let us learn</p>
      </div>
    </footer>
  );
};

export default Footer;