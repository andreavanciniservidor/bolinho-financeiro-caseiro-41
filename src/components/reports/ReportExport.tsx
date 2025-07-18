import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileDown, FileText, Share2, Copy, Check, Calendar, Download } from 'lucide-react';
import { Status } from '@/components/accessibility/LiveRegion';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportExportProps {
  data: any[];
  filters: any;
  charts: React.ReactNode[];
  onSchedule?: (email: string, frequency: string) => Promise<void>;
}

export function ReportExport({ data, filters, charts, onSchedule }: ReportExportProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const { toast } = useToast();
  const shareUrlRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      if (exportFormat === 'pdf') {
        await exportToPDF({
          data,
          filters,
          charts: includeCharts ? charts : [],
          includeRawData
        });
        toast({
          title: 'Relatório exportado com sucesso',
          description: 'O arquivo PDF foi gerado e baixado.',
          variant: 'default',
        });
      } else {
        await exportToExcel({
          data,
          filters,
          includeRawData
        });
        toast({
          title: 'Relatório exportado com sucesso',
          description: 'O arquivo Excel foi gerado e baixado.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro ao exportar relatório',
        description: 'Ocorreu um erro ao gerar o arquivo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    setShareLoading(true);
    try {
      // Simulando a geração de um link compartilhável
      // Em uma implementação real, isso seria uma chamada de API para gerar um link seguro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const baseUrl = window.location.origin;
      const reportId = Math.random().toString(36).substring(2, 15);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Link válido por 7 dias
      
      const shareLink = `${baseUrl}/shared-report/${reportId}?expires=${expiryDate.toISOString()}`;
      setShareUrl(shareLink);
    } catch (error) {
      console.error('Erro ao gerar link compartilhável:', error);
      toast({
        title: 'Erro ao gerar link',
        description: 'Não foi possível gerar o link compartilhável. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl && shareUrlRef.current) {
      try {
        // Usando a API moderna de Clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({
          title: 'Link copiado',
          description: 'O link foi copiado para a área de transferência.',
          variant: 'default',
        });
        
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback para seleção manual se a API Clipboard falhar
        shareUrlRef.current.select();
        shareUrlRef.current.focus();
        
        toast({
          title: 'Ação manual necessária',
          description: 'Por favor, use Ctrl+C (ou Cmd+C) para copiar o link manualmente.',
          variant: 'default',
        });
        
        console.error('Falha ao usar API Clipboard:', err);
      }
    }
  };

  const handleScheduleReport = async () => {
    if (!email) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Informe um e-mail para agendar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (onSchedule) {
        await onSchedule(email, frequency);
      } else {
        // Simulação de agendamento
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: 'Relatório agendado',
        description: `O relatório será enviado ${frequency === 'weekly' ? 'semanalmente' : frequency === 'monthly' ? 'mensalmente' : 'diariamente'} para ${email}.`,
        variant: 'default',
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      toast({
        title: 'Erro ao agendar relatório',
        description: 'Ocorreu um erro ao agendar o envio do relatório. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = () => {
    return format(new Date(), "'Relatório_'dd_MMM_yyyy", { locale: ptBR });
  };

  return (
    <div>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <FileDown className="h-4 w-4" />
        <span>Exportar</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar e Compartilhar Relatório</DialogTitle>
            <DialogDescription>
              Exporte seu relatório em diferentes formatos ou compartilhe com outras pessoas.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Exportar</TabsTrigger>
              <TabsTrigger value="share">Compartilhar</TabsTrigger>
              <TabsTrigger value="schedule">Agendar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="format">Formato</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setExportFormat('pdf')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant={exportFormat === 'excel' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setExportFormat('excel')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Opções</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-charts" 
                      checked={includeCharts} 
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                      disabled={exportFormat === 'excel'}
                    />
                    <Label 
                      htmlFor="include-charts" 
                      className="text-sm cursor-pointer"
                    >
                      Incluir gráficos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-data" 
                      checked={includeRawData} 
                      onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
                    />
                    <Label 
                      htmlFor="include-data" 
                      className="text-sm cursor-pointer"
                    >
                      Incluir dados detalhados
                    </Label>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label className="text-sm text-gray-500">
                    Nome do arquivo: {getFormattedDate()}.{exportFormat === 'pdf' ? 'pdf' : 'xlsx'}
                  </Label>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleExport}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exportando...
                    {/* Região live para leitores de tela */}
                    <Status>Exportando relatório, por favor aguarde.</Status>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    Exportar Relatório
                  </span>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="share" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="share-link">Link compartilhável</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="share-link"
                        ref={shareUrlRef}
                        value={shareUrl}
                        readOnly
                        placeholder="Gere um link para compartilhar este relatório"
                        className="pr-10"
                      />
                      {shareUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={handleCopyLink}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {shareUrl && (
                  <Alert>
                    <AlertDescription>
                      Este link expira em 7 dias e pode ser acessado por qualquer pessoa com o link.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleGenerateShareLink}
                  disabled={shareLoading}
                  aria-busy={shareLoading}
                >
                  {shareLoading ? (
                    <span className="flex items-center">
                      <svg 
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando link...
                      <Status>Gerando link compartilhável, por favor aguarde.</Status>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      {shareUrl ? 'Gerar novo link' : 'Gerar link compartilhável'}
                    </span>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">E-mail para envio</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="frequency">Frequência</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={frequency === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFrequency('daily')}
                    >
                      Diário
                    </Button>
                    <Button
                      variant={frequency === 'weekly' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFrequency('weekly')}
                    >
                      Semanal
                    </Button>
                    <Button
                      variant={frequency === 'monthly' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setFrequency('monthly')}
                    >
                      Mensal
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-charts-email" 
                    checked={includeCharts} 
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <Label 
                    htmlFor="include-charts-email" 
                    className="text-sm cursor-pointer"
                  >
                    Incluir gráficos
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-data-email" 
                    checked={includeRawData} 
                    onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
                  />
                  <Label 
                    htmlFor="include-data-email" 
                    className="text-sm cursor-pointer"
                  >
                    Incluir dados detalhados
                  </Label>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleScheduleReport}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg 
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agendando...
                      <Status>Agendando envio de relatório, por favor aguarde.</Status>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                      Agendar Relatório
                    </span>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}