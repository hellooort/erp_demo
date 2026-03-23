export const printCSS = [
  '@page{size:A4;margin:15mm}',
  '*{margin:0;padding:0;box-sizing:border-box;font-family:"Malgun Gothic",sans-serif}',
  'body{color:#1e293b;padding:8px}',
  'table{border-collapse:collapse;width:100%}',
  'th,td{border:1px solid #cbd5e1;padding:6px 10px;font-size:11px}',
  'th{background:#334155;color:#fff;font-weight:600}',
  '.doc-title{font-size:22px;font-weight:700;text-align:center;margin-bottom:20px;letter-spacing:6px}',
  '.doc-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}',
  '.doc-info-box{border:1px solid #e2e8f0;padding:10px;border-radius:4px}',
  '.doc-info-box h4{font-size:11px;color:#64748b;margin-bottom:6px;font-weight:600}',
  '.doc-info-row{display:flex;justify-content:space-between;font-size:11px;padding:2px 0}',
  '.doc-label{color:#94a3b8}',
  '.doc-tr{text-align:right}',
  '.doc-tc{text-align:center}',
  '.doc-total-section{margin-top:14px;text-align:right}',
  '.doc-total-row{display:flex;justify-content:flex-end;gap:20px;padding:3px 0;font-size:12px}',
  '.doc-total-row.doc-grand{font-size:16px;font-weight:700;border-top:2px solid #1e293b;padding-top:6px;margin-top:3px}',
  '.doc-stamp-area{margin-top:36px;display:flex;justify-content:flex-end;gap:36px}',
  '.doc-stamp-box{text-align:center;width:70px}',
  '.doc-stamp-box .doc-stamp-line{border-bottom:1px solid #1e293b;height:50px}',
  '.doc-stamp-box .doc-stamp-label{font-size:9px;color:#64748b;margin-top:3px}',
  '.doc-note{margin-top:14px;font-size:11px;border:1px solid #e2e8f0;padding:8px;border-radius:4px}',
  '.doc-note-title{font-weight:600;color:#64748b;margin-bottom:4px}',
].join('\n');

export function doPrint(ref: React.RefObject<HTMLDivElement | null>, title: string) {
  const el = ref.current;
  if (!el) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }

  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' +
    title +
    '</title><style>' +
    printCSS +
    '</style></head><body>' +
    el.innerHTML +
    '</body></html>',
  );
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  };
}
