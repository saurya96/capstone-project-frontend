import './SkipLink.css';

function SkipLink({ targetId = 'main-content', children = 'Skip to main content' }) {
  const handleSkip = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
      
      // Remove tabindex after focus to return to natural tab order
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <a href={`#${targetId}`} className="skip-link" onClick={handleSkip}>
      {children}
    </a>
  );
}

export default SkipLink;
