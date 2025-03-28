import { useState } from "react";

// Пример использования в компоненте
const SvgInspectorButton = () => {
    const [isActive, setIsActive] = useState(false)

    const sender = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log('tabs >> ', tabs);
            const event = isActive ? 'deactivate' : 'activate'
            chrome.tabs.sendMessage(tabs?.[0]?.id || 0, { action: event });
            setIsActive(!isActive);
        });
    }
  
    return (
      <button 
        onClick={sender}
        style={{
          padding: '8px 16px',
          background: isActive ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isActive ? 'Deactivate SVG Inspector' : 'Activate SVG Inspector'}
      </button>
    );
  };
  
  export default SvgInspectorButton;

