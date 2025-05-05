import { Button } from "@mui/material";

// Пример использования в компоненте
const SvgInspectorButton = () => {

    const sender = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log('tabs >> ', tabs);
            const event = 'activate'
            chrome.tabs.sendMessage(tabs?.[0]?.id || 0, { action: event });
        });
    }
  
    return (
      <Button 
        onClick={sender}
      >
        pick from current site
      </Button>
    );
  };
  
  export default SvgInspectorButton;

