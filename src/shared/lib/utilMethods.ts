// Función para convertir texto a HTML
export const convertToHtml = (text: string): string => {
    if (!text) return "";
    
    let html = text;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const lines = html.split('\n');
    let inList = false;
    let processedLines: string[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${trimmedLine.substring(2).trim()}</li>`);
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<h3>${trimmedLine}</h3>`);
      } else if (trimmedLine) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<p>${trimmedLine}</p>`);
      }
    });
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    return processedLines.join('\n');
  };