'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <span className="footer__brand">Cosplay Portfolio</span>
      <span className="footer__copy">&copy; {year} All rights reserved</span>
    </footer>
  );
}
