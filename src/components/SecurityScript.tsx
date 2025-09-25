import { useEffect } from 'react';

const SecurityScript: React.FC = () => {
  useEffect(() => {
    // Block developer tools and keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 blockieren
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Strg + Shift + I (Entwicklertools)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 'I'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
      // Strg + Shift + C (Element untersuchen)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 'C'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
      // Strg + Shift + J (Konsole)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 'J'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
      // Strg + U (Seitenquelltext anzeigen)
      if (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
      // Strg + C (Kopieren)
      if (e.ctrlKey && e.keyCode === 'C'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
      // Strg + X (Ausschneiden)
      if (e.ctrlKey && e.keyCode === 'X'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
      // Strg + V (Einfügen)
      if (e.ctrlKey && e.keyCode === 'V'.charCodeAt(0)) {
        e.preventDefault();
        return false;
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Block dragging
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Block copy, cut, paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    // Block developer tools detection
    const devtools = () => {};
    devtools.toString = () => '';
    console.log('%c ', devtools);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  return null;
};

export default SecurityScript;
