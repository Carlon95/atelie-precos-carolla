'use client';

import { useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { reportHTML, type PrintReport } from '@/lib/print-report';
import { toast } from 'sonner';

export default function PrintReportButton({ createReport, disabled = false }: { createReport: () => PrintReport; disabled?: boolean }) {
  const [html, setHtml] = useState('');
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  function print() {
    try {
      if (!frame.current?.contentWindow) throw new Error('Relatório indisponível');
      frame.current.contentWindow.focus();
      frame.current.contentWindow.print();
    } catch {
      toast.error('Não foi possível abrir a impressão. Tente em uma aba do Chrome ou Edge.');
    }
  }
  return <>
    <button type="button" className="outline" disabled={disabled} onClick={() => { setReady(false); setHtml(reportHTML(createReport())); }}><Printer size={16}/> Relatório PDF</button>
    <Dialog open={!!html} onOpenChange={open => { if (!open) setHtml(''); }}>
      <DialogContent className="print-report-dialog">
        <DialogHeader><DialogTitle>Relatório para imprimir</DialogTitle><DialogDescription>Confira a prévia. Na janela de impressão, escolha sua impressora ou o destino “Salvar como PDF”. O relatório usa os filtros aplicados.</DialogDescription></DialogHeader>
        <iframe ref={frame} title="Prévia do relatório" srcDoc={html} onLoad={() => setReady(true)} className="print-report-frame"/>
        <div className="report-actions"><button type="button" className="outline" onClick={() => setHtml('')}>Fechar</button><button type="button" className="primary" onClick={print} disabled={!ready}><Printer size={16}/> Salvar em PDF / imprimir</button></div>
      </DialogContent>
    </Dialog>
  </>;
}
