import { useEffect } from 'react';

export const useMathJaxSelection = () => {
  useEffect(() => {
    let isMouseDown = false;
    
    const handleSelectionChange = () => {
      // Clear previous highlights
      document.querySelectorAll('mjx-container.mjx-selected').forEach(el => {
        el.classList.remove('mjx-selected');
      });
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
      
      // Find all MathJax containers within the selection
      const containers = document.querySelectorAll('mjx-container');
      containers.forEach(container => {
        if (range.intersectsNode(container)) {
          container.classList.add('mjx-selected');
        }
      });
    };
    
    const handleMouseDown = () => {
      isMouseDown = true;
    };
    
    const handleMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        setTimeout(handleSelectionChange, 10);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Handle keyboard selections (Shift+Arrow keys, Ctrl+A, etc.)
      if (e.shiftKey || e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        setTimeout(handleSelectionChange, 10);
      }
    };
    
    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Clean up any remaining highlights
      document.querySelectorAll('mjx-container.mjx-selected').forEach(el => {
        el.classList.remove('mjx-selected');
      });
    };
  }, []);
};