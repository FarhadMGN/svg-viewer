import { WorkerMessageTypes } from '../background/types'

/**
 * Notify the service worker (background.js) about contentScript loaded
 */
const tm = setTimeout(() => {
  chrome.runtime.sendMessage({ type: WorkerMessageTypes.sidebarLoaded, payload: true })
  clearTimeout(tm)
}, 500)

// for svg picker
let tooltip: HTMLDivElement | null = null;
let isActive = false;
let svgs: SVGSVGElement[] = []; // Для хранения SVG и их оригинальных стилей

function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.textContent = 'Скопировать SVG-код';
  tooltip.style.cssText = `
    position: absolute;
    background: #fff;
    border: 1px solid #000;
    padding: 5px;
    pointer-events: none;
    z-index: 10000;
    display: none;
  `;
  document.body.appendChild(tooltip);
}

function highlightSvgs() {
  svgs = Array.from(document.querySelectorAll('svg'));
  svgs.forEach(svg => {
    // Сохраняем оригинальный стиль, если он есть
    svg.dataset.originalStyle = svg.getAttribute('style') || '';
    // Добавляем подсветку
    svg.style.outline = '2px solid red';
    svg.style.cursor = 'pointer'; // Указываем, что SVG кликабельны
  });
}

function activateSvgHandlers() {
  svgs.forEach(svg => {
    svg.addEventListener('mouseover', handleMouseOver);
    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('mouseout', handleMouseOut);
    svg.addEventListener('click', handleClick, { capture: true });
  });
}

function removeSvgHandlers() {
  svgs.forEach(svg => {
    svg.removeEventListener('mouseover', handleMouseOver);
    svg.removeEventListener('mousemove', handleMouseMove);
    svg.removeEventListener('mouseout', handleMouseOut);
    svg.removeEventListener('click', handleClick, { capture: true });
    // Восстанавливаем оригинальный стиль
    const originalStyle = svg.dataset.originalStyle;
    if (originalStyle) {
      svg.setAttribute('style', originalStyle);
    } else {
      svg.removeAttribute('style');
    }
  });
  svgs = []; // Очищаем массив
}

// Обработчики событий
const handleMouseOver = () => {
  if (isActive && tooltip) tooltip.style.display = 'block';
};

const handleMouseMove = (e: MouseEvent) => {
  if (isActive && tooltip) {
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
  }
};

const handleMouseOut = () => {
  if (isActive && tooltip) tooltip.style.display = 'none';
};

const handleClick = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (isActive && e?.target) {
    console.log("event = ", e?.target);
    
    // @ts-ignore
    const svgElement = e.target.closest('svg');
    // Создаём клон SVG, чтобы убрать подсветку перед копированием
    const svgClone = svgElement.cloneNode(true);
    const originalStyle = svgElement.dataset.originalStyle;
    
    // Восстанавливаем оригинальный стиль в клоне
    if (originalStyle) {
      svgClone.setAttribute('style', originalStyle);
    } else {
      svgClone.removeAttribute('style');
    }

    const svgCode = svgClone.outerHTML;
    chrome.runtime.sendMessage({ action: 'sendSvgCode', svgCode: svgCode });
  }
};

// Получаем сообщения от sidebar
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'activate') {
    if (!isActive) {
      if (!tooltip) createTooltip();
      highlightSvgs();
      activateSvgHandlers();
      isActive = true;
    }
  } else if (message.action === 'deactivate') {
    if (isActive) {
      removeSvgHandlers();
      if (tooltip) tooltip.style.display = 'none';
      isActive = false;
    }
  }
});

console.log('content script loading');
