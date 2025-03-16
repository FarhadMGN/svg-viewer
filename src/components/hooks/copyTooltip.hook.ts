import { useState } from 'react';

const useToolTipCopyText = (): [string, (() => void)] => {
  const [text, setText] = useState('Copy Text');

  const changeText = () => {
    setText('Copied to clipboard!');
    const timer = setTimeout(() => {
        setText('Copy Text');
        clearTimeout(timer);
    }, 5000);
  }
  
  return [text, changeText];
};

export default useToolTipCopyText;